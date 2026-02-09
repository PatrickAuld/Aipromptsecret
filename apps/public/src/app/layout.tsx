import type { ReactNode } from "react";

export const metadata = {
  title: "AI Prompt Secret",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6; color: #1a1a1a; background: #fafafa;
                max-width: 48rem; margin: 0 auto; padding: 2rem 1rem;
              }
              a { color: #2563eb; text-decoration: none; }
              a:hover { text-decoration: underline; }
              h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
