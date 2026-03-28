import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import TopNav from "@/components/nav/TopNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI/ML Quest",
  description:
    "Interactive AI/ML learning platform for enterprise engineers pivoting to AI. Master RAG, fine-tuning, monitoring, and more through hands-on challenges.",
  openGraph: {
    title: "AI/ML Quest",
    description:
      "Enterprise-framed AI/ML learning for engineers who already know backend systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "var(--void)", color: "var(--text-primary)" }}
      >
        <SessionProviderWrapper>
          <TopNav />
          <main className="flex-1">{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
