import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import { Database } from "@/types_db";
import { Price, Product } from "@/types";

import { stripe } from "./stripe";
import { toDateTime } from "./helpers";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

//When added to the stripe add to supabase too
// Função para inserir ou atualizar um registro de produto no Supabase
const upsertProductRecord = async (product: Stripe.Product) => {
  // Define os dados do produto
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  // Upsert (inserir ou atualizar) o registro na tabela "products" do Supabase
  const { error } = await supabaseAdmin.from("products").upsert([productData]);

  if (error) {
    throw error;
  }

  console.log(`Produto inserido/Atualizado: ${product.id}`);
};

// Função para inserir ou atualizar um registro de preço no Supabase
const upsertPriceRecord = async (price: Stripe.Price) => {
  // Define os dados do preço
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
  };

  // Upsert (inserir ou atualizar) o registro na tabela "prices" do Supabase
  const { error } = await supabaseAdmin.from("prices").upsert([priceData]);

  if (error) {
    throw error;
  }

  console.log(`Preço inserido/Atualizado: ${price.id}`);
};

// Função para criar ou recuperar um cliente no Stripe
const createOrRetrieveCustumer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  // Verifica se já existe um cliente com o uuid fornecido no Supabase
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("stripe_customer_id")
    .eq("id", uuid)
    .single();
  // Dados do novo cliente a serem criados no Stripe
  if (error || !data?.stripe_customer_id) {
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
      {
        metadata: {
          supabaseUUID: uuid,
        },
      };
    if (email) customerData.email = email;
    // Criação do cliente no Stripe
    const customer = await stripe.customers.create(customerData);
    // Inserção do novo cliente no Supabase
    const { error: supabaseError } = await supabaseAdmin
      .from("customers")
      .insert([{ id: uuid, stripe_customer_id: customer.id }]);

    if (supabaseError) {
      throw supabaseError;
    }

    console.log(`Novo Cliente creado e inserido pot ${uuid}`);
    return customer.id;
  }

  return data.stripe_customer_id;
};

// Função para copiar os detalhes de cobrança de um método de pagamento para o cliente no Stripe
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;

  if (!name || !phone || !address) {
    return;
  }
  // Atualiza os detalhes de cobrança do cliente no Stripe
  // @ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  // Atualiza os dados do cliente no Supabase
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] },
    })
    .eq("id", uuid);

  if (error) {
    throw error;
  }
};
// Função para gerenciar a mudança de status de uma assinatura
const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Recupera os dados do cliente do Supabase
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (noCustomerError) {
    throw noCustomerError;
  }

  const { id: uuid } = customerData!;
  // Obtém os detalhes da assinatura do Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  // Define os dados da assinatura a serem inseridos ou atualizados no Supabase
  const subscriptionData: Database["public"]["Tables"]["subscriptions"]["Insert"] =
    {
      id: subscription.id,
      user_id: uuid,
      metadata: subscription.metadata,
      //@ts-ignore
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      //@ts-ignore
      quantity: subscription.quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at
        ? toDateTime(subscription.cancel_at).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : null,
      current_period_start: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      current_period_end: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      created: toDateTime(subscription.created).toISOString(),
      ended_at: subscription.ended_at
        ? toDateTime(subscription.ended_at).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : null,
    };

  // Upsert (inserir ou atualizar) o registro na tabela "subscriptions" do Supabase
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert([subscriptionData]);

  if (error) throw error;

  console.log(
    `Subscriptiion Inserida / Atualizada [${subscription.id} for ${uuid}]`
  );

  // Se createAction for verdadeiro e houver um método de pagamento padrão, copia os detalhes de cobrança para o cliente no Stripe e atualiza os dados do cliente no Supabase.
  if (createAction && subscription.default_payment_method && uuid) {
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
  }
};

export {
    upsertProductRecord,
    upsertPriceRecord,
    createOrRetrieveCustumer,
    manageSubscriptionStatusChange
}