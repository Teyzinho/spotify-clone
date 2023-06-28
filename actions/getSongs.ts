import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/dist/client/components/headers";

const getSongs = async (): Promise<Song[]> => {
  //Conecta ao supabase
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  //Filtra todos so 'songs' e colocar order de criação
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if(error){
    console.log("supabase songs errpr :", error);
  }

  return (data as any) || []
};

export default getSongs;