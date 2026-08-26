ALTER TABLE "operator_settings"
  ADD COLUMN IF NOT EXISTS "footer_logo_url" TEXT,
  ADD COLUMN IF NOT EXISTS "theme_preset" TEXT DEFAULT 'kenji-green',
  ADD COLUMN IF NOT EXISTS "theme_config" JSONB;
