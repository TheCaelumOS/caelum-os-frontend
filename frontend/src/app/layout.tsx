import type { Metadata } from "next";
import "./globals.css";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  metadataBase: new URL("https://caleum.me"),
  title: "Caleum — Building the infrastructure for modern developers.",
  description: "Caleum builds developer infrastructure and operating environments that make cloud, DevOps and software development simpler, faster and more accessible. Flagship product: CaelumOS.",
  alternates: {
    canonical: "https://caleum.me",
  },
  openGraph: {
    title: "Caleum — Building the infrastructure for modern developers.",
    description: "Caleum builds developer infrastructure and operating environments that make cloud, DevOps and software development simpler, faster and more accessible. Flagship product: CaelumOS.",
    url: "https://caleum.me",
    siteName: "Caleum",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caleum — Building the infrastructure for modern developers.",
    description: "Caleum builds developer infrastructure and operating environments that make cloud, DevOps and software development simpler, faster and more accessible. Flagship product: CaelumOS.",
  },
  keywords: [
    "Caleum",
    "CaelumOS",
    "developer infrastructure",
    "cloud infrastructure",
    "DevOps",
    "containers",
    "Kubernetes",
    "Terraform",
    "Git",
    "operating environment"
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    apple: "/icon.svg",
    shortcut: "/icon.svg"
  }
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
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
