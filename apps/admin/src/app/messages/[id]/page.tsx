import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getMessageById, getIngestionEventsByMessageId } from "@/data/queries";
import { MessageDetail } from "@/components/MessageDetail";
import { ModerationForm } from "@/components/ModerationForm";

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const db = getDb();
  const message = await getMessageById(db, params.id);

  if (!message) {
    notFound();
  }

  const events = await getIngestionEventsByMessageId(db, params.id);

  return (
    <div>
      <h1>Message Detail</h1>
      <p>
        <a href="/messages">&larr; Back to list</a>
      </p>

      <MessageDetail message={message} events={events} />

      {message.moderationStatus === "pending" && (
        <ModerationForm messageId={message.id} />
      )}
    </div>
  );
}
