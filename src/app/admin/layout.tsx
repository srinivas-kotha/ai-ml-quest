import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const metadata = {
  title: "Admin — AI/ML Quest",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--void)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col"
        style={{
          backgroundColor: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          className="px-4 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Admin
          </p>
          <p
            className="text-sm font-semibold mt-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            AI/ML Quest
          </p>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/analytics">Analytics</NavLink>

          <p
            className="px-2 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Content
          </p>
          <NavLink href="/admin?tab=chapters">Chapters</NavLink>
          <NavLink href="/admin?tab=levels">Levels</NavLink>

          <div
            className="mt-auto pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <NavLink href="/">Back to Site</NavLink>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-md text-sm transition-colors"
      style={{
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </Link>
  );
}
