import { Song } from "@/types";
import usePlayer from "./usePlayer";
import useAuthModal from "./useAuthModal";
import { useUser } from "./useUser";

const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const authModal = useAuthModal();
  const { user } = useUser();

  const onPlay = (id: string) => {
    if (!user) {
        return authModal.onOpen();
    }

    player.setId(id); // id que o usuário clicou
    player.setIds(songs.map((song) => song.id)); // ids das musicas da lugar que usuário clicou
  };

  return onPlay;
};

export default useOnPlay;