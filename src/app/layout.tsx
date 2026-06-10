import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import QueryProvider from "@/components/providers/query-provider";
import SessionProvider from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhisperLink — Anonymous Feedback",
    template: "%s | WhisperLink",
  },
  description:
    "Send anonymous messages. Receive honest feedback. WhisperLink lets you share a link and collect genuine, anonymous thoughts from anyone.",
  keywords: "anonymous, feedback, messages, whisper",
  openGraph: {
    title: "WhisperLink",
    description: "Anonymous feedback. Meaningful conversations.",
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
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
