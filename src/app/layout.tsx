import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter"
});

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://test.nxtdev.in"),
  title: {
    default: "UPSC Tracker — Executive Preparation & Syllabus Suite",
    template: "%s | UPSC Tracker"
  },
  description:
    "Executive-level UPSC Civil Services Examination (CSE) preparation suite featuring automated GS & Optional syllabus tracking, 12-stage spaced repetition revision engine, focus timer, daily study timetables, and performance analytics.",
  applicationName: "UPSC Tracker",
  authors: [{ name: "UPSC Tracker Team", url: "https://test.nxtdev.in" }],
  generator: "Next.js",
  keywords: [
    "UPSC Tracker",
    "UPSC CSE",
    "UPSC Study Planner",
    "UPSC Syllabus Tracker",
    "Spaced Repetition Engine",
    "IAS Preparation Suite",
    "Civil Services Examination",
    "GS Syllabus Matrix",
    "Study Focus Timer",
    "Mock Test Analytics"
  ],
  referrer: "origin-when-cross-origin",
  creator: "UPSC Tracker",
  publisher: "nxtdev.in",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://test.nxtdev.in"
  },
  openGraph: {
    title: "UPSC Tracker — Executive Preparation & Syllabus Suite",
    description:
      "Executive study management suite for UPSC Civil Services Examination (CSE) aspirants: automated 12-stage revision pipelines, GS & Optional syllabus matrix, daily timetable, and mock test analytics.",
    url: "https://test.nxtdev.in",
    siteName: "UPSC Tracker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UPSC Tracker — Executive Study & Syllabus Management Suite",
        type: "image/png"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "UPSC Tracker — Executive Preparation & Syllabus Suite",
    description:
      "Executive study management suite for UPSC Civil Services Examination (CSE) aspirants: automated 12-stage revision pipelines, GS & Optional syllabus matrix, daily timetable, and mock test analytics.",
    images: ["/og-image.png"],
    creator: "@nxtdev_in"
  },
  verification: {
    google: "BBC_-UN0nPiBk5hGBTmMDhj7ryHNoMVGZ9viAgJQWAQ"
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPSC Tracker"
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/icon-192.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.className, inter.variable)} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="BBC_-UN0nPiBk5hGBTmMDhj7ryHNoMVGZ9viAgJQWAQ" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
