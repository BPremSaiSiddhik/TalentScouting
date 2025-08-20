CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"investor_id" integer NOT NULL,
	"talent_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"token_amount" integer NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_endorsements" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"endorser_id" integer NOT NULL,
	"skill" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"comment" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"total_supply" integer NOT NULL,
	"current_price" integer NOT NULL,
	"goals" json NOT NULL,
	"milestones" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"name" text,
	"bio" text,
	"skills" text[],
	"portfolio" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
