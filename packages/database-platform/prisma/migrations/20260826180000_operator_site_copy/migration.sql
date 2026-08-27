ALTER TABLE operator_settings
  ADD COLUMN IF NOT EXISTS site_copy JSONB;
