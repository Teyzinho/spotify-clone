"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Libary from "./Libary";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const pathname = usePathname();

  // Definição da lista de rotas usando o hook useMemo
  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: pathname !== "/search", // Define se a rota está ativa com base no valor do pathname
        href: "/", // URL associado à rota
      },
      {
        icon: BiSearch,
        label: "Search",
        active: pathname === "/search", 
        href: "/search", 
      },
    ],
    []
  ); // O segundo argumento vazio [] indica que as rotas serão calculadas apenas uma vez e não têm dependências
  //No código acima, o useMemo é utilizado para memoizar a lista de rotas. O retorno da função passada para o useMemo é a lista de objetos de rota.

  return (
    <div className="flex h-full">
      <div
        className="
                hidden
                md:flex
                flex-col
                gap-y-2
                bg-black
                h-full
                w-[300px]
                p-2
            "
      >
        <Box>
            <div
                className="
                    flex
                    flex-col
                    gap-y-4
                    px-5
                    py-4
                "
            >
                {routes.map((item) => (
                    <SidebarItem
                        key={item.label}
                        {...item}
                    />  
                ))}
            </div>
        </Box>
        <Box className="overflow-y-auto h-full">
            <Libary />
        </Box>
      </div>
      <main className="h-full flex-1 overflow-y-auto py-2">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;