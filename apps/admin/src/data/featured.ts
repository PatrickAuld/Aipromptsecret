import type { Db } from "@nulldiary/db";

export type FeaturedSetRow = {
  id: string;
  slug: string;
  title: string | null;
  pinned: boolean;
};

export async function listFeaturedSets(db: Db): Promise<FeaturedSetRow[]> {
  const { data, error } = await db
    .from("featured_sets")
    .select("id, slug, title, pinned")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FeaturedSetRow[];
}

export async function listFeaturedMemberships(
  db: Db,
  messageIds: string[],
): Promise<Array<{ set_id: string; message_id: string }>> {
  if (messageIds.length === 0) return [];

  const { data, error } = await db
    .from("featured_set_messages")
    .select("set_id, message_id")
    .in("message_id", messageIds);

  if (error) throw error;
  return (data ?? []) as Array<{ set_id: string; message_id: string }>;
}
