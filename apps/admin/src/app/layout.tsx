import type { ReactNode } from "react";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import { UserNav } from "@/components/UserNav";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Admin - Nulldiary",
  other: {
    "theme-color": "#0a0a0b",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${outfit.variable}`}>
      <body>
        <div className="app-layout">
          <AppNav />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <header className="app-header">
              <span className="app-header__title">nulldiary</span>
              <UserNav />
            </header>
            <main className="main-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
