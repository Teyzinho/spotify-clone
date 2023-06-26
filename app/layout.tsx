import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { Figtree } from "next/font/google";

const fontFigtree = Figtree({ subsets: ["latin"] });

export const metadata = {
  title: "Spotify Clone",
  description: "Ouvir Musica!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={fontFigtree.className}>
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  );
}
