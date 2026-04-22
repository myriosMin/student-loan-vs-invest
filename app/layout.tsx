import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Loan vs Invest Calculator",
  description:
    "Compare the financial outcome of paying off student loans early versus investing the extra money.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
