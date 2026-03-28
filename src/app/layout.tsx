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
  title: {
    default: "AI/ML Quest — Interactive AI/ML Learning",
    template: "%s | AI/ML Quest",
  },
  description:
    "Master AI/ML Engineering through interactive challenges. Built for enterprise engineers pivoting to AI.",
  keywords: [
    "AI",
    "ML",
    "machine learning",
    "RAG",
    "fine-tuning",
    "LLM",
    "interactive learning",
  ],
  openGraph: {
    type: "website",
    siteName: "AI/ML Quest",
    title: "AI/ML Quest — Interactive AI/ML Learning",
    description: "Master AI/ML Engineering through interactive challenges",
    url: "https://quest.srinivaskotha.uk",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI/ML Quest",
    description: "Master AI/ML Engineering through interactive challenges",
  },
  robots: { index: true, follow: true },
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
