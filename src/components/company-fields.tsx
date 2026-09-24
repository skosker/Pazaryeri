"use client";

import { useState } from "react";
import { Combobox } from "@/components/combobox";
import { CITIES, cityByName } from "@/lib/tr-locations";
import { TAX_OFFICES } from "@/lib/tax-offices";

export type CompanyFieldValues = {
  companyName?: string;
  billingCity?: string;
  billingDistrict?: string;
  taxOffice?: string;
  taxNumber?: string;
  billingAddress?: string;
};

const CITY_NAMES = CITIES.map((c) => c.name);

/**
 * Şirket fatura bilgileri, shared by the corporate sign-up and Profil → Fatura Bilgileri.
 * İl, ilçe and vergi dairesi are picked from lists; ilçe and vergi dairesi follow the il.
 */
export function CompanyFields({ defaults, inputClass }: { defaults?: CompanyFieldValues; inputClass: string }) {
  const [city, setCity] = useState(defaults?.billingCity && cityByName(defaults.billingCity) ? defaults.billingCity : "");
  const [district, setDistrict] = useState(defaults?.billingDistrict ?? "");
  // A tax office typed freely before these lists existed is kept only if it is on the list.
  const [taxOffice, setTaxOffice] = useState(defaults?.taxOffice ?? "");

  const selected = cityByName(city);
  const districts = selected?.districts ?? [];
  const offices = selected ? (TAX_OFFICES[selected.code] ?? []) : [];

  const label = "flex flex-col gap-1.5 text-sm font-medium text-brand-navy";

  return (
    <>
      <label className={label}>
        Şirket Unvanı
        <input
          name="companyName"
          defaultValue={defaults?.companyName}
          type="text"
          required
          autoComplete="organization"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={label}>
          İl
          <Combobox
            name="billingCity"
            options={CITY_NAMES}
            value={city}
            onChange={(next) => {
              if (next === city) return;
              setCity(next);
              setDistrict("");
              setTaxOffice("");
            }}
            required
            className={inputClass}
          />
        </div>
        <div className={label}>
          İlçe
          <Combobox
            name="billingDistrict"
            options={districts}
            value={districts.includes(district) ? district : ""}
            onChange={setDistrict}
            placeholder={selected ? undefined : "Önce il seçin"}
            disabled={!selected}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={label}>
          Vergi Dairesi
          <Combobox
            name="taxOffice"
            options={offices}
            value={offices.includes(taxOffice) ? taxOffice : ""}
            onChange={setTaxOffice}
            placeholder={selected ? undefined : "Önce il seçin"}
            disabled={!selected}
            required
            className={inputClass}
          />
        </div>
        <label className={label}>
          Vergi Numarası
          <input
            name="taxNumber"
            defaultValue={defaults?.taxNumber}
            type="text"
            inputMode="numeric"
            required
            pattern="[0-9 ]{10,13}"
            className={inputClass}
          />
        </label>
      </div>

      <label className={label}>
        Açık Adres
        <textarea
          name="billingAddress"
          defaultValue={defaults?.billingAddress}
          required
          rows={2}
          autoComplete="street-address"
          className={inputClass}
        />
      </label>
    </>
  );
}
