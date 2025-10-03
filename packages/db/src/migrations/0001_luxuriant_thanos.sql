CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"owner_id" text NOT NULL,
	"tenant_schema_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_tenant_schema_id_tenant_schemas_id_fk" FOREIGN KEY ("tenant_schema_id") REFERENCES "public"."tenant_schemas"("id") ON DELETE no action ON UPDATE no action;