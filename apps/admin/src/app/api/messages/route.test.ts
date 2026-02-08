import { describe, it, expect, vi, beforeEach } from "vitest";

const mockListMessages = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/data/queries", () => ({
  listMessages: (...args: unknown[]) => mockListMessages(...args),
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
  mockListMessages.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
});

describe("GET /api/messages", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request("http://localhost/api/messages");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns messages with default filters", async () => {
    mockListMessages.mockResolvedValue({ messages: [], total: 0 });

    const req = new Request("http://localhost/api/messages");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ messages: [], total: 0 });
    expect(mockListMessages).toHaveBeenCalledWith("fake-db", {
      status: "pending",
      search: undefined,
      after: undefined,
      before: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it("passes query params as filters", async () => {
    mockListMessages.mockResolvedValue({ messages: [], total: 0 });

    const req = new Request(
      "http://localhost/api/messages?status=approved&search=hello&limit=10&offset=5",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockListMessages).toHaveBeenCalledWith("fake-db", {
      status: "approved",
      search: "hello",
      after: undefined,
      before: undefined,
      limit: 10,
      offset: 5,
    });
  });

  it("parses date range filters", async () => {
    mockListMessages.mockResolvedValue({ messages: [], total: 0 });

    const req = new Request(
      "http://localhost/api/messages?after=2024-01-01&before=2024-12-31",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const call = mockListMessages.mock.calls[0][1];
    expect(call.after).toBeInstanceOf(Date);
    expect(call.before).toBeInstanceOf(Date);
  });

  it("returns 400 for invalid status", async () => {
    const req = new Request("http://localhost/api/messages?status=invalid");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
