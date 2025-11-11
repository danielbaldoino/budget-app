CREATE TYPE "__tenant"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "__tenant"."order_status" AS ENUM('draft', 'pending', 'completed');--> statement-breakpoint
CREATE TYPE "__tenant"."product_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "__tenant"."addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text,
	"street" text,
	"number" text,
	"complement" text,
	"neighborhood" text,
	"city" text,
	"state" text,
	"country" text,
	"zip_code" text,
	"reference" text,
	"customer_id" text,
	"stock_location_id" text,
	"order_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "api_keys_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."customers" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_id" text,
	"name" text NOT NULL,
	"document_type" text,
	"document" text,
	"trade_name" text,
	"corporate_name" text,
	"state_registration" text,
	"birth_date" timestamp with time zone,
	"gender" "__tenant"."gender",
	"email" text,
	"phone" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "customers_reference_id_unique" UNIQUE("reference_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."inventory_items" (
	"id" text PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "inventory_items_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."inventory_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"stocked_quantity" integer DEFAULT 0 NOT NULL,
	"inventory_item_id" text NOT NULL,
	"location_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_id" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" bigint NOT NULL,
	"compare_at_unit_price" bigint,
	"notes" text,
	"order_id" text NOT NULL,
	"order_line_item_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "order_items_reference_id_unique" UNIQUE("reference_id"),
	CONSTRAINT "order_items_order_line_item_id_unique" UNIQUE("order_line_item_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."order_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"product_variant_id" text,
	"product_variant_name" text,
	"product_variant_sku" text,
	"product_variant_manage_inventory" boolean,
	"product_variant_thumbnail" text,
	"product_variant_images" jsonb,
	"product_variant_options" jsonb,
	"product_name" text,
	"product_subtitle" text,
	"product_description" text,
	"product_thumbnail" text,
	"product_images" jsonb,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."orders" (
	"id" text PRIMARY KEY NOT NULL,
	"display_id" bigserial NOT NULL,
	"status" "__tenant"."order_status" DEFAULT 'draft' NOT NULL,
	"currency_code" text NOT NULL,
	"notes" text,
	"is_opened" boolean DEFAULT true NOT NULL,
	"seller_user_id" text,
	"customer_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "orders_display_id_unique" UNIQUE("display_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."price_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."price_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"price_list_id" text,
	"product_variant_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."prices" (
	"id" text PRIMARY KEY NOT NULL,
	"currency_code" text NOT NULL,
	"amount" bigint NOT NULL,
	"price_set_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_details" (
	"id" text PRIMARY KEY NOT NULL,
	"brand" text,
	"material" text,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "product_details_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"product_id" text,
	"variant_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_option_values" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"option_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_option_values_to_product_variants" (
	"option_value_id" text NOT NULL,
	"variant_id" text NOT NULL,
	CONSTRAINT "product_option_values_to_product_variants_variant_id_option_value_id_pk" PRIMARY KEY("variant_id","option_value_id")
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_options" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"manage_inventory" boolean DEFAULT false NOT NULL,
	"thumbnail" text,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subtitle" text,
	"description" text,
	"status" "__tenant"."product_status" DEFAULT 'active' NOT NULL,
	"thumbnail_url" text,
	"category_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."stock_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "__tenant"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_id" text,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text,
	"metadata" json,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_reference_id_unique" UNIQUE("reference_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "__tenant"."addresses" ADD CONSTRAINT "addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "__tenant"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."addresses" ADD CONSTRAINT "addresses_stock_location_id_stock_locations_id_fk" FOREIGN KEY ("stock_location_id") REFERENCES "__tenant"."stock_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."addresses" ADD CONSTRAINT "addresses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "__tenant"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."inventory_items" ADD CONSTRAINT "inventory_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "__tenant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."inventory_levels" ADD CONSTRAINT "inventory_levels_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "__tenant"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."inventory_levels" ADD CONSTRAINT "inventory_levels_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "__tenant"."stock_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "__tenant"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."order_items" ADD CONSTRAINT "order_items_order_line_item_id_order_line_items_id_fk" FOREIGN KEY ("order_line_item_id") REFERENCES "__tenant"."order_line_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_seller_user_id_users_id_fk" FOREIGN KEY ("seller_user_id") REFERENCES "__tenant"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "__tenant"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."price_sets" ADD CONSTRAINT "price_sets_price_list_id_price_lists_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "__tenant"."price_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."price_sets" ADD CONSTRAINT "price_sets_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "__tenant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."prices" ADD CONSTRAINT "prices_price_set_id_price_sets_id_fk" FOREIGN KEY ("price_set_id") REFERENCES "__tenant"."price_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."product_details" ADD CONSTRAINT "product_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "__tenant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "__tenant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."product_images" ADD CONSTRAINT "product_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "__tenant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."product_option_values" ADD CONSTRAINT "product_option_values_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "__tenant"."product_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."product_option_values_to_product_variants" ADD CONSTRAINT "product_option_values_to_product_variants_option_value_id_product_option_values_id_fk" FOREIGN KEY ("option_value_id") REFERENCES "__tenant"."product_option_values"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "__tenant"."product_option_values_to_product_variants" ADD CONSTRAINT "product_option_values_to_product_variants_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "__tenant"."product_variants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "__tenant"."product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "__tenant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "__tenant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "__tenant"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "price_sets_price_list_id_product_variant_id_index" ON "__tenant"."price_sets" USING btree ("price_list_id","product_variant_id");