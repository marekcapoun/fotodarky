import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "fotodárky.online · Z fotek radost",
  description: "Vytvořte osobní kalendáře, obrazy, magnetky, plakáty, hrnky, puzzle, pexeso a odznaky. Jeden editor, spousta radosti.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">{children}</body>
    </html>
  );
}
