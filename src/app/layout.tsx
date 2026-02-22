import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "תל״מ Pro",
  description: "פורטל ידע ופעולות לקצינים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${rubik.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
