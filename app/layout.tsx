import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SurgLog — Surgical Case Logbook & Tracker",
    template: "%s | SurgLog",
  },
  description:
    "The modern digital logbook for surgical trainees. Log operative cases, track ACGME/RCS audit targets, analyze trends, and study with an AI-powered assistant.",
  keywords: [
    "surgical logbook",
    "case tracker",
    "ACGME",
    "surgical training",
    "operative log",
    "medical education",
    "SurgLog",
  ],
  authors: [{ name: "SurgLog Team" }],
  openGraph: {
    title: "SurgLog — Surgical Case Logbook & Tracker",
    description:
      "Log operative cases, track audit targets, and ace surgical exams with AI assistance.",
    siteName: "SurgLog",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
