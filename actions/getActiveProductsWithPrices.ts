import { ProductWithPrice } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/dist/client/components/headers";

const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
  //Conecta ao supabase
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  //Filtra produtos e preços que são ativos
  const { data, error } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { foreignTable: "prices" });

  if (error) {
    console.log("supabase getActiveProductsWithPrices error :", error);
  }

  return (data as any) || [];
};

export default getActiveProductsWithPrices;
