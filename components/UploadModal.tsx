"use client";

//npm i react-hook-form
//npm i uniqid
//npm i -D @types/uniqid

import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import uniqid from "uniqid";
import Modal from "./Modal";
import useUploadModal from "@/hooks/useUploadModal";
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

const UploadModal = () => {
  const router = useRouter();
  const uploadModal = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  //React-Hook-Form
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      //Pega as variáveis do form
      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      //Checa se os campos estão preenchidos e se o usuário está logado
      if (!imageFile || !songFile || !user) {
        toast.error("Campos Ausentes");
        return;
      }

      const uniqueID = uniqid();

      //faz Upload da musica
      const {
        //Re-map dos nomes
        data: songData,
        error: songError,
      } = await supabaseClient.storage //.storage irá chamar o storege do supabse em vez da table
        .from("songs")
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: "3600", //indica que o arquivo pode ser armazenado em cache por 3600 segundos (ou 1 hora) antes de ser considerado inválido.
          upsert: false, //upsert: false indica que não será realizada uma operação de atualização caso já exista um arquivo com o mesmo nome no local de armazenamento "songs". Em vez disso, uma nova entrada será criada com um nome de arquivo exclusivo usando o título da música (values.title) e um identificador exclusivo (uniqueID).
        });

      // se der algum erro no upload da musica
      if (songError) {
        //setIsLoading false irá quebrar a função
        setIsLoading(false);
        return toast.error("Upload Música Falhou!");
      }

      //faz Upload da Imagem
      const { data: imageData, error: imageError } =
        await supabaseClient.storage
          .from("images")
          .upload(`image-${values.title}-${uniqueID}`, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

      if (imageError) {
        setIsLoading(false);
        return toast.error("Upload Imagem Falhou!");
      }

      // faz upload das informações na tabela songs
      const {
        error: supabaseError
      } = await supabaseClient.from('songs').insert({
        user_id: user.id,
        title: values.title,
        author: values.author,
        image_path: imageData.path,
        song_path: songData.path
      });

      if (supabaseError){
        setIsLoading(false)
        return toast.error("Supabase error");
      }

      router.refresh(); 
      setIsLoading(false);
      toast.success('Música Adicionada!');
      reset(); //Reseta o form
      uploadModal.onClose(); //fecha a modal
      
    } catch (error) {
      toast.error("Algo deu errado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Adicione Uma Música"
      description="Carregue arquivos mp3"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Input
          id="title"
          disabled={isLoading}
          {...register("title", { required: true })}
          placeholder="Titulo da Musica"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register("author", { required: true })}
          placeholder="Autor da Musica"
        />
        <div>
          <div className="pb-1">Selecione o arquivo da Música</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register("song", { required: true })}
          />
        </div>
        <div>
          <div className="pb-1">Selecione uma Imagem</div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image", { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Adicionar
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
