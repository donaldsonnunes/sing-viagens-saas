import { NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, FeaturedShowItem, PriceAlertLeadItem } from "@/lib/db";

function supabaseHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

const DEFAULT_SHOWS: FeaturedShowItem[] = [
  {
    id: "show-1",
    title: "Rock in Rio — Edição Especial",
    artistOrTour: "Palco Mundo & Sunset",
    venueName: "Cidade do Rock (Barra)",
    city: "Rio de Janeiro",
    destinationIata: "GIG",
    eventDateLabel: "Setembro • Fim de Semana Principal",
    suggestedDepartureDate: "2026-09-18",
    suggestedReturnDate: "2026-09-21",
    categoryBadge: "Mega Festival",
    active: true,
  },
  {
    id: "show-2",
    title: "The Town & Grandes Turnês SP",
    artistOrTour: "Allianz Parque & Autódromo de Interlagos",
    venueName: "Interlagos / Allianz Parque",
    city: "São Paulo",
    destinationIata: "GRU",
    eventDateLabel: "Temporada de Shows 2026/2027",
    suggestedDepartureDate: "2026-11-20",
    suggestedReturnDate: "2026-11-23",
    categoryBadge: "Shows Internacionais",
    active: true,
  },
  {
    id: "show-3",
    title: "Rock in Rio Lisboa & Turnês Europa",
    artistOrTour: "Parque Tejo — Lisboa",
    venueName: "Parque Tejo",
    city: "Lisboa",
    destinationIata: "LIS",
    eventDateLabel: "Verão Europeu",
    suggestedDepartureDate: "2027-06-18",
    suggestedReturnDate: "2027-06-25",
    categoryBadge: "Festival Internacional",
    active: true,
  },
  {
    id: "show-4",
    title: "Grandes Shows & Arenas USA",
    artistOrTour: "Hard Rock Stadium & Kaseya Center",
    venueName: "Miami Arena District",
    city: "Miami",
    destinationIata: "MIA",
    eventDateLabel: "Temporada Internacional EUA",
    suggestedDepartureDate: "2027-03-12",
    suggestedReturnDate: "2027-03-18",
    categoryBadge: "Turnê Mundial",
    active: true,
  },
];

export async function GET() {
  try {
    const [showsRes, alertsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/featured_shows?select=*&order=created_at.asc`,
        {
          headers: supabaseHeaders(),
          cache: "no-store",
        }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/price_alerts?select=*&order=created_at.desc&limit=50`,
        {
          headers: supabaseHeaders(),
          cache: "no-store",
        }
      ),
    ]);

    const showRows = showsRes.ok ? await showsRes.json() : [];
    const alertRows = alertsRes.ok ? await alertsRes.json() : [];

    const shows: FeaturedShowItem[] =
      Array.isArray(showRows) && showRows.length > 0
        ? showRows.map((s: any) => ({
            id: s.id,
            title: s.title,
            artistOrTour: s.artist_or_tour,
            venueName: s.venue_name,
            city: s.city,
            destinationIata: s.destination_iata,
            eventDateLabel: s.event_date_label,
            suggestedDepartureDate: s.suggested_departure_date,
            suggestedReturnDate: s.suggested_return_date,
            categoryBadge: s.category_badge || "Show & Evento",
            active: s.active !== false,
            createdAt: s.created_at,
          }))
        : DEFAULT_SHOWS;

    const alerts: PriceAlertLeadItem[] = Array.isArray(alertRows)
      ? alertRows.map((a: any) => ({
          id: a.id,
          customerName: a.customer_name,
          customerWhatsapp: a.customer_whatsapp,
          customerEmail: a.customer_email || "",
          showOrEventName: a.show_or_event_name,
          originIata: a.origin_iata,
          destinationIata: a.destination_iata,
          targetMonthOrDate: a.target_month_or_date,
          status: a.status || "NOVO",
          createdAt: a.created_at,
        }))
      : [];

    return NextResponse.json({ shows, alerts });
  } catch (err) {
    console.error("Failed to fetch portal shows/alerts:", err);
    return NextResponse.json({ shows: DEFAULT_SHOWS, alerts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Criar Alerta de Preço / Lead de Show
    if (body.action === "CREATE_PRICE_ALERT") {
      const newAlert = {
        id: `alert-${Date.now()}`,
        customer_name: body.customerName || "Fã Sing Viagens",
        customer_whatsapp: body.customerWhatsapp || "",
        customer_email: body.customerEmail || "",
        show_or_event_name: body.showOrEventName || "Show / Festival",
        origin_iata: (body.originIata || "GRU").toUpperCase(),
        destination_iata: (body.destinationIata || "GIG").toUpperCase(),
        target_month_or_date: body.targetMonthOrDate || "2026/2027",
        status: "NOVO",
        created_at: new Date().toISOString(),
      };

      await fetch(`${SUPABASE_URL}/rest/v1/price_alerts`, {
        method: "POST",
        headers: supabaseHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify(newAlert),
      });

      return NextResponse.json({ success: true, alert: newAlert });
    }

    // 2. Atualizar Status de Lead/Alerta no Admin
    if (body.action === "UPDATE_ALERT_STATUS" && body.alertId) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/price_alerts?id=eq.${encodeURIComponent(body.alertId)}`,
        {
          method: "PATCH",
          headers: supabaseHeaders({ Prefer: "return=minimal" }),
          body: JSON.stringify({ status: body.status || "ATENDIDO" }),
        }
      );
      return NextResponse.json({ success: true });
    }

    // 3. Cadastrar novo Show em Destaque pelo Admin
    if (body.action === "CREATE_FEATURED_SHOW") {
      const newShow = {
        id: `show-${Date.now()}`,
        title: body.title || "Novo Show / Festival",
        artist_or_tour: body.artistOrTour || "Turnê Oficial",
        venue_name: body.venueName || "Arena Principal",
        city: body.city || "São Paulo",
        destination_iata: (body.destinationIata || "GRU").toUpperCase(),
        event_date_label: body.eventDateLabel || "Próxima Temporada",
        suggested_departure_date: body.suggestedDepartureDate || "2026-12-10",
        suggested_return_date: body.suggestedReturnDate || "2026-12-14",
        category_badge: body.categoryBadge || "Show em Destaque",
        active: true,
        created_at: new Date().toISOString(),
      };

      await fetch(`${SUPABASE_URL}/rest/v1/featured_shows`, {
        method: "POST",
        headers: supabaseHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify(newShow),
      });

      return NextResponse.json({ success: true, show: newShow });
    }

    // 4. Ativar/Desativar Show em Destaque pelo Admin
    if (body.action === "TOGGLE_SHOW_ACTIVE" && body.showId) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/featured_shows?id=eq.${encodeURIComponent(body.showId)}`,
        {
          method: "PATCH",
          headers: supabaseHeaders({ Prefer: "return=minimal" }),
          body: JSON.stringify({ active: Boolean(body.active) }),
        }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/portal:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
