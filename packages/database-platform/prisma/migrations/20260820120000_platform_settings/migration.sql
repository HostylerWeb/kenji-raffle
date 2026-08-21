-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "tenant_base_domain" TEXT NOT NULL DEFAULT 'kenji-raffle.local',
    "alert_email" TEXT,
    "rollup_schedule" TEXT NOT NULL DEFAULT '0 2 * * *',
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "platform_settings" ("id", "tenant_base_domain", "rollup_schedule", "updated_at")
VALUES ('default', 'kenji-raffle.local', '0 2 * * *', NOW());
