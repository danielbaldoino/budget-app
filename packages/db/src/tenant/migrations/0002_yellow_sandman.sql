CREATE TABLE "__tenant"."carriers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "carriers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"price_adjustment" jsonb,
	"cart_id" text NOT NULL,
	"product_variant_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."carts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Unnamed' NOT NULL,
	"currency_code" text NOT NULL,
	"notes" text,
	"price_adjustment" jsonb,
	"seller_id" text,
	"customer_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."order_details" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_reference_id" text,
	"seller_name" text,
	"customer_reference_id" text,
	"customer_name" text,
	"customer_document_type" text,
	"customer_document" text,
	"customer_corporate_name" text,
	"customer_email" text,
	"customer_phone" text,
	"order_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "order_details_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."payment_terms" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"rules" jsonb,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "payment_terms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."sellers" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_id" text,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sellers_reference_id_unique" UNIQUE("reference_id"),
	CONSTRAINT "sellers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "__tenant"."users" DROP CONSTRAINT "users_reference_id_unique";--> statement-breakpoint
ALTER TABLE "__tenant"."orders" DROP CONSTRAINT "orders_seller_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "__tenant"."orders" DROP CONSTRAINT "orders_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "__tenant"."order_status";--> statement-breakpoint
CREATE TYPE "__tenant"."order_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ALTER COLUMN "status" SET DEFAULT 'active'::"__tenant"."order_status";--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ALTER COLUMN "status" SET DATA TYPE "__tenant"."order_status" USING "status"::"__tenant"."order_status";--> statement-breakpoint
ALTER TABLE "__tenant"."order_items" ADD COLUMN "price_adjustment" jsonb;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD COLUMN "reference_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD COLUMN "price_adjustment" jsonb;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD COLUMN "seller_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD COLUMN "payment_method_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD COLUMN "payment_term_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD COLUMN "carrier_id" text;--> statement-breakpoint
ALTER TABLE "__tenant"."cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "__tenant"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."cart_items" ADD CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "__tenant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."carts" ADD CONSTRAINT "carts_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "__tenant"."sellers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "__tenant"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."order_details" ADD CONSTRAINT "order_details_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "__tenant"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."sellers" ADD CONSTRAINT "sellers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "__tenant"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "__tenant"."sellers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "__tenant"."payment_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_payment_term_id_payment_terms_id_fk" FOREIGN KEY ("payment_term_id") REFERENCES "__tenant"."payment_terms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_carrier_id_carriers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "__tenant"."carriers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "__tenant"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."customers" DROP COLUMN "trade_name";--> statement-breakpoint
ALTER TABLE "__tenant"."orders" DROP COLUMN "is_opened";--> statement-breakpoint
ALTER TABLE "__tenant"."orders" DROP COLUMN "seller_user_id";--> statement-breakpoint
ALTER TABLE "__tenant"."users" DROP COLUMN "reference_id";--> statement-breakpoint
ALTER TABLE "__tenant"."users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "__tenant"."users" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_reference_id_unique" UNIQUE("reference_id");