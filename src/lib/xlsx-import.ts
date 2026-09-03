import ExcelJS from "exceljs";

/**
 * Shared reading/parsing for the admin panel's Excel import screens (Hakediş Ödemeleri,
 * Havale/EFT). An uploaded workbook's first sheet is read as rows keyed by its header
 * row — column order and exact wording are not fixed, since whoever exports the sheet
 * from their own bank/accounting tool will not phrase headers the same way every time.
 */

export type ImportRow = Record<string, unknown>;

/** Reads the first sheet of an uploaded .xlsx file into header-keyed row objects. */
export async function readWorkbookRows(file: File): Promise<ImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers: (string | null)[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const text = cellToText(cell.value);
    headers[colNumber] = text ? text.trim() : null;
  });

  const rows: ImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const record: ImportRow = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      const value = cellToText(cell.value);
      if (value !== "") hasValue = true;
      record[header] = cell.value instanceof Date ? cell.value : value;
    });
    if (hasValue) rows.push(record);
  });

  return rows;
}

/** A cell's displayed text, unwrapping ExcelJS's richer value shapes (formula, hyperlink, rich text). */
function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("result" in value) return cellToText(value.result as ExcelJS.CellValue);
    if ("text" in value) return String((value as { text: unknown }).text);
    if ("richText" in value) {
      return (value as { richText: { text: string }[] }).richText.map((r) => r.text).join("");
    }
    return "";
  }
  return String(value).trim();
}

/**
 * Finds a column by trying several accepted header spellings — case/diacritic-insensitive,
 * so "Ad Soyad", "AD SOYAD" and "ad soyad" all match the same candidate list.
 */
export function findColumn(row: ImportRow, candidates: string[]): unknown {
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase("tr-TR")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "");

  const wanted = new Set(candidates.map(normalize));
  for (const [key, value] of Object.entries(row)) {
    if (wanted.has(normalize(key))) return value;
  }
  return undefined;
}

/** Parses "1.234,56", "1234.56", "1234,56" or a bare number into a positive amount. */
export function parseAmount(raw: unknown): number | null {
  if (typeof raw === "number") return raw > 0 ? raw : null;
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim().replace(/[^\d.,-]/g, "");
  if (!trimmed) return null;

  // "1.234,56" (Turkish) vs "1,234.56" (English) vs a plain "1234.56" / "1234,56": the
  // last separator that appears is the decimal point, whatever comes before it is a
  // thousands separator and gets dropped.
  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");
  let normalized: string;
  if (lastComma > lastDot) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = trimmed.replace(/,/g, "");
  } else {
    normalized = trimmed;
  }

  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Parses an Excel date cell (already a Date), or "gg.aa.yyyy" / "gg/aa/yyyy" text. Falls back to `now`. */
export function parseRowDate(raw: unknown, fallback: Date): Date {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === "string") {
    const m = raw.trim().match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T12:00:00`);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return fallback;
}

export function cellString(raw: unknown): string {
  if (raw instanceof Date) return raw.toISOString();
  return typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();
}
