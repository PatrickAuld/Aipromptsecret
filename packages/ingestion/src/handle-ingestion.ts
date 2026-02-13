import type { Db } from "@nulldiary/db";
import { extractRequest } from "./extract-request.js";
import { parseMessage } from "./parse-message.js";
import { persistIngestion } from "./persistence.js";

function getClientIp(headers: Record<string, string>): string | null {
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers["x-real-ip"]?.trim();
  if (realIp) return realIp;

  const cfIp = headers["cf-connecting-ip"]?.trim();
  if (cfIp) return cfIp;

  return null;
}

async function isDeniedIp(db: Db, ip: string): Promise<boolean> {
  const { data, error } = await db
    .from("ip_denylist")
    .select("ip")
    .eq("ip", ip)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function handleIngestion(
  request: Request,
  db: Db,
): Promise<Response> {
  const raw = await extractRequest(request);

  const ip = getClientIp(raw.headers);
  if (ip && (await isDeniedIp(db, ip))) {
    const parsed = {
      message: null,
      status: "denied_ip",
      source: "ip",
    } as const;
    await persistIngestion(db, raw, parsed);

    return Response.json(
      { status: parsed.status },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const parsed = parseMessage(raw);
  await persistIngestion(db, raw, parsed);

  if (parsed.status === "too_long") {
    return Response.json(
      { status: parsed.status },
      {
        status: 413,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return Response.json(
    { status: parsed.status },
    {
      status: 200,
      headers: {
        // Never cache ingestion responses.
        "Cache-Control": "no-store",
      },
    },
  );
}
