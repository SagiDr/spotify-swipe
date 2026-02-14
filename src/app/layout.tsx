import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SettingsProvider from "@/components/SettingsProvider";
import SettingsBar from "@/components/SettingsBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify Swipe",
  description: "Swipe through songs and generate a personalized playlist",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-spotify-darkgray text-gray-900 dark:text-white transition-colors`}>
        <SettingsProvider>
          <SettingsBar />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
