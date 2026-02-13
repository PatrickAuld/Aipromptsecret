"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./LogoutButton";

export function UserNav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      if (!supabase) return;
      supabase.auth.getUser().then(({ data: { user } }) => {
        setEmail(user?.email ?? null);
      });
    } catch {
      // Supabase not configured — skip user nav
    }
  }, []);

  if (!email) return null;

  return (
    <span className="user-nav">
      {email} <LogoutButton />
    </span>
  );
}
