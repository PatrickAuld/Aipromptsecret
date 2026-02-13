"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, { error: "" });

  return (
    <form className="login-form" action={formAction}>
      <h1>Admin Login</h1>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
