CREATE TABLE "__tenant"."addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text NOT NULL,
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
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"document" text NOT NULL,
	"address_id" text NOT NULL,
	"billing_address_id" text NOT NULL,
	"erp_id" text NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_document_unique" UNIQUE("document"),
	CONSTRAINT "customers_erp_id_unique" UNIQUE("erp_id")
);
--> statement-breakpoint
ALTER TABLE "__tenant"."users" ADD COLUMN "metadata" json;--> statement-breakpoint
ALTER TABLE "__tenant"."customers" ADD CONSTRAINT "customers_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "__tenant"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "__tenant"."customers" ADD CONSTRAINT "customers_billing_address_id_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "__tenant"."addresses"("id") ON DELETE no action ON UPDATE no action;