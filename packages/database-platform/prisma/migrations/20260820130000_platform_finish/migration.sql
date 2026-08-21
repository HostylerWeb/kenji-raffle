-- AlterTable
ALTER TABLE "operator_settings" ADD COLUMN IF NOT EXISTS "feature_flags" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "mfa_secret_encrypted" TEXT;
