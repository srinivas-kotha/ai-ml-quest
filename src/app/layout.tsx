import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import TopNav from "@/components/nav/TopNav";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500"],
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
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var stored = localStorage.getItem('aiquest_theme');
                var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProviderWrapper>
          <TopNav />
          <main className="flex-1">{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
