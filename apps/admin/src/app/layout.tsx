import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import "./globals.css";

export const metadata = {
  title: "Admin - Nulldiary",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  } catch {
    // Not authenticated or cookies unavailable (e.g. login page)
  }

  return (
    <html lang="en">
      <body>
        <nav>
          <a href="/messages">Messages</a>
          {userEmail && (
            <span style={{ float: "right" }}>
              {userEmail} <LogoutButton />
            </span>
          )}
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
