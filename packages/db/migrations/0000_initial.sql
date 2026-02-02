CREATE TYPE "parse_status" AS ENUM ('success', 'partial', 'failed');
CREATE TYPE "moderation_status" AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE "moderation_action" AS ENUM ('approved', 'denied');

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY,
  "content" text NOT NULL,
  "metadata" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "approved_at" timestamptz,
  "denied_at" timestamptz,
  "moderation_status" "moderation_status" NOT NULL DEFAULT 'pending',
  "moderated_by" text,
  "tags" text[]
);

CREATE TABLE "ingestion_events" (
  "id" uuid PRIMARY KEY,
  "received_at" timestamptz NOT NULL DEFAULT now(),
  "method" text NOT NULL,
  "path" text NOT NULL,
  "query" jsonb NOT NULL,
  "headers" jsonb NOT NULL,
  "body" text,
  "source_ip" inet,
  "user_agent" text,
  "raw_payload" jsonb,
  "parsed_message" text,
  "parse_status" "parse_status" NOT NULL,
  "message_id" uuid REFERENCES "messages"("id")
);

CREATE TABLE "moderation_actions" (
  "id" uuid PRIMARY KEY,
  "message_id" uuid NOT NULL REFERENCES "messages"("id"),
  "action" "moderation_action" NOT NULL,
  "actor" text NOT NULL,
  "reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "ingestion_events_received_at_idx" ON "ingestion_events" ("received_at");
CREATE INDEX "messages_moderation_status_created_at_idx" ON "messages" ("moderation_status", "created_at");
CREATE INDEX "messages_content_search_idx" ON "messages" USING GIN (to_tsvector('english', "content"));
