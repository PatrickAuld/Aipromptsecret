import { test, expect } from "@playwright/test";
import { uuidv7 } from "uuidv7";
import { createDb } from "@nulldiary/db";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function getDb() {
  // NOTE: Use service role for tests. Do NOT run these against production.
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createDb(url, key);
}

async function approveMessage(db: ReturnType<typeof getDb>, id: string) {
  const now = new Date().toISOString();
  const { error } = await db
    .from("messages")
    .update({
      moderation_status: "approved",
      approved_at: now,
      denied_at: null,
      // The public site prefers edited_content when present.
      edited_content: "[curated] hello",
    })
    .eq("id", id);
  if (error) throw error;

  const { error: actionError } = await db.from("moderation_actions").insert({
    id: uuidv7(),
    message_id: id,
    action: "approved",
    actor: "playwright",
    reason: "e2e",
  });
  if (actionError) throw actionError;
}

async function denyMessage(db: ReturnType<typeof getDb>, id: string) {
  const now = new Date().toISOString();
  const { error } = await db
    .from("messages")
    .update({
      moderation_status: "denied",
      denied_at: now,
      approved_at: null,
    })
    .eq("id", id);
  if (error) throw error;

  const { error: actionError } = await db.from("moderation_actions").insert({
    id: uuidv7(),
    message_id: id,
    action: "denied",
    actor: "playwright",
    reason: "e2e",
  });
  if (actionError) throw actionError;
}

test.describe("moderation flow (db-backed)", () => {
  test("adds and approves a message", async () => {
    const db = getDb();

    const messageId = uuidv7();

    const { error: insertError } = await db.from("messages").insert({
      id: messageId,
      content: "hello",
      metadata: {},
      moderation_status: "pending",
    });
    if (insertError) throw insertError;

    await approveMessage(db, messageId);

    const { data, error } = await db
      .from("messages")
      .select("moderation_status, approved_at, denied_at, edited_content")
      .eq("id", messageId)
      .single();

    if (error) throw error;

    expect(data.moderation_status).toBe("approved");
    expect(data.approved_at).toBeTruthy();
    expect(data.denied_at).toBeNull();
    expect(data.edited_content).toBe("[curated] hello");
  });

  test("adds and denies a message", async () => {
    const db = getDb();

    const messageId = uuidv7();

    const { error: insertError } = await db.from("messages").insert({
      id: messageId,
      content: "nope",
      metadata: {},
      moderation_status: "pending",
    });
    if (insertError) throw insertError;

    await denyMessage(db, messageId);

    const { data, error } = await db
      .from("messages")
      .select("moderation_status, approved_at, denied_at")
      .eq("id", messageId)
      .single();

    if (error) throw error;

    expect(data.moderation_status).toBe("denied");
    expect(data.approved_at).toBeNull();
    expect(data.denied_at).toBeTruthy();
  });
});
