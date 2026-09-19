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
  metadataBase: new URL("https://caleum.me"),
  title: "CaelumOS — Your Infrastructure. One Unified Environment.",
  description: "CaelumOS is a unified developer environment for cloud infrastructure, containers, infrastructure-as-code, and modern DevOps workflows.",
  alternates: {
    canonical: "https://caleum.me",
  },
  openGraph: {
    title: "CaelumOS — Your Infrastructure. One Unified Environment.",
    description: "CaelumOS is a unified developer environment for cloud infrastructure, containers, infrastructure-as-code, and modern DevOps workflows.",
    url: "https://caleum.me",
    siteName: "CaelumOS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaelumOS — Your Infrastructure. One Unified Environment.",
    description: "CaelumOS is a unified developer environment for cloud infrastructure, containers, infrastructure-as-code, and modern DevOps workflows.",
  },
  keywords: [
    "CaelumOS",
    "cloud infrastructure",
    "developer environment",
    "Docker",
    "Terraform",
    "Kubernetes",
    "AWS",
    "Azure",
    "DevOps",
    "infrastructure as code"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
