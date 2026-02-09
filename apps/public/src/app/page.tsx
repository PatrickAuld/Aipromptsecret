import { getDb } from "@/lib/db";
import { getApprovedMessages } from "@/data/queries";
import { headers } from "next/headers";

const PAGE_SIZE = 50;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = getDb();
  const { messages, total } = await getApprovedMessages(db, {
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const responseHeaders = await headers();
  // Set via next.config or middleware in production; here we note the intent
  void responseHeaders;

  return (
    <>
      <h1>AI Prompt Secret</h1>

      {messages.length === 0 ? (
        <p>No approved messages yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              id={msg.id}
              content={msg.content}
              approvedAt={msg.approvedAt}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "2rem",
            fontSize: "0.875rem",
          }}
        >
          {page > 1 && <a href={`?page=${page - 1}`}>Previous</a>}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && <a href={`?page=${page + 1}`}>Next</a>}
        </nav>
      )}
    </>
  );
}

function MessageCard({
  id,
  content,
  approvedAt,
}: {
  id: string;
  content: string;
  approvedAt: Date | null;
}) {
  const displayDate = approvedAt
    ? approvedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <article
      style={{
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        background: "#fff",
      }}
    >
      <p
        style={{
          marginBottom: "0.5rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </p>
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.875rem",
          color: "#6b7280",
        }}
      >
        {displayDate && <time>{displayDate}</time>}
        <a href={`/messages/${id}`}>View</a>
      </footer>
    </article>
  );
}
