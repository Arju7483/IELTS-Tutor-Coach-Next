import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IELTS Coach - AI-Powered IELTS Preparation",
  description: "Master your IELTS with AI-powered coaching. Get personalized feedback on speaking, writing, and vocabulary practice. Improve your band score with intelligent evaluation.",
  keywords: "IELTS preparation, AI coach, IELTS speaking practice, IELTS writing practice, band score improvement, English test preparation",
  authors: [{ name: "IELTS Coach Team" }],
  openGraph: {
    title: "IELTS Coach - AI-Powered IELTS Preparation",
    description: "Master your IELTS with AI-powered coaching and personalized feedback",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Coach - AI-Powered IELTS Preparation",
    description: "Master your IELTS with AI-powered coaching and personalized feedback",
  },
  robots: {
    index: true,
    follow: true,
  },
   verification: {
    google: 'AoRFPDqQlAMksTWzjt5SBGYzR4qQUMGIdU6fCHeOEHY',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
