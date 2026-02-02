import type { APIRoute } from "astro";
import { handleIngestion } from "@nulldiary/ingestion";
import { getDb } from "../../lib/db.js";

export const ALL: APIRoute = async ({ request }) => {
  const db = getDb();
  return handleIngestion(request, db);
};
