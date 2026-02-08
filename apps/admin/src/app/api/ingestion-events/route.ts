import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getIngestionEventsByMessageId } from "@/data/queries";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(req: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId");

  if (!messageId) {
    return NextResponse.json(
      { error: "messageId query parameter is required" },
      { status: 400 },
    );
  }

  const events = await getIngestionEventsByMessageId(getDb(), messageId);
  return NextResponse.json({ events });
}
