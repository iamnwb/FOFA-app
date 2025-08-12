import type { Metadata } from "next";

import "./globals.css";



export const metadata: Metadata = {
  title: "FOFA Teams Generator",
  description: "Balanced team generator for FOFA.",
  icons: {
    icon: "/fofa-logo.png",
    shortcut: "/fofa-logo.png",
    apple: "/fofa-logo.png"
  },
  themeColor: "#326295",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#326295] text-neutral-900">
        {children}
      </body>
    </html>
  );
}
