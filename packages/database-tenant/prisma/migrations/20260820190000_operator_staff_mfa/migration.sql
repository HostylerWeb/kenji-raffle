ALTER TABLE "operator_staff" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "operator_staff" ADD COLUMN IF NOT EXISTS "mfa_secret_encrypted" TEXT;
