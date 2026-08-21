-- CreateEnum
CREATE TYPE "withdrawal_status" AS ENUM ('pending', 'approved', 'paid', 'rejected');
CREATE TYPE "withdrawal_method" AS ENUM ('mpesa', 'bank');

-- CreateTable withdrawals
CREATE TABLE IF NOT EXISTS "withdrawals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prize_claim_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "method" "withdrawal_method" NOT NULL,
    "account_name" TEXT,
    "account_number" TEXT,
    "bank_name" TEXT,
    "status" "withdrawal_status" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "withdrawals_user_id_idx" ON "withdrawals"("user_id");
CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals"("status");

DO $$ BEGIN
  ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_prize_claim_id_fkey" FOREIGN KEY ("prize_claim_id") REFERENCES "prize_claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
