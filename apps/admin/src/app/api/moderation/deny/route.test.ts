import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDenyMessage = vi.fn();

vi.mock("@/data/actions", () => ({
  denyMessage: (...args: unknown[]) => mockDenyMessage(...args),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => "fake-db",
}));

const { POST } = await import("./route.js");

beforeEach(() => {
  mockDenyMessage.mockReset();
});

describe("POST /api/moderation/deny", () => {
  it("denies a message and returns ok", async () => {
    mockDenyMessage.mockResolvedValue({ ok: true });

    const req = new Request("http://localhost/api/moderation/deny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: "msg-1",
        actor: "mod@test.com",
        reason: "Spam",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockDenyMessage).toHaveBeenCalledWith("fake-db", {
      messageId: "msg-1",
      actor: "mod@test.com",
      reason: "Spam",
    });
  });

  it("returns 400 when messageId is missing", async () => {
    const req = new Request("http://localhost/api/moderation/deny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor: "mod@test.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when actor is missing", async () => {
    const req = new Request("http://localhost/api/moderation/deny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: "msg-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when message not found", async () => {
    mockDenyMessage.mockResolvedValue({
      ok: false,
      error: "Message not found",
    });

    const req = new Request("http://localhost/api/moderation/deny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: "nonexistent",
        actor: "mod@test.com",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
