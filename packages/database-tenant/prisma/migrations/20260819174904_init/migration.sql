-- CreateEnum
CREATE TYPE "operator_staff_role" AS ENUM ('owner', 'manager', 'support', 'finance');

-- CreateEnum
CREATE TYPE "spending_limit_period" AS ENUM ('weekly', 'monthly');

-- CreateEnum
CREATE TYPE "kyc_status" AS ENUM ('none', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "raffle_status" AS ENUM ('draft', 'listed', 'active', 'to_be_drawn', 'drawn', 'cancelled', 'failed');

-- CreateEnum
CREATE TYPE "draw_type" AS ENUM ('manual', 'automatic', 'scheduled');

-- CreateEnum
CREATE TYPE "prize_type" AS ENUM ('physical', 'cash', 'site_credit');

-- CreateEnum
CREATE TYPE "instant_win_status" AS ENUM ('active', 'paused', 'completed');

-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('available', 'reserved', 'purchased', 'cancelled', 'winning');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'completed', 'cancelled', 'failed');

-- CreateEnum
CREATE TYPE "coupon_discount_type" AS ENUM ('percent', 'fixed');

-- CreateEnum
CREATE TYPE "coupon_status" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "gateway_mode" AS ENUM ('mock', 'live');

-- CreateEnum
CREATE TYPE "prize_claim_status" AS ENUM ('pending', 'shipped', 'delivered');

-- CreateEnum
CREATE TYPE "gra_event_status" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "operator_staff" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "operator_staff_role" NOT NULL DEFAULT 'manager',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "operator_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "date_of_birth" DATE,
    "county" TEXT,
    "email_verified_at" TIMESTAMPTZ(6),
    "site_credit_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "spending_limit" DECIMAL(18,2),
    "spending_limit_period" "spending_limit_period",
    "play_safe_active" BOOLEAN NOT NULL DEFAULT false,
    "play_safe_until" TIMESTAMPTZ(6),
    "kyc_status" "kyc_status" NOT NULL DEFAULT 'none',
    "account_disabled" BOOLEAN NOT NULL DEFAULT false,
    "registration_ip" TEXT,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_shipping_addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "label" TEXT,
    "county" TEXT,
    "town" TEXT,
    "address_line" TEXT,
    "postal_code" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_shipping_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "operator_staff_id" UUID,
    "success" BOOLEAN NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffles" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "ticket_price" DECIMAL(18,2) NOT NULL,
    "max_entries" INTEGER NOT NULL,
    "min_tickets" INTEGER NOT NULL DEFAULT 0,
    "ticket_limit_per_user" INTEGER,
    "draw_type" "draw_type" NOT NULL DEFAULT 'manual',
    "number_of_winners" INTEGER NOT NULL DEFAULT 1,
    "status" "raffle_status" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_image_url" TEXT,
    "cash_alternative_amount" DECIMAL(18,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "raffles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffle_gallery" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "raffle_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "prize_type" "prize_type" NOT NULL,
    "value_kes" DECIMAL(18,2),
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instant_win_prizes" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "prize_type" "prize_type" NOT NULL,
    "prize_value" DECIMAL(18,2) NOT NULL,
    "win_frequency" INTEGER NOT NULL,
    "total_available" INTEGER NOT NULL,
    "total_awarded" INTEGER NOT NULL DEFAULT 0,
    "status" "instant_win_status" NOT NULL DEFAULT 'active',

    CONSTRAINT "instant_win_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "ticket_number" INTEGER NOT NULL,
    "user_id" UUID,
    "session_id" TEXT,
    "order_id" UUID,
    "payment_id" UUID,
    "status" "ticket_status" NOT NULL DEFAULT 'available',
    "purchase_price" DECIMAL(18,2),
    "instant_win_prize_id" UUID,
    "reserved_until" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" TEXT,
    "ip_address" TEXT,
    "raffle_id" UUID NOT NULL,
    "ticket_quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "discount_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "final_amount" DECIMAL(18,2) NOT NULL,
    "ticket_numbers" JSONB NOT NULL,
    "coupon_id" UUID,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sub_total" DECIMAL(18,2) NOT NULL,
    "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(18,2) NOT NULL,
    "coupon_code" TEXT,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "coupon_discount_type" NOT NULL,
    "discount_value" DECIMAL(18,2) NOT NULL,
    "min_order_amount" DECIMAL(18,2),
    "max_uses" INTEGER,
    "uses_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMPTZ(6),
    "valid_until" TIMESTAMPTZ(6),
    "status" "coupon_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "operator_amount" DECIMAL(18,2) NOT NULL,
    "tax_amount" DECIMAL(18,2) NOT NULL,
    "tax_rate" DECIMAL(5,4) NOT NULL,
    "transaction_id" TEXT,
    "payment_method" TEXT,
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "gateway_mode" "gateway_mode" NOT NULL DEFAULT 'mock',
    "gra_reported_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" UUID NOT NULL,
    "raffle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "prize_id" UUID,
    "announced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instant_win_awards" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "instant_win_prize_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "awarded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'awarded',

    CONSTRAINT "instant_win_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_claims" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "winner_id" UUID,
    "instant_win_award_id" UUID,
    "county" TEXT,
    "town" TEXT,
    "address_line" TEXT,
    "postal_code" TEXT,
    "status" "prize_claim_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "prize_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gra_outbound_events" (
    "id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "gra_event_status" NOT NULL DEFAULT 'pending',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "gra_outbound_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by_staff_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_audit_logs" (
    "id" UUID NOT NULL,
    "operator_staff_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_staff_email_key" ON "operator_staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_shipping_addresses_user_id_idx" ON "user_shipping_addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "raffles_slug_key" ON "raffles"("slug");

-- CreateIndex
CREATE INDEX "raffle_gallery_raffle_id_idx" ON "raffle_gallery"("raffle_id");

-- CreateIndex
CREATE INDEX "prizes_raffle_id_idx" ON "prizes"("raffle_id");

-- CreateIndex
CREATE INDEX "instant_win_prizes_raffle_id_idx" ON "instant_win_prizes"("raffle_id");

-- CreateIndex
CREATE INDEX "tickets_raffle_id_status_idx" ON "tickets"("raffle_id", "status");

-- CreateIndex
CREATE INDEX "tickets_session_id_raffle_id_idx" ON "tickets"("session_id", "raffle_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_raffle_id_ticket_number_key" ON "tickets"("raffle_id", "ticket_number");

-- CreateIndex
CREATE INDEX "cart_items_session_id_idx" ON "cart_items"("session_id");

-- CreateIndex
CREATE INDEX "cart_items_user_id_idx" ON "cart_items"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions"("coupon_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "gra_outbound_events_status_created_at_idx" ON "gra_outbound_events"("status", "created_at");

-- CreateIndex
CREATE INDEX "tenant_audit_logs_created_at_idx" ON "tenant_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "user_shipping_addresses" ADD CONSTRAINT "user_shipping_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_gallery" ADD CONSTRAINT "raffle_gallery_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instant_win_prizes" ADD CONSTRAINT "instant_win_prizes_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_instant_win_prize_id_fkey" FOREIGN KEY ("instant_win_prize_id") REFERENCES "instant_win_prizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "prizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instant_win_awards" ADD CONSTRAINT "instant_win_awards_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instant_win_awards" ADD CONSTRAINT "instant_win_awards_instant_win_prize_id_fkey" FOREIGN KEY ("instant_win_prize_id") REFERENCES "instant_win_prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instant_win_awards" ADD CONSTRAINT "instant_win_awards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_claims" ADD CONSTRAINT "prize_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_claims" ADD CONSTRAINT "prize_claims_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "winners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_claims" ADD CONSTRAINT "prize_claims_instant_win_award_id_fkey" FOREIGN KEY ("instant_win_award_id") REFERENCES "instant_win_awards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_audit_logs" ADD CONSTRAINT "tenant_audit_logs_operator_staff_id_fkey" FOREIGN KEY ("operator_staff_id") REFERENCES "operator_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
