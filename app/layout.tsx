import "./globals.css"
import { JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={jetbrainsMono.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
