import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

import { stripe } from '@/libs/stripe';
import { getURL } from '@/libs/helpers';
import { createOrRetrieveCustumer } from '@/libs/supabaseAdmin';
            
export async function POST(
  request: Request
) {
    // Extrai as informações de preço, quantidade e metadados da solicitação JSON
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    const supabase = createRouteHandlerClient({ 
      cookies
      });      const {
      data: { user }
    } = await supabase.auth.getUser();

     // Cria ou recupera um cliente no Stripe com base no UUID e email do usuário
    const customer = await createOrRetrieveCustumer({
      uuid: user?.id || '',
      email: user?.email || ''
    });

    // Cria uma sessão de checkout no Stripe para uma assinatura
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer,
      line_items: [
        {
          price: price.id,
          quantity
        }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        trial_from_plan: true,
        metadata
      },
      success_url: `${getURL()}/account`,
      cancel_url: `${getURL()}/`
    });

    // Retorna a ID da sessão de checkout como resposta JSON
    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.log(err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}