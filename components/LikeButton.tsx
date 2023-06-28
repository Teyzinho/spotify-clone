"use client";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

interface LikeButtonProps {
  songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
  const router = useRouter();
  const { supabaseClient } = useSessionContext();

  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) {
      //se não tiver usuário quebra a função
      return;
    }

    const fetchData = async () => {
      const { data, error } = await supabaseClient //compara o id so usuário e o id da musica com os ids das musicas curtidas no supabase
        .from('liked_songs')
        .select("*")
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single();

      if (!error && data) {
        //se tiver a data e não houver error
        setIsLiked(true);
      }
    };

    fetchData();
  }, [songId, supabaseClient, user?.id]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const handleLike = async () => {
    if (!user) {
      //se o usuário não estiver logado abrea a modal de loguin
      return authModal.onOpen();
    }

    if (isLiked) {
      // verifica se o usuário deu like na musica, se sim deleta, se não adiciona
      const { error } = await supabaseClient
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId)

      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(false);
      }
    } else {
      const { error } = await supabaseClient.from('liked_songs').insert({
        song_id: songId,
        user_id: user.id
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(true);
        toast.success("Adicionado as musicas Curtidas");
      }
    }

    router.refresh();
  };

  return (
    <button
      onClick={handleLike}
      className="
            hover:opacity-75
            transition
        "
    >
      <Icon color={isLiked ? "#22c55e" : "white"} size={25} />
    </button>
  );
};

export default LikeButton;
