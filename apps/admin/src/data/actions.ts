import { eq } from "drizzle-orm";
import { messages, moderationActions, type Db } from "@aipromptsecret/db";
import { uuidv7 } from "uuidv7";
import type { ModerationInput, ModerationResult } from "./types.js";

export async function approveMessage(
  db: Db,
  input: ModerationInput,
): Promise<ModerationResult> {
  return db.transaction(async (tx) => {
    const [message] = await tx
      .select()
      .from(messages)
      .where(eq(messages.id, input.messageId));

    if (!message) {
      return { ok: false, error: "Message not found" };
    }

    if (message.moderationStatus !== "pending") {
      return {
        ok: false,
        error: `Message is not pending (current status: ${message.moderationStatus})`,
      };
    }

    await tx
      .update(messages)
      .set({
        moderationStatus: "approved",
        approvedAt: new Date(),
        moderatedBy: input.actor,
      })
      .where(eq(messages.id, input.messageId));

    await tx.insert(moderationActions).values({
      id: uuidv7(),
      messageId: input.messageId,
      action: "approved",
      actor: input.actor,
      reason: input.reason,
    });

    return { ok: true };
  });
}

export async function denyMessage(
  db: Db,
  input: ModerationInput,
): Promise<ModerationResult> {
  return db.transaction(async (tx) => {
    const [message] = await tx
      .select()
      .from(messages)
      .where(eq(messages.id, input.messageId));

    if (!message) {
      return { ok: false, error: "Message not found" };
    }

    if (message.moderationStatus !== "pending") {
      return {
        ok: false,
        error: `Message is not pending (current status: ${message.moderationStatus})`,
      };
    }

    await tx
      .update(messages)
      .set({
        moderationStatus: "denied",
        deniedAt: new Date(),
        moderatedBy: input.actor,
      })
      .where(eq(messages.id, input.messageId));

    await tx.insert(moderationActions).values({
      id: uuidv7(),
      messageId: input.messageId,
      action: "denied",
      actor: input.actor,
      reason: input.reason,
    });

    return { ok: true };
  });
}
