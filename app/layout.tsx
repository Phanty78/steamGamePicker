import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "steamGamePicker - Discover Hidden Gems in Your Steam Library",
  description: "Find unplayed games in your Steam library and get personalized recommendations based on genres, ratings, and playtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
