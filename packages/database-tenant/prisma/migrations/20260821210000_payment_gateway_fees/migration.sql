-- Gateway fee fields on tenant payments (populated by payment gateway callback in live mode).
ALTER TABLE "payments" ADD COLUMN "gateway_fee_rate" DECIMAL(5,4) NOT NULL DEFAULT 0;
ALTER TABLE "payments" ADD COLUMN "gateway_fee_amount" DECIMAL(18,2) NOT NULL DEFAULT 0;
ALTER TABLE "payments" ADD COLUMN "gateway_transaction_id" TEXT;
