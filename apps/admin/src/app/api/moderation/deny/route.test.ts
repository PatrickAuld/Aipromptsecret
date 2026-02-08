import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDenyMessage = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/data/actions", () => ({
  denyMessage: (...args: unknown[]) => mockDenyMessage(...args),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => "fake-db",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

const { POST } = await import("./route.js");

const fakeUser = { id: "user-1", email: "mod@test.com" };

beforeEach(() => {
  mockDenyMessage.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
});

describe("POST /api/moderation/deny", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request("http://localhost/api/moderation/deny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: "msg-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("denies a message with actor from session", async () => {
    mockDenyMessage.mockResolvedValue({ ok: true });

    const req = new Request("http://localhost/api/moderation/deny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: "msg-1",
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
      body: JSON.stringify({}),
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
      body: JSON.stringify({ messageId: "nonexistent" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
