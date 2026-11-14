import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "cliente@singviagens.com.br";
  const db = readDb();

  const user =
    db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
    db.users[1] ||
    db.users[0];

  const searchHistory = db.searchHistory.filter(
    (s) => s.userEmail.toLowerCase() === user.email.toLowerCase() || s.userId === user.id
  );
  const orders = db.orders.filter(
    (o) => o.userEmail.toLowerCase() === user.email.toLowerCase() || o.userId === user.id
  );

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    searchHistory: searchHistory.length > 0 ? searchHistory : db.searchHistory.slice(0, 8),
    orders: orders.length > 0 ? orders : db.orders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

    if (body.action === "LOGIN") {
      const user = db.users.find(
        (u) =>
          u.email.toLowerCase() === (body.email || "").toLowerCase() &&
          u.passwordHash === body.password
      );
      if (!user) {
        return NextResponse.json(
          { error: "Credenciais inválidas. Use cliente@singviagens.com.br / 123456 ou admin@singviagens.com.br / sing2026" },
          { status: 401 }
        );
      }
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    if (body.action === "REGISTER") {
      const existing = db.users.find(
        (u) => u.email.toLowerCase() === (body.email || "").toLowerCase()
      );
      if (existing) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado na Sing Viagens." },
          { status: 400 }
        );
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        name: body.name || "Viajante Sing",
        email: body.email,
        passwordHash: body.password || "123456",
        phone: body.phone || "(11) 99999-9999",
        role: "CUSTOMER" as const,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      writeDb(db);
      return NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      });
    }

    if (body.action === "CREATE_ORDER") {
      const pnr = `SNG${Math.floor(100 + Math.random() * 900)}`;
      const newOrder = {
        id: `ord-${Date.now()}`,
        pnr,
        userId: body.userId || "usr-demo-1",
        userEmail: body.userEmail || "cliente@singviagens.com.br",
        customerName: body.customerName || "Cliente VIP Sing",
        customerPhone: body.customerPhone || "(11) 98888-7777",
        flightCode: body.flightCode || "LA3418",
        airline: body.airline || "LATAM Airlines",
        origin: body.origin || "GRU",
        destination: body.destination || "GIG",
        departureDate: body.departureDate || "2026-12-10",
        returnDate: body.returnDate,
        passengersSummary: body.passengersSummary || "1 Adulto",
        singTotalPrice: Number(body.singTotalPrice) || 1290,
        airlineDirectReferencePrice: Number(body.airlineDirectReferencePrice) || 1590,
        savingsAmount: Number(body.savingsAmount) || 300,
        paymentMethod: body.paymentMethod || "PIX",
        status: "CONFIRMADO" as const,
        createdAt: new Date().toISOString(),
      };
      db.orders.unshift(newOrder);
      writeDb(db);
      return NextResponse.json({ success: true, order: newOrder });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/account:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
