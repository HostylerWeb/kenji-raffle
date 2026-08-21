-- AlterEnum
ALTER TYPE "order_status" ADD VALUE IF NOT EXISTS 'refunded';

-- CreateEnum
CREATE TYPE "site_credit_transaction_type" AS ENUM ('credit', 'debit');

-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kyc_document_url" TEXT;

-- AlterTable raffles
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "scheduled_draw_at" TIMESTAMPTZ(6);

-- AlterTable orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "site_credit_applied" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- AlterTable coupons
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "max_uses_per_user" INTEGER;

-- AlterTable instant_win_prizes
ALTER TABLE "instant_win_prizes" ADD COLUMN IF NOT EXISTS "group_id" UUID;

-- CreateTable instant_win_groups
CREATE TABLE IF NOT EXISTS "instant_win_groups" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "instant_win_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable raffle_quantity_discounts
CREATE TABLE IF NOT EXISTS "raffle_quantity_discounts" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "discount_type" "coupon_discount_type" NOT NULL,
    "discount_value" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "raffle_quantity_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable site_credit_transactions
CREATE TABLE IF NOT EXISTS "site_credit_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" "site_credit_transaction_type" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable gra_session_aggregates
CREATE TABLE IF NOT EXISTS "gra_session_aggregates" (
    "id" UUID NOT NULL,
    "hour_start" TIMESTAMPTZ(6) NOT NULL,
    "county" TEXT,
    "stake_band" TEXT NOT NULL,
    "session_count" INTEGER NOT NULL DEFAULT 0,
    "ticket_count" INTEGER NOT NULL DEFAULT 0,
    "total_stake" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gra_session_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "instant_win_groups_raffle_id_idx" ON "instant_win_groups"("raffle_id");
CREATE INDEX IF NOT EXISTS "instant_win_prizes_group_id_idx" ON "instant_win_prizes"("group_id");
CREATE INDEX IF NOT EXISTS "raffle_quantity_discounts_raffle_id_idx" ON "raffle_quantity_discounts"("raffle_id");
CREATE INDEX IF NOT EXISTS "site_credit_transactions_user_id_idx" ON "site_credit_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "site_credit_transactions_order_id_idx" ON "site_credit_transactions"("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gra_session_aggregates_hour_start_county_stake_band_key" ON "gra_session_aggregates"("hour_start", "county", "stake_band");
CREATE INDEX IF NOT EXISTS "gra_session_aggregates_hour_start_idx" ON "gra_session_aggregates"("hour_start");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "instant_win_groups" ADD CONSTRAINT "instant_win_groups_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "instant_win_prizes" ADD CONSTRAINT "instant_win_prizes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "instant_win_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "raffle_quantity_discounts" ADD CONSTRAINT "raffle_quantity_discounts_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "site_credit_transactions" ADD CONSTRAINT "site_credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "site_credit_transactions" ADD CONSTRAINT "site_credit_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
