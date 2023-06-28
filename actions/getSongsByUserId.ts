import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/dist/client/components/headers";

const getSongsByUserId = async (): Promise<Song[]> => {
  //Conecta ao supabase
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  //Pega o 'data' da sessão atual
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.log(sessionError.message);
    return [];
  }

  //Compara o id da sessão atual com os ids dos usuarios das musicas
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", sessionData.session?.user.id)
    .order("created_at", { ascending: false });

    if(error){
        console.log(("Erro getSongsByUserId : "),error.message)
    }

    return(data as any) || [];
};

export default getSongsByUserId;
