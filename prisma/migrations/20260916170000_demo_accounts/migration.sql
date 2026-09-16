-- Hazır, e-posta doğrulaması gerektirmeyen bir demo Alıcı ve bir demo Freelancer hesabı.
-- Şifre her ikisi için de Demo1234! (bcrypt hash'i scripts/create-demo-accounts.ts ile
-- aynı yöntemle üretildi). O script daha sonra şifreyi sıfırlamak için de kullanılabilir.

INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "emailVerified", "suspended", "synthetic", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Demo Alıcı', 'demo-alici@prosinta.com', '$2b$10$CWTiaZPIWYuQmkD7hOyL.eYLKqgWA52/FOyJhoaJu8LQUdpJ7OQ2e', 'BUYER'::"Role", now(), false, false, now(), now()),
  (gen_random_uuid()::text, 'Demo Freelancer', 'demo-freelancer@prosinta.com', '$2b$10$CWTiaZPIWYuQmkD7hOyL.eYLKqgWA52/FOyJhoaJu8LQUdpJ7OQ2e', 'FREELANCER'::"Role", now(), false, false, now(), now())
ON CONFLICT ("email") DO NOTHING;
