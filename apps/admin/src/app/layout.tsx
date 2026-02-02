import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Admin - Aipromptsecret",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <a href="/messages">Messages</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
