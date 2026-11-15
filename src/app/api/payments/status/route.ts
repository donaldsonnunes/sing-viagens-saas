import { NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, readDb } from "@/lib/db";

/**
 * GET /api/payments/status?orderId=...
 * Consulta leve de status do pedido para polling em tempo real após PIX/Cartão.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = (searchParams.get("orderId") || "").trim();

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(
        orderId
      )}&select=id,pnr,status&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({
          orderId: rows[0].id,
          pnr: rows[0].pnr,
          status: rows[0].status,
        });
      }
    }
  } catch {
    // Fallback para cache local
  }

  const db = readDb();
  const local = db.orders.find((o) => o.id === orderId);
  if (!local) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    orderId: local.id,
    pnr: local.pnr,
    status: local.status,
  });
}
