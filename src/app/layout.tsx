import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NoteProvider } from "@/context/NoteContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Code Notebook",
  description: "A centralized tool for your notes and code snippets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NoteProvider>{children}</NoteProvider>
      </body>
    </html>
  );
}
