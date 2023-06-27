import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";

import { createContext, useEffect, useState } from "react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}
//Props é definido como uma interface vazia que permite que qualquer propriedade seja passada para o componente MyUserContextProviders.

export const MyUserContextProviders = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  //Aqui, useSessionContext é chamado para obter o estado da sessão do usuário, que inclui a sessão atual, o status de carregamento (isLoadingUser) e o cliente Supabase (supabase).

  const user = useSupaUser();
  //useSupaUser é chamado para obter as informações do usuário.

  const accessToken = session?.access_token ?? null;
  //accessToken é definido como o token de acesso da sessão, se estiver disponível, caso contrário, é definido como null.

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const getUserDetails = () => supabase.from("users").select("*").single();
  const getSubscription = () =>
    supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();
  //Duas funções são definidas aqui para obter os detalhes do usuário (getUserDetails) e os detalhes da assinatura (getSubscription) do banco de dados usando o cliente Supabase.

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromice = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromice.status === "fulfilled") {
            setUserDetails(userDetailsPromice.value.data as UserDetails);
          }

          if (subscriptionPromise.status == "fulfilled") {
            setSubscription(subscriptionPromise.value.data as Subscription);
          }

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

//   Este trecho de código usa o hook useEffect para controlar o fluxo de obtenção de detalhes do usuário e assinatura. 
//   Ele é acionado quando o estado do usuário (user) ou o estado de carregamento do usuário (isLoadingUser) muda.

// Se o usuário estiver autenticado (user é verdadeiro), não houver nenhum carregamento de dados em andamento (!isLoadingData),
//  detalhes do usuário (userDetails) e detalhes da assinatura (subscription), o código chama as funções getUserDetails e getSubscription usando Promise.
//  allSettled para obter os dados do banco de dados. Quando as promessas são resolvidas, os detalhes do usuário e da assinatura são atualizados nos estados apropriados.

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  //Um objeto value é criado contendo todas as informações relevantes do usuário e carregamento.

  return <UserContext.Provider value={value} {...props} />; // Retorna o UserContext.Provider com o valor definido como value e repassa as propriedades adicionais
};
