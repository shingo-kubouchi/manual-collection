import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "説明書管理アプリ",
  description: "製品の説明書をNotionで管理するアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

