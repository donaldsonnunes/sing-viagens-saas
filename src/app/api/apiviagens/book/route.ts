import { NextResponse } from "next/server";
import {
  bookAirfareOnApiViagens,
  getBookingStatusOnApiViagens,
  ApiViagensBookRequest,
} from "@/lib/apiViagensService";

/**
 * POST /api/apiviagens/book
 * Realiza a reserva gratuita (0 créditos) usando o offer_id válido (~1h) em POST /v1/airfares/book
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApiViagensBookRequest;
    if (!body.offer_id) {
      return NextResponse.json(
        { error: "Campo obrigatório: offer_id (obtido na busca dentro de ~1h)." },
        { status: 400 }
      );
    }

    const result = await bookAirfareOnApiViagens({
      offer_id: body.offer_id,
      passengers: Array.isArray(body.passengers) ? body.passengers : [],
      contacts: Array.isArray(body.contacts) ? body.contacts : [],
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in POST /api/apiviagens/book:", err);
    return NextResponse.json(
      { error: err?.message || "Falha ao reservar oferta na APIVIAGENS." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/apiviagens/book?locator=ABC123
 * Consulta gratuita de status da reserva (GET /v1/airfares/booking/{locator})
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locator = searchParams.get("locator")?.trim();
    if (!locator) {
      return NextResponse.json(
        { error: "Informe o parâmetro ?locator=CODIGO_PNR" },
        { status: 400 }
      );
    }

    const statusData = await getBookingStatusOnApiViagens(locator);
    return NextResponse.json(statusData);
  } catch (err: any) {
    console.error("Error in GET /api/apiviagens/book:", err);
    return NextResponse.json(
      { error: err?.message || "Falha ao consultar localizador." },
      { status: 500 }
    );
  }
}
