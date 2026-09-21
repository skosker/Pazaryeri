/**
 * One-off driver that writes a migration.sql unpublishing the duplicate-subject gigs the
 * original bulk-seller catalogue (fl1..fl120@profestia.dev) shipped with.
 *
 * `bulk-gigs-data.ts`'s `pickSeller` now walks forward to the next free seller specifically
 * to stop one seller collecting the same subject under every verb ("Pazarlama stratejinizi
 * veriyorum / hazırlıyorum / yönetiyorum / kuruyorum" all on one profile) — but that fix
 * postdates the two migrations that already wrote this catalogue
 * (20260807140407_bulk_gigs_50_per_category, 20260810090945_expand_bulk_catalog), so the
 * rows those migrations inserted still have the duplication baked in.
 *
 * This script parses those two migration files directly (never a live database — there
 * is none to read from here), matches each gig's title against its category's known
 * subject list to recover which subject it is, groups by (seller, subject), and for every
 * group of more than one keeps a single gig and unpublishes the rest. Unpublishing rather
 * than deleting matches the app's own rule for a gig with order history
 * (panel/ilanlarim/actions.ts, admin/ilanlar/actions.ts): some of these exact slugs already
 * have seeded orders/reviews (20260810140000_seed_freelancer_reviews), so removing the rows
 * would orphan that history.
 */

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { categoryContentsForCollapse } from "../prisma/bulk-gigs-data";

const FILES = [
  "prisma/migrations/20260807140407_bulk_gigs_50_per_category/migration.sql",
  "prisma/migrations/20260810090945_expand_bulk_catalog/migration.sql",
];

const REVIEWED_SLUGS_FILE = "prisma/migrations/20260810140000_seed_freelancer_reviews/migration.sql";

type Row = { id: string; slug: string; title: string; sellerEmail: string; categorySlug: string; verb?: string };

function parseGigRows(text: string): Row[] {
  const rows: Row[] = [];
  // Every gig row is one line: ('bulk-gig-291', 'slug', 'Title', 'description', 'color',
  // true, (SELECT id FROM "users" WHERE email = '...'), (SELECT id FROM "categories" WHERE
  // slug = '...'), [optional subcategory subquery], now(), now()),
  const lineRe = /^ {2}\('(bulk-gig[^']*)',\s*'([^']*)',\s*'((?:[^'\\]|'')*)',/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(text))) {
    const id = m[1];
    const slug = m[2];
    const title = m[3].replace(/''/g, "'");
    const rest = text.slice(m.index, text.indexOf("\n", m.index));
    const emailMatch = rest.match(/email = '([^']+)'/);
    const catMatch = rest.match(/"categories" WHERE slug = '([^']+)'/);
    if (!emailMatch || !catMatch) continue;
    rows.push({ id, slug, title, sellerEmail: emailMatch[1], categorySlug: catMatch[1] });
  }
  return rows;
}

/** Gig slugs the 20260810140000 migration already gave seeded orders/reviews to — kept
 * preferentially within a duplicate group so a gig with real review history is never the
 * one that disappears from listings. */
function parseReviewedSlugs(): Set<string> {
  const text = readFileSync(REVIEWED_SLUGS_FILE, "utf8");
  const slugs = new Set<string>();
  const re = /slug = '([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) slugs.add(m[1]);
  return slugs;
}

/**
 * 20260817140000_fix_gig_title_grammar rewrote titles in the live database after these two
 * migrations already shipped — some just a spelling fix, others swapping the actual verb
 * ("Pazarlama stratejinizi veriyorum" is now "...hazırlıyorum"), and a few rewriting the
 * subject text itself ("Sunum (PowerPoint) tasarımınızı" is now "Sunumunuzu (PowerPoint)").
 * The text this script parses from the two source migrations is pre-fix, so every parsed
 * title is run through this same chain (same replacements, same order: innermost
 * regexp_replace in that migration's nesting runs first) before anything else touches it —
 * otherwise a "kept" title rewritten to aorist here would silently undo that migration's
 * correction.
 */
function applyGrammarFix(title: string): string {
  let t = title;
  t = t.replace(/mikslıyorum/g, "miksliyorum");
  t = t.replace(/(Kartvizit|Ambalaj) tasarımınızı/g, "$1ınızı");
  t = t.replace(/Broşür ve katalog tasarımınızı/g, "Broşür ve kataloğunuzu");
  t = t.replace(/El ilanı \(flyer\) tasarımınızı/g, "El ilanınızı (flyer)");
  t = t.replace(/Sunum \(PowerPoint\) tasarımınızı/g, "Sunumunuzu (PowerPoint)");
  t = t.replace(/Banner ve afiş tasarımınızı/g, "Banner ve afişinizi");
  t = t.replace(
    /(kaydınızı|bölümünüzü|efektlerinizi|mesajınızı|spotunuzu|prodüksiyonunuzu)( özenle)? besteliyorum/g,
    "$1$2 düzenliyorum"
  );
  t = t.replace(
    /(raporunuzu|analizinizi|verilerinizi|segmentasyonunuzu|sorgularınızı)( sıfırdan)? kuruyorum/g,
    "$1 hazırlıyorum"
  );
  t = t.replace(
    /(kurulumunuzu|panelinizi|modelinizi|sorgularınızı)( düzenli)? raporluyorum/g,
    "$1 yapılandırıyorum"
  );
  t = t.replace(
    /(planınızı|projeksiyonlarınızı|sunumunuzu|stratejinizi|programınızı)( detaylıca)? veriyorum/g,
    "$1 hazırlıyorum"
  );
  t = t.replace(
    /(süreçlerinizi|çalışmanızı|huninizi|sürecinizi|operasyonunuzu)( detaylıca)? veriyorum/g,
    "$1 yönetiyorum"
  );
  t = t.replace(/(koçluğunuzu|danışmanlığınızı)( sabırla)? anlatıyorum/g, "$1 veriyorum");
  return t;
}

function subjectFor(categorySlug: string, title: string): { subject: string; verb: string } | null {
  const cat = categoryContentsForCollapse.find((c: { slug: string }) => c.slug === categorySlug);
  if (!cat) return null;
  // Verbs are sorted longest-first so a multi-word extra-wave verb ("yeniden tasarlıyorum")
  // is tried before the base verb it contains ("tasarlıyorum") would also match as a suffix.
  const verb = [...cat.verbs].sort((a: string, b: string) => b.length - a.length).find((v: string) => title.endsWith(` ${v}`));
  if (!verb) return null;
  return { subject: title.slice(0, title.length - verb.length).trim(), verb };
}

/**
 * 1st-person aorist ("geniş zaman") forms for every progressive ("-Iyorum") verb the
 * bulk catalogue's generator uses — keyed by the verb phrase's LAST word, since every
 * phrase's actual conjugated word is its last token (adverb/noun modifiers like "özenle",
 * "sıfırdan", or a compound's fixed noun part like "gözden", "hale" never conjugate, so
 * leaving them untouched and rewriting only the last word is always correct here).
 */
const AORIST_BY_LAST_WORD: Record<string, string> = {
  tasarlıyorum: "tasarlarım",
  hazırlıyorum: "hazırlarım",
  oluşturuyorum: "oluştururum",
  çiziyorum: "çizerim",
  geliştiriyorum: "geliştiririm",
  kuruyorum: "kurarım",
  ediyorum: "ederim",
  yeniliyorum: "yenilerim",
  iyileştiriyorum: "iyileştiririm",
  artırıyorum: "artırırım",
  ölçüyorum: "ölçerim",
  yazıyorum: "yazarım",
  düzenliyorum: "düzenlerim",
  çeviriyorum: "çeviririm",
  getiriyorum: "getiririm",
  kurguluyorum: "kurgularım",
  canlandırıyorum: "canlandırırım",
  yönetiyorum: "yönetirim",
  planlıyorum: "planlarım",
  yürütüyorum: "yürütürüm",
  kaydediyorum: "kaydederim",
  besteliyorum: "bestelerim",
  miksliyorum: "mikslerim",
  temizliyorum: "temizlerim",
  yapıyorum: "yaparım",
  seslendiriyorum: "seslendiririm",
  üstleniyorum: "üstlenirim",
  tamamlıyorum: "tamamlarım",
  veriyorum: "veririm",
  geçiriyorum: "geçiririm",
  modelliyorum: "modellerim",
  güncelliyorum: "güncellerim",
  güçlendiriyorum: "güçlendiririm",
  anlatıyorum: "anlatırım",
  otomatikleştiriyorum: "otomatikleştiririm",
  raporluyorum: "raporlarım",
  görselleştiriyorum: "görselleştiririm",
  yorumluyorum: "yorumlarım",
  hızlandırıyorum: "hızlandırırım",
  yapılandırıyorum: "yapılandırırım",
};

/** Rewrites just the title's last word (the conjugated verb) to its aorist form; returns
 * null when that word has no mapped aorist form (never happens for this catalogue's
 * closed verb set, but kept explicit rather than silently leaving a mismatched title). */
function toAorist(title: string): string | null {
  const words = title.split(" ");
  const last = words[words.length - 1];
  const aorist = AORIST_BY_LAST_WORD[last];
  if (!aorist) return null;
  words[words.length - 1] = aorist;
  return words.join(" ");
}

function main() {
  const allRows = FILES.flatMap((f) => parseGigRows(readFileSync(f, "utf8")));
  console.log(`parsed ${allRows.length} bulk-gig INSERT statements`);

  // expand_bulk_catalog's own gigs insert ends "ON CONFLICT (slug) DO NOTHING" — and it
  // re-emits every slug the first migration already used (results in a fresh generator run
  // covering both the original wave and the new one), so those repeats never actually
  // landed as rows. Keep only the first occurrence of each slug, in file order, which is
  // also insertion order.
  const seenSlugs = new Set<string>();
  const rows: Row[] = [];
  for (const row of allRows) {
    if (seenSlugs.has(row.slug)) continue;
    seenSlugs.add(row.slug);
    rows.push(row);
  }
  console.log(`${allRows.length - rows.length} were slug collisions skipped by ON CONFLICT; ${rows.length} rows actually exist`);

  let grammarFixed = 0;
  for (const row of rows) {
    const fixed = applyGrammarFix(row.title);
    if (fixed !== row.title) grammarFixed++;
    row.title = fixed;
  }
  console.log(`${grammarFixed} titles updated to their post-grammar-fix current text`);

  const reviewedSlugs = parseReviewedSlugs();

  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const match = subjectFor(row.categorySlug, row.title);
    if (!match) {
      console.warn(`no subject match for "${row.title}" (${row.categorySlug}), skipping`);
      continue;
    }
    row.verb = match.verb;
    const key = `${row.sellerEmail}\u0000${match.subject}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  const toUnpublish: string[] = [];
  const toRetense: { id: string; title: string }[] = [];
  let sellersAffected = 0;
  let keptForReviews = 0;
  let keptIndex = 0;
  let noAoristFor = 0;
  for (const [, group] of groups) {
    if (group.length <= 1) continue;
    sellersAffected++;
    // Prefer keeping a gig that already has seeded orders/reviews attached to its slug —
    // otherwise the fix would hide the one with real social proof and leave a review-less
    // duplicate visible. Falls back to the lowest id (first inserted) when none qualify,
    // or when more than one does (keeps the first of those, deterministically).
    const reviewed = group.filter((g) => reviewedSlugs.has(g.slug));
    if (reviewed.length > 0) keptForReviews++;
    const pool = reviewed.length > 0 ? reviewed : group;
    const keep = [...pool].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))[0];
    for (const row of group) {
      if (row.id !== keep.id) toUnpublish.push(row.id);
    }

    // Every kept title currently ends in the "-Iyorum" progressive form (that's what the
    // generator wrote); alternate half of them to the aorist ("geniş zaman") form so the
    // catalogue reads with some tense variety instead of every listing saying "...ıyorum".
    keptIndex++;
    if (keptIndex % 2 === 0) {
      const retensed = toAorist(keep.title);
      if (retensed) toRetense.push({ id: keep.id, title: retensed });
      else noAoristFor++;
    }
  }

  console.log(`${sellersAffected} (seller, subject) groups had duplicates`);
  console.log(`${keptForReviews} of those kept a gig specifically for its review history`);
  console.log(`${toUnpublish.length} gigs to unpublish`);
  console.log(`${toRetense.length} kept titles rewritten to aorist tense (${noAoristFor} skipped: no mapped aorist form)`);

  toUnpublish.sort();
  toRetense.sort((a, b) => a.id.localeCompare(b.id));

  function sqlQuote(value: string) {
    return `'${value.replace(/'/g, "''")}'`;
  }

  const sql =
    `-- Bulk-seller catalogue (fl1..fl120@profestia.dev) tanıttığında, "pickSeller" henüz\n` +
    `-- çakışma önleme yürütmediği için bazı satıcılar aynı konuyu farklı fiillerle tekrar\n` +
    `-- eden birden çok ilan aldı (ör. "Pazarlama stratejinizi veriyorum / hazırlıyorum /\n` +
    `-- yönetiyorum / kuruyorum" hepsi aynı profilde). Her (satıcı, konu) grubunda ilk ilan\n` +
    `-- kalır (bazılarına zaten sipariş/yorum geçmişi bağlı), geri kalanı silinmeden\n` +
    `-- yayından kaldırılır — panel/ilanlarim ve admin/ilanlar'daki "sipariş geçmişi olan\n` +
    `-- ilan silinmez, yayından kaldırılır" kuralıyla aynı yaklaşım.\n` +
    `--\n` +
    `-- scripts/emit-collapse-bulk-duplicate-gigs.ts tarafından üretildi.\n\n` +
    `UPDATE "gigs" SET "published" = false WHERE "id" IN (\n` +
    toUnpublish.map((id) => `  '${id}'`).join(",\n") +
    `\n);\n\n` +
    `-- Kalan ilanların hepsi "-yorum" ile bitmesin diye yarısını geniş zamana (aorist)\n` +
    `-- çeviriyor — slug'lar (ve dolayısıyla yayında olan bağlantılar) dokunulmadan kalır,\n` +
    `-- yalnızca "title" değişir; tıpkı 20260817140000_fix_gig_title_grammar'ın yaptığı gibi.\n\n` +
    `UPDATE "gigs" AS g SET "title" = v.title\n` +
    `FROM (VALUES\n` +
    toRetense.map(({ id, title }) => `  (${sqlQuote(id)}, ${sqlQuote(title)})`).join(",\n") +
    `\n) AS v(id, title)\n` +
    `WHERE g."id" = v.id;\n`;

  const dir = "prisma/migrations/20260921100000_collapse_bulk_duplicate_gigs";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);
  console.log(`wrote ${dir}/migration.sql`);
}

main();
