import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rapid-CRM",
  description: "Secure credit-report audit platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded">
          Skip to content
        </a>
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-brand-700">Rapid-CRM</div>
          </div>
        </header>
        <main id="main" role="main" className="mx-auto max-w-md px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}