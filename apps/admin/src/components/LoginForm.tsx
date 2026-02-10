"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, { error: "" });

  return (
    <form action={formAction}>
      <h1>Admin Login</h1>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          style={{ width: "20rem" }}
        />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={{ width: "20rem" }}
        />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
