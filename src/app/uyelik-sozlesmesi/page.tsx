import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { UyelikSozlesmesiText } from "@/components/legal-texts";

export const metadata: Metadata = { title: "Üyelik Sözleşmesi" };

// Metnin kendisi src/components/legal-texts.tsx içinde (kayıt formundaki pencere de onu
// gösteriyor). Metinde [ŞİRKET UNVANI] ve [PLATFORM ADI] yer tutucuları, alt bardaki unvanla aynı
// olacak şekilde "Prosinta Dijital Teknolojiler A.Ş." ve "Prosinta" ile
// dolduruldu; unvan farklıysa buradan düzeltilir.
export default function UyelikSozlesmesiPage() {
  return (
    <LegalPage title="Üyelik Sözleşmesi" updatedAt="25 Eylül 2026">
      <UyelikSozlesmesiText />
    </LegalPage>
  );
}
