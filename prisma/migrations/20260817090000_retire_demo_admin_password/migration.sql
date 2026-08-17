-- The demo admin was seeded with a password published on the login page, which on a
-- public deployment hands anyone the admin panel. The account is kept (it may own
-- data and the panel needs an admin) but its password is replaced with a value no
-- bcrypt comparison can ever match, so the account cannot be logged into until an
-- operator sets a real password with `npm run admin:sifre`.
--
-- '!' is not a valid bcrypt hash, so bcrypt.compare returns false for every input
-- rather than throwing.
UPDATE "users"
SET "passwordHash" = '!disabled-until-an-operator-sets-a-password'
WHERE "email" = 'admin@profestia.dev'
  AND "passwordHash" = '$2b$10$K20ngPjf0ZYxdxSQlFYR4.RDkNWS39orguZOLJ9okOUPwbmx7jcEO';
