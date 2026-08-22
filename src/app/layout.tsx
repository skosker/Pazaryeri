import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LegalBar } from "@/components/legal-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase turns the relative URLs Next generates for Open Graph and canonical
  // tags into absolute ones. Without it a link shared on WhatsApp or LinkedIn resolves
  // against whatever host happens to render the preview.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prosinta — AI Destekli Profesyonel Hizmet Platformu",
    template: "%s — Prosinta",
  },
  description:
    "Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, dakikalar içinde işine başla.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Prosinta",
    title: "Prosinta — AI Destekli Profesyonel Hizmet Platformu",
    description:
      "Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, dakikalar içinde işine başla.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <LegalBar />
      </body>
    </html>
  );
}
