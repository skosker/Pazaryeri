import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Profestia Hakkında — Profestia" };

// Sayfanın metni buraya yazılacak: LegalPage'e çocuk olarak <p>…</p> paragrafları ver,
// metin hazır olduğunda updatedAt="…" ekle. İçerik verilmediği sürece sayfa "metin
// hazırlanıyor" notunu gösterir.
export default function HakkimizdaPage() {
  return <LegalPage title="Profestia Hakkında" />;
}
