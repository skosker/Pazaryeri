import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { CookiePreferences } from "./cookie-preferences";

export const metadata: Metadata = { title: "Çerez Tercihleri — Prosinta" };

export default function CerezTercihleriPage() {
  return (
    <LegalPage title="Çerez Tercihleri">
      <p>
        Bu web sitesinde kullanılan çerezleri aşağıdan yönetebilirsiniz. Detaylı bilgi için{" "}
        <Link href="/gizlilik-politikasi" className="font-medium text-purple-700 hover:underline">
          Kişisel Verilerin Korunması Politikası
        </Link>{" "}
        metnini inceleyebilirsiniz.
      </p>
      <p>
        Platform hâlihazırda yalnızca zorunlu çerezleri kullanmaktadır. Aşağıdaki tercihleriniz
        kaydedilir ve performans veya reklam çerezleri devreye alındığında uygulanır.
      </p>

      <CookiePreferences />
    </LegalPage>
  );
}
