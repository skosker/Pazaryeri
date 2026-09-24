import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { KullanimSartlariText } from "@/components/legal-texts";

export const metadata: Metadata = { title: "Kullanım Şartları" };

// Künyede yürürlük tarihi bilinçli olarak yok; metnin kendisi "yayımlandığı tarihte
// yürürlüğe girer" diyor.
export default function KullanimSartlariPage() {
  return (
    <LegalPage title="Kullanım Şartları">
      <KullanimSartlariText />
    </LegalPage>
  );
}
