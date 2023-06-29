import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { Figtree } from "next/font/google";
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import getSongsByUserId from "@/actions/getSongsByUserId";
import Player from "@/components/Player";

const fontFigtree = Figtree({ subsets: ["latin"] });

export const metadata = {
  title: "Spotify Clone",
  description: "Ouvir Musica!",
};

//revalidate = 0; Certifique-se de que um layout ou página seja sempre renderizado de forma dinâmica, mesmo que nenhuma função dinâmica ou busca de dados dinâmica seja encontrada. Essa opção altera o padrão das solicitações de busca que não definem uma opção de cache para 'no-store', mas mantém as solicitações de busca que optam por 'force-cache' ou usam uma revalidação positiva como estão.
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userSongs = await getSongsByUserId();


  return (
    <html lang="en">
      <body className={fontFigtree.className}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider />
            <Sidebar songs={userSongs}>
              {children}
            </Sidebar>
            <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
