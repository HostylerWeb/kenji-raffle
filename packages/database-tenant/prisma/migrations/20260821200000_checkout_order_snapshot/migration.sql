-- Persist cart ticket snapshot on order lines; record actual purchase time on tickets.
ALTER TABLE "order_items" ADD COLUMN "ticket_numbers" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "tickets" ADD COLUMN "purchased_at" TIMESTAMPTZ(6);

ALTER TABLE "orders" ADD COLUMN "coupon_id" UUID;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "tickets_purchased_at_idx" ON "tickets"("purchased_at");
