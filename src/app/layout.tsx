import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LegalBar } from "@/components/legal-bar";
import { prisma } from "@/lib/prisma";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The footer's category list is read from the database rather than hard-coded, so it
  // stays in step with what an admin adds or removes in /admin/kategoriler. A handful is
  // enough for a footer; they follow the same order as everywhere else.
  const categories = await prisma.category
    .findMany({ orderBy: { order: "asc" }, take: 6, select: { name: true, slug: true } })
    .catch(() => []);

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer categories={categories.map((c) => ({ label: c.name, slug: c.slug }))} />
        <LegalBar />
      </body>
    </html>
  );
}
