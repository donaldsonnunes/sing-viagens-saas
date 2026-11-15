import { NextResponse } from "next/server";
import { updateOrderStatusInSupabase } from "@/lib/db";

/**
 * Webhook do Mercado Pago para confirmação automática de PIX / Cartão.
 * Quando o pagamento é aprovado, atualiza o pedido para "CONFIRMADO" no Supabase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    const paymentId = body?.data?.id || body?.id;

    if (!token || !paymentId) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
        String(paymentId)
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ received: true, verified: false });
    }

    const payment = await res.json();
    const orderId = String(payment?.external_reference || "").trim();

    if (orderId && payment?.status === "approved") {
      await updateOrderStatusInSupabase(orderId, "CONFIRMADO");
    } else if (
      orderId &&
      (payment?.status === "cancelled" || payment?.status === "rejected")
    ) {
      await updateOrderStatusInSupabase(orderId, "CANCELADO");
    }

    return NextResponse.json({
      received: true,
      orderId,
      paymentStatus: payment?.status,
    });
  } catch (err) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
