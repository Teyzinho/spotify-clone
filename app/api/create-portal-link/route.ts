import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getURL } from "@/libs/helpers";
import { createOrRetrieveCustumer } from "@/libs/supabaseAdmin";

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({
      cookies,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Não foi possivel achar o usuário");

    const customer = await createOrRetrieveCustumer({
      uuid: user.id || "",
      email: user.email || "",
    });

    if (!customer) throw new Error("Não foi possivel achar o customer");

    // Cria uma sessão do portal de faturamento no Stripe
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`,
    });

    // Retorna a URL da sessão do portal de faturamento como resposta JSON
    return NextResponse.json({ url });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
