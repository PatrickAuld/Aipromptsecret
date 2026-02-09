import { handleIngestion } from "@nulldiary/ingestion";
import { getDb } from "@/lib/db";

async function handler(request: Request) {
  const db = getDb();
  return handleIngestion(request, db);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
