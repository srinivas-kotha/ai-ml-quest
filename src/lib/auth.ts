import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";
import { questUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "github") return false;

      const authProviderId = account.providerAccountId;
      if (!authProviderId) return false;

      try {
        // Check if user exists by auth_provider_id
        const existing = await db
          .select()
          .from(questUsers)
          .where(eq(questUsers.authProviderId, authProviderId))
          .limit(1);

        if (existing.length === 0) {
          // Create new user
          await db.insert(questUsers).values({
            email: user.email ?? null,
            displayName: user.name ?? null,
            avatarUrl: user.image ?? null,
            authProvider: "github",
            authProviderId,
            role: "user",
          });
        } else {
          // Update existing user fields that may have changed
          await db
            .update(questUsers)
            .set({
              email: user.email ?? existing[0].email,
              displayName: user.name ?? existing[0].displayName,
              avatarUrl: user.image ?? existing[0].avatarUrl,
              lastActiveAt: new Date(),
            })
            .where(eq(questUsers.authProviderId, authProviderId));
        }
        return true;
      } catch (err) {
        console.error("[auth] signIn upsert error:", err);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      // Persist authProviderId and role into the JWT on first sign-in
      if (account && profile) {
        token.authProviderId = account.providerAccountId;

        // Fetch the user's role from DB
        try {
          const dbUser = await db
            .select({ id: questUsers.id, role: questUsers.role })
            .from(questUsers)
            .where(eq(questUsers.authProviderId, account.providerAccountId))
            .limit(1);

          if (dbUser.length > 0) {
            token.userId = dbUser[0].id;
            token.role = dbUser[0].role;
          }
        } catch (err) {
          console.error("[auth] jwt db lookup error:", err);
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Expose userId and role to the session
      if (token.userId) {
        session.user.id = String(token.userId);
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
