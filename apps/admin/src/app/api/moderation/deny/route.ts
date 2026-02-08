import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { denyMessage } from "@/data/actions";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { messageId, reason } = body;

  if (!messageId || typeof messageId !== "string") {
    return NextResponse.json(
      { error: "messageId is required" },
      { status: 400 },
    );
  }

  const actor = user.email || user.id;
  const result = await denyMessage(getDb(), { messageId, actor, reason });

  if (!result.ok) {
    const status = result.error === "Message not found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
