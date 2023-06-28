import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/dist/client/components/headers";
import getSongs from "./getSongs";

const getSongsByTitle = async (title:string): Promise<Song[]> => {
  //Conecta ao supabase
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  //verifica se tem algum titulo na pesquisa
  if(!title){
    const allSongs = await getSongs();
    return allSongs;
  }

  //Filtra todos so 'songs' por titulo e colocar order de criação
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .ilike('title', `%${title}%`) //ilike retorna parametros parecedos 'like(como)'
    .order("created_at", { ascending: false });

  if(error){
    console.log("supabase songs errpr :", error);
  }

  return (data as any) || []
};

export default getSongsByTitle;