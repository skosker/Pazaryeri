-- Seed a demo admin account so the admin panel can be tried without manual DB access.
INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "emailVerified", "suspended", "createdAt", "updatedAt")
VALUES (
  'demo-admin-seed-001',
  'Profestia Admin',
  'admin@profestia.dev',
  '$2b$10$K20ngPjf0ZYxdxSQlFYR4.RDkNWS39orguZOLJ9okOUPwbmx7jcEO',
  'ADMIN',
  now(),
  false,
  now(),
  now()
)
ON CONFLICT ("email") DO UPDATE SET
  "role" = 'ADMIN',
  "emailVerified" = now(),
  "suspended" = false;
