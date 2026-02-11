"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function MessageRowActions({
  messageId,
  status,
  tags,
}: {
  messageId: string;
  status: "pending" | "approved" | "denied";
  tags: string[] | null;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const isFeatured = useMemo(
    () => (tags ?? []).map((t) => t.toLowerCase()).includes("featured"),
    [tags],
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target))
        return;
      setOpen(false);
    }
    if (!open) return;
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  async function moderate(action: "approve" | "deny") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/moderation/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to ${action}`);
      }
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function toggleFeatured() {
    setBusy(true);
    setError("");
    try {
      const current = new Set((tags ?? []).map((t) => t.trim().toLowerCase()));
      if (current.has("featured")) current.delete("featured");
      else current.add("featured");

      const res = await fetch(`/api/messages/${messageId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: Array.from(current) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update tags");
      }
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Actions ▾
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            minWidth: 180,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            background: "#fff",
            padding: 6,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            zIndex: 20,
          }}
        >
          <a
            role="menuitem"
            href={`/messages/${messageId}`}
            style={{
              display: "block",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          >
            View
          </a>

          <button
            role="menuitem"
            type="button"
            onClick={() => moderate("approve")}
            disabled={busy || status !== "pending"}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          >
            Approve
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => moderate("deny")}
            disabled={busy || status !== "pending"}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          >
            Deny
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={toggleFeatured}
            disabled={busy}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          >
            {isFeatured ? "Unfeature" : "Feature"}
          </button>
        </div>
      )}

      {error && <div style={{ color: "#b91c1c", marginTop: 6 }}>{error}</div>}
    </div>
  );
}
