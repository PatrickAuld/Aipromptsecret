import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetIngestionEvents = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/data/queries", () => ({
  getIngestionEventsByMessageId: (...args: unknown[]) =>
    mockGetIngestionEvents(...args),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => "fake-db",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

const { GET } = await import("./route.js");

const fakeUser = { id: "user-1", email: "admin@test.com" };

beforeEach(() => {
  mockGetIngestionEvents.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
});

describe("GET /api/ingestion-events", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request(
      "http://localhost/api/ingestion-events?messageId=msg-1",
    );
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns events for a messageId", async () => {
    const events = [{ id: "evt-1" }, { id: "evt-2" }];
    mockGetIngestionEvents.mockResolvedValue(events);

    const req = new Request(
      "http://localhost/api/ingestion-events?messageId=msg-1",
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ events });
    expect(mockGetIngestionEvents).toHaveBeenCalledWith("fake-db", "msg-1");
  });

  it("returns 400 when messageId is missing", async () => {
    const req = new Request("http://localhost/api/ingestion-events");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
