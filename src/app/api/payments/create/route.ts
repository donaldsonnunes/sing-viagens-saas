import { NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/paymentGateway";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = String(body.orderId || "").trim();
    const pnr = String(body.pnr || "SNG000").trim();
    const amount = Number(body.amount || 0);

    if (!orderId || amount <= 0) {
      return NextResponse.json(
        { error: "Informe orderId e amount válidos para gerar o pagamento." },
        { status: 400 }
      );
    }

    const intent = await createPaymentIntent({
      orderId,
      pnr,
      amount,
      description: String(
        body.description || `Emissão Sing Viagens • Localizador ${pnr}`
      ),
      payerEmail: String(body.payerEmail || "contato@singviagens.com.br"),
      payerName: String(body.payerName || "Cliente Sing"),
      payerCpf: String(body.payerCpf || ""),
      paymentMethod:
        body.paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX",
    });

    return NextResponse.json({ success: true, paymentIntent: intent });
  } catch (err: any) {
    console.error("Failed to create payment intent:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao iniciar cobrança." },
      { status: 500 }
    );
  }
}
