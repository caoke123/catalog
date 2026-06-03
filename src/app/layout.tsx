import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "产品图册",
  description: "雨图饰品产品图册",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
