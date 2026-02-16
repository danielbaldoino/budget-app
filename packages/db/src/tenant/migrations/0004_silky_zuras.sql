ALTER TABLE "__tenant"."customers" ALTER COLUMN "gender" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "__tenant"."products" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "__tenant"."products" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "__tenant"."price_lists" ADD COLUMN "reference_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."product_categories" ADD COLUMN "reference_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."price_lists" ADD CONSTRAINT "price_lists_reference_id_unique" UNIQUE("reference_id");--> statement-breakpoint
ALTER TABLE "__tenant"."product_categories" ADD CONSTRAINT "product_categories_reference_id_unique" UNIQUE("reference_id");--> statement-breakpoint
DROP TYPE "__tenant"."gender";--> statement-breakpoint
DROP TYPE "__tenant"."order_status";--> statement-breakpoint
DROP TYPE "__tenant"."product_status";