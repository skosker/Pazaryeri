/**
 * CSV files the admin downloads and opens in Excel (Turkish settings): ";" between
 * columns, "," for decimals, CRLF line ends and a BOM so the letters come out right.
 */

type Cell = string | number | null | undefined;

// Excel runs a cell starting with one of these as a formula.
const FORMULA_START = /^[=+\-@\t\r\n]/;

export function csvCell(value: Cell): string {
  if (typeof value === "number") return value.toFixed(2).replace(".", ",");
  let text = String(value ?? "");
  // Names, titles and addresses are typed in by users: a leading "'" keeps one that
  // looks like a formula as plain text instead of running it (CSV injection).
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The whole file: one array per line, the header first. */
export function csvFile(lines: Cell[][]): string {
  return "﻿" + lines.map((line) => line.map(csvCell).join(";")).join("\r\n");
}
