-- CreateEnum
CREATE TYPE "operator_status" AS ENUM ('onboarding', 'active', 'suspended', 'archived', 'onboarding_failed');

-- CreateEnum
CREATE TYPE "domain_type" AS ENUM ('subdomain', 'custom');

-- CreateEnum
CREATE TYPE "domain_verification_status" AS ENUM ('pending', 'verified', 'failed');

-- CreateEnum
CREATE TYPE "ssl_status" AS ENUM ('pending', 'active');

-- CreateEnum
CREATE TYPE "tenant_database_status" AS ENUM ('provisioning', 'active', 'failed');

-- CreateEnum
CREATE TYPE "platform_role" AS ENUM ('platform_admin', 'platform_support');

-- CreateTable
CREATE TABLE "operators" (
    "id" UUID NOT NULL,
    "gra_registry_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "operator_status" NOT NULL DEFAULT 'onboarding',
    "licence_number" TEXT,
    "default_tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.30,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_databases" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "database_name" TEXT NOT NULL,
    "database_host" TEXT NOT NULL,
    "database_port" INTEGER NOT NULL,
    "database_user" TEXT NOT NULL,
    "database_password_encrypted" TEXT NOT NULL,
    "connection_url_encrypted" TEXT NOT NULL,
    "schema_version" TEXT NOT NULL DEFAULT '0',
    "provisioned_at" TIMESTAMPTZ(6),
    "status" "tenant_database_status" NOT NULL DEFAULT 'provisioning',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_databases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_domains" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "hostname" TEXT NOT NULL,
    "domain_type" "domain_type" NOT NULL,
    "verification_status" "domain_verification_status" NOT NULL DEFAULT 'pending',
    "ssl_status" "ssl_status" NOT NULL DEFAULT 'pending',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_settings" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "logo_url" TEXT,
    "primary_color" TEXT,
    "support_email" TEXT,
    "footer_licence_text" TEXT,
    "social_links" JSONB,
    "gra_api_key_encrypted" TEXT,
    "gra_hmac_secret_encrypted" TEXT,
    "payment_merchant_ref_encrypted" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "operator_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "platform_role" NOT NULL DEFAULT 'platform_support',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_audit_logs" (
    "id" UUID NOT NULL,
    "platform_user_id" UUID,
    "operator_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_daily_rollups" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "gross_sales" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_collected" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "orders_count" INTEGER NOT NULL DEFAULT 0,
    "active_raffles" INTEGER NOT NULL DEFAULT 0,
    "failed_gra_events" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_daily_rollups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operators_gra_registry_id_key" ON "operators"("gra_registry_id");

-- CreateIndex
CREATE UNIQUE INDEX "operators_slug_key" ON "operators"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_databases_operator_id_key" ON "tenant_databases"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "operator_domains_hostname_key" ON "operator_domains"("hostname");

-- CreateIndex
CREATE INDEX "operator_domains_operator_id_idx" ON "operator_domains"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "operator_settings_operator_id_key" ON "operator_settings"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_users_email_key" ON "platform_users"("email");

-- CreateIndex
CREATE INDEX "platform_audit_logs_operator_id_idx" ON "platform_audit_logs"("operator_id");

-- CreateIndex
CREATE INDEX "platform_audit_logs_created_at_idx" ON "platform_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "tenant_daily_rollups_date_idx" ON "tenant_daily_rollups"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_daily_rollups_operator_id_date_key" ON "tenant_daily_rollups"("operator_id", "date");

-- AddForeignKey
ALTER TABLE "tenant_databases" ADD CONSTRAINT "tenant_databases_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_domains" ADD CONSTRAINT "operator_domains_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_settings" ADD CONSTRAINT "operator_settings_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_daily_rollups" ADD CONSTRAINT "tenant_daily_rollups_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
