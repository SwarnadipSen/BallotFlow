import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { validateEnv } from "@/lib/env";
import "./globals.css";

// Run validation on the server
if (typeof window === "undefined") {
  validateEnv();
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BallotFlow — Your AI Election Guide",
  description:
    "Understand elections, voter registration, timelines, and your civic rights with BallotFlow — a free, non-partisan AI election assistant powered by Google Gemini.",
  keywords: [
    "election guide",
    "voter registration",
    "how to vote",
    "election process",
    "civic education",
    "AI assistant",
    "ballot",
    "democracy",
  ],
  openGraph: {
    title: "BallotFlow — Your AI Election Guide",
    description:
      "Free, non-partisan AI assistant to help you understand elections and participate in democracy.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
