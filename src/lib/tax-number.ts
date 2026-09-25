/**
 * Turkish tax identifiers: a company's 10-digit VKN, or — for a sole proprietorship, which
 * is taxed under its owner — the 11-digit TCKN. Both carry check digits, so a typo is caught
 * here rather than on the invoice.
 */
export function isValidTaxNumber(raw: string): boolean {
  const v = raw.replace(/\s/g, "");
  if (/^\d{10}$/.test(v)) return isValidVkn(v);
  if (/^\d{11}$/.test(v)) return isValidTckn(v);
  return false;
}

function isValidVkn(v: string): boolean {
  const d = v.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (d[i] + 9 - i) % 10;
    let tmp2 = (tmp * 2 ** (9 - i)) % 9;
    if (tmp !== 0 && tmp2 === 0) tmp2 = 9;
    sum += tmp2;
  }
  return (10 - (sum % 10)) % 10 === d[9];
}

export function isValidTckn(v: string): boolean {
  if (!/^\d{11}$/.test(v)) return false;
  const d = v.split("").map(Number);
  if (d[0] === 0) return false;
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const tenth = (((odd * 7 - even) % 10) + 10) % 10;
  const eleventh = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d[9] === tenth && d[10] === eleventh;
}
