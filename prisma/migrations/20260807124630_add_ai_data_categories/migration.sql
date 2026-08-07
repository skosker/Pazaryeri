-- Add Upwork-inspired "AI & Automation" and "Data & Analytics" categories.
INSERT INTO "categories" ("id", "name", "slug", "icon")
VALUES
  ('cat-ai-otomasyon-001', 'AI & Otomasyon', 'ai-otomasyon', 'cpu'),
  ('cat-veri-analitik-001', 'Veri & Analitik', 'veri-analitik', 'chart')
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "icon" = EXCLUDED."icon";
