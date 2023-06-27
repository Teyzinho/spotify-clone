//npm i zustand

import { create } from "zustand";

interface AuthModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useAuthModal;

// Esse código usa a biblioteca zustand para criar um hook chamado useAuthModal.
// O hook gerencia um estado isOpen que controla se um modal de autenticação está aberto ou fechado.
// Ele também fornece duas funções, onOpen e onClose, para abrir e fechar o modal, respectivamente.
// O estado e as funções são definidos usando a função create do zustand.
// O hook useAuthModal é exportado como padrão para que possa ser usado em outros componentes da aplicação.
