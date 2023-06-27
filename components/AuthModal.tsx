"use client";

// npm i @supabase/auth-ui-react
// npm i @supabse/auth-ui-shared

import {
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";

import { useRouter } from "next/navigation";

import Modal from "./Modal";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";
import { useEffect } from "react";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Modal
      title="Bem vindo de volta"
      description="Logar na sua conta"
      isOpen={isOpen}
      onChange={onChange}
    >
      <Auth
        supabaseClient={supabaseClient}
        theme="dark"
        magicLink
        providers={["github"]}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#404040",
                brandAccent: "#22c55e",
              },
            },
          },
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: "insira seu Email",
              email_input_placeholder: "Seu Email",
              password_label: "insira sua Senha",
              password_input_placeholder: "Sua Senha",
              button_label: "Logar",
            },
            sign_up: {
              email_label: "insira seu Email",
              email_input_placeholder: "Seu Email",
              password_label: "Crie Senha",
              password_input_placeholder: "Sua Senha",
              button_label: "Registrar",
            },
          },
        }}
      />
    </Modal>
  );
};

export default AuthModal;
