"use client";

import Button from "@/components/Button";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";
import { postData } from "@/libs/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const AccountContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { user, isLoading, subscription } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  const rederectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      });
      window.location.assign(url);
    } catch (error) {
      if (error) {
        toast.error((error as Error).message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="mb-7 px-6">
      {!subscription && (
        <div className="flex flex-col gap-y-4">
            <p>
                Nenhum plano ativo.
            </p>
            <Button
                onClick={subscribeModal.onOpen}
                className="w-[300px]"
            >
                Inscreva-se
            </Button>
        </div>
      )}

      {subscription && (
        <div className="flex flex-col gap-y-4">
            <p>
                Você está atualmente no plano <b>{subscription?.prices?.products?.name}</b>
            </p>
            <Button
                className="w-[300px]"
                disabled={loading || isLoading}
                onClick={rederectToCustomerPortal}
            >
                Abrir portal do cliente
            </Button>
        </div>
      )

      }
    </div>
  );
};

export default AccountContent;
