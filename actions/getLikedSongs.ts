import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/dist/client/components/headers";

const getLikedSongs = async (): Promise<Song[]> => {
  //Conecta ao supabase
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  //Pega a sessão atual
  const {
    data:{
      session
    }
  } = await supabase.auth.getSession();

  //Filtra todos so 'songs' e colocar order de criação
  const { data, error } = await supabase
    .from("liked_songs")
    .select("*, songs(*)") //pega tudo da tabela liked_songs e da foreing key songs
    .eq('user_id', session?.user?.id)
    .order("created_at", { ascending: false });

  if(error){
    console.log("supabase liked songs errpr :", error);
    return[];
  }

  if (!data){
    return [];
  }

  return data.map((item) => ({...item.songs}))
};

export default getLikedSongs;