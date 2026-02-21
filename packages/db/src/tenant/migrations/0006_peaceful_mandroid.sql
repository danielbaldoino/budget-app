ALTER TABLE "__tenant"."orders" ADD COLUMN "price_adjustment" jsonb;--> statement-breakpoint
ALTER TABLE "__tenant"."payment_terms" ADD COLUMN "rules" jsonb;--> statement-breakpoint
ALTER TABLE "__tenant"."product_variants" ADD COLUMN "technical_specification" jsonb;--> statement-breakpoint
ALTER TABLE "__tenant"."product_variants" ADD COLUMN "custom_fields" jsonb;