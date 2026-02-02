import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApproveMessage = vi.fn();

vi.mock("@/data/actions", () => ({
  approveMessage: (...args: unknown[]) => mockApproveMessage(...args),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => "fake-db",
}));

const { POST } = await import("./route.js");

beforeEach(() => {
  mockApproveMessage.mockReset();
});

describe("POST /api/moderation/approve", () => {
  it("approves a message and returns ok", async () => {
    mockApproveMessage.mockResolvedValue({ ok: true });

    const req = new Request("http://localhost/api/moderation/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: "msg-1",
        actor: "admin@test.com",
        reason: "Good",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockApproveMessage).toHaveBeenCalledWith("fake-db", {
      messageId: "msg-1",
      actor: "admin@test.com",
      reason: "Good",
    });
  });

  it("returns 400 when messageId is missing", async () => {
    const req = new Request("http://localhost/api/moderation/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor: "admin@test.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when actor is missing", async () => {
    const req = new Request("http://localhost/api/moderation/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: "msg-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when message not found", async () => {
    mockApproveMessage.mockResolvedValue({
      ok: false,
      error: "Message not found",
    });

    const req = new Request("http://localhost/api/moderation/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: "nonexistent",
        actor: "admin@test.com",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Message not found");
  });

  it("returns 400 when message is not pending", async () => {
    mockApproveMessage.mockResolvedValue({
      ok: false,
      error: "Message is not pending (current status: approved)",
    });

    const req = new Request("http://localhost/api/moderation/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: "msg-1",
        actor: "admin@test.com",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
