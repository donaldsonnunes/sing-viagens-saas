/**
 * Camada de integração com Gateway de Pagamento (PIX e Cartão de Crédito).
 *
 * Produção: defina `MERCADOPAGO_ACCESS_TOKEN` (e opcionalmente `NEXT_PUBLIC_SITE_URL`)
 * nas variáveis de ambiente da Vercel para gerar cobranças reais com webhook automático.
 * Sem o token configurado, opera em modo `SANDBOX` para testes internos.
 */

export interface CreatePaymentInput {
  orderId: string;
  pnr: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerCpf: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "CORPORATE_INVOICE";
}

export interface PaymentIntentResult {
  provider: "MERCADOPAGO" | "SING_SANDBOX";
  mode: "PRODUCTION" | "SANDBOX";
  paymentId: string;
  status: "PENDING" | "APPROVED";
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  checkoutUrl?: string;
}

export async function createPaymentIntent(
  input: CreatePaymentInput
): Promise<PaymentIntentResult> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.singviagens.com.br";

  if (!token) {
    return {
      provider: "SING_SANDBOX",
      mode: "SANDBOX",
      paymentId: `pay-sbx-${Date.now()}`,
      status: "APPROVED",
      pixQrCode:
        input.paymentMethod === "PIX"
          ? `00020126360014BR.GOV.BCB.PIX0114SINGVIAGENS5204000053039865406${input.amount
              .toFixed(2)
              .padStart(6, "0")}5802BR5913SING VIAGENS6009SAO PAULO62070503${input.pnr}6304ABCD`
          : undefined,
    };
  }

  const cleanCpf = String(input.payerCpf || "").replace(/\D/g, "");
  const [firstName, ...rest] = String(input.payerName || "Cliente Sing")
    .trim()
    .split(/\s+/);
  const lastName = rest.join(" ") || "Sing";

  if (input.paymentMethod === "PIX") {
    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${input.orderId}-pix`,
      },
      body: JSON.stringify({
        transaction_amount: Number(input.amount.toFixed(2)),
        description: input.description,
        payment_method_id: "pix",
        external_reference: input.orderId,
        notification_url: `${baseUrl}/api/payments/webhook`,
        payer: {
          email: input.payerEmail,
          first_name: firstName,
          last_name: lastName,
          ...(cleanCpf.length === 11
            ? { identification: { type: "CPF", number: cleanCpf } }
            : {}),
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data?.message || "Falha ao gerar cobrança PIX no Mercado Pago."
      );
    }

    return {
      provider: "MERCADOPAGO",
      mode: "PRODUCTION",
      paymentId: String(data.id),
      status: data.status === "approved" ? "APPROVED" : "PENDING",
      pixQrCode: data.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64:
        data.point_of_interaction?.transaction_data?.qr_code_base64,
    };
  }

  // Cartão de Crédito via Checkout Pro (Preference)
  const prefRes = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_reference: input.orderId,
        notification_url: `${baseUrl}/api/payments/webhook`,
        items: [
          {
            id: input.orderId,
            title: input.description,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(input.amount.toFixed(2)),
          },
        ],
        payer: {
          email: input.payerEmail,
          name: firstName,
          surname: lastName,
        },
        back_urls: {
          success: `${baseUrl}/conta`,
          pending: `${baseUrl}/conta`,
          failure: `${baseUrl}/checkout`,
        },
        auto_return: "approved",
      }),
    }
  );

  const prefData = await prefRes.json();
  if (!prefRes.ok) {
    throw new Error(
      prefData?.message || "Falha ao criar preferência de pagamento no cartão."
    );
  }

  return {
    provider: "MERCADOPAGO",
    mode: "PRODUCTION",
    paymentId: String(prefData.id),
    status: "PENDING",
    checkoutUrl: prefData.init_point,
  };
}
