import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db
    .from("ip_denylist")
    .select("ip, reason, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return NextResponse.json({ ips: data ?? [] });
}

export async function POST(req: Request): Promise<Response> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    op?: unknown;
    ip?: unknown;
    reason?: unknown;
  };

  const op = body.op;
  const ip = body.ip;
  const reason = body.reason;

  if (op !== "add" && op !== "remove") {
    return NextResponse.json(
      { error: "op must be add or remove" },
      { status: 400 },
    );
  }

  if (!ip || typeof ip !== "string") {
    return NextResponse.json({ error: "ip is required" }, { status: 400 });
  }

  const db = getDb();

  if (op === "add") {
    const { error } = await db.from("ip_denylist").upsert({
      ip,
      reason: typeof reason === "string" ? reason : null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  }

  const { error } = await db.from("ip_denylist").delete().eq("ip", ip);
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
