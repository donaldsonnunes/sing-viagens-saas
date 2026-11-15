import { NextResponse } from "next/server";
import {
  fetchDatabaseFromSupabase,
  insertOrderToSupabase,
  insertUserToSupabase,
  isSuperAdminEmail,
  SUPABASE_KEY,
  SUPABASE_URL,
  updateOrderStatusInSupabase,
  writeDb,
} from "@/lib/db";
import { bookAirfareOnApiViagens } from "@/lib/apiViagensService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "cliente@singviagens.com.br";
  const db = await fetchDatabaseFromSupabase();

  const user =
    db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
    db.users[1] ||
    db.users[0];

  const isAdmin = user.role === "ADMIN" || isSuperAdminEmail(user.email);

  const searchHistory = isAdmin
    ? db.searchHistory
    : db.searchHistory.filter(
        (s) =>
          s.userEmail.toLowerCase() === user.email.toLowerCase() || s.userId === user.id
      );
  const orders = isAdmin
    ? db.orders
    : db.orders.filter(
        (o) =>
          o.userEmail.toLowerCase() === user.email.toLowerCase() || o.userId === user.id
      );

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: isAdmin ? "ADMIN" : "CUSTOMER",
      authProvider: user.authProvider || "EMAIL",
      avatarUrl: user.avatarUrl,
    },
    searchHistory: searchHistory.length > 0 ? searchHistory : db.searchHistory.slice(0, 8),
    orders: orders.length > 0 ? orders : db.orders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await fetchDatabaseFromSupabase();

    // 1. Login por E-mail e Senha
    if (body.action === "LOGIN") {
      const normalizedEmail = (body.email || "").trim().toLowerCase();
      const user = db.users.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail && u.passwordHash === body.password
      );
      if (!user) {
        return NextResponse.json(
          {
            error:
              "E-mail ou senha inválidos. Verifique seus dados ou entre com Google / ID Apple.",
          },
          { status: 401 }
        );
      }
      const role = isSuperAdminEmail(user.email) ? "ADMIN" : user.role;
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role,
          authProvider: user.authProvider || "EMAIL",
          avatarUrl: user.avatarUrl,
        },
      });
    }

    // 2. Cadastro de Nova Conta por E-mail e Senha
    if (body.action === "REGISTER") {
      const normalizedEmail = (body.email || "").trim().toLowerCase();
      if (!normalizedEmail) {
        return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
      }

      const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      const role = isSuperAdminEmail(normalizedEmail) ? "ADMIN" : "CUSTOMER";

      if (existing) {
        // Se for o Administrador Master (donaldson.nunes@gmail.com), atualiza a senha/dados e autentica
        if (isSuperAdminEmail(normalizedEmail)) {
          existing.name = body.name || existing.name || "Donaldson Nunes";
          existing.passwordHash = body.password || existing.passwordHash;
          existing.phone = body.phone || existing.phone;
          existing.role = "ADMIN";
          await insertUserToSupabase(existing);
          writeDb(db);
          return NextResponse.json({
            user: {
              id: existing.id,
              name: existing.name,
              email: existing.email,
              phone: existing.phone,
              role: "ADMIN",
              authProvider: existing.authProvider || "EMAIL",
            },
          });
        }

        return NextResponse.json(
          { error: "Este e-mail já está cadastrado. Use a aba Entrar (Login)." },
          { status: 400 }
        );
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: body.name || "Viajante Sing",
        email: normalizedEmail,
        passwordHash: body.password || "123456",
        phone: body.phone || "(11) 99999-9999",
        role: role as "CUSTOMER" | "ADMIN",
        authProvider: "EMAIL" as const,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      await insertUserToSupabase(newUser);
      writeDb(db);
      return NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          authProvider: newUser.authProvider,
        },
      });
    }

    // 3. Login / Cadastro Integrado com Google ou ID Apple
    if (body.action === "SOCIAL_AUTH") {
      const provider: "GOOGLE" | "APPLE" =
        body.provider === "APPLE" ? "APPLE" : "GOOGLE";
      const normalizedEmail = (body.email || "").trim().toLowerCase();
      if (!normalizedEmail) {
        return NextResponse.json(
          { error: "Informe o e-mail da sua conta Google ou ID Apple." },
          { status: 400 }
        );
      }

      const role: "ADMIN" | "CUSTOMER" = isSuperAdminEmail(normalizedEmail)
        ? "ADMIN"
        : "CUSTOMER";

      const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      const userRecord = existing
        ? {
            ...existing,
            name:
              body.name ||
              existing.name ||
              (isSuperAdminEmail(normalizedEmail)
                ? "Donaldson Nunes"
                : normalizedEmail.split("@")[0]),
            role,
            authProvider: provider,
          }
        : {
            id: isSuperAdminEmail(normalizedEmail)
              ? "usr-donaldson-admin"
              : `usr-${provider.toLowerCase()}-${Date.now()}`,
            name:
              body.name ||
              (isSuperAdminEmail(normalizedEmail)
                ? "Donaldson Nunes"
                : normalizedEmail.split("@")[0]),
            email: normalizedEmail,
            passwordHash: "oauth_managed",
            phone: body.phone || "(11) 99999-0000",
            role,
            authProvider: provider,
            createdAt: new Date().toISOString(),
          };

      if (!existing) {
        db.users.push(userRecord);
      }
      await insertUserToSupabase(userRecord);
      writeDb(db);

      return NextResponse.json({
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          phone: userRecord.phone,
          role: userRecord.role,
          authProvider: userRecord.authProvider,
        },
      });
    }

    // 4. Sincronização de Token OAuth Nativo do Supabase (#access_token)
    if (body.action === "SUPABASE_TOKEN_SYNC" && body.accessToken) {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${body.accessToken}`,
        },
      });
      if (!userRes.ok) {
        return NextResponse.json(
          { error: "Sessão OAuth expirada ou inválida." },
          { status: 401 }
        );
      }
      const supaUser = await userRes.json();
      const email = (supaUser.email || "").toLowerCase();
      const providerRaw = (supaUser.app_metadata?.provider || "google").toUpperCase();
      const provider: "GOOGLE" | "APPLE" | "EMAIL" =
        providerRaw === "APPLE"
          ? "APPLE"
          : providerRaw === "GOOGLE"
          ? "GOOGLE"
          : "EMAIL";
      const role: "ADMIN" | "CUSTOMER" = isSuperAdminEmail(email)
        ? "ADMIN"
        : "CUSTOMER";
      const name =
        supaUser.user_metadata?.full_name ||
        supaUser.user_metadata?.name ||
        (isSuperAdminEmail(email) ? "Donaldson Nunes" : email.split("@")[0]);

      const syncedUser = {
        id: supaUser.id || `usr-${Date.now()}`,
        name,
        email,
        passwordHash: "oauth_managed",
        phone: supaUser.phone || "",
        role,
        authProvider: provider,
        avatarUrl: supaUser.user_metadata?.avatar_url,
        createdAt: supaUser.created_at || new Date().toISOString(),
      };

      await insertUserToSupabase(syncedUser);

      return NextResponse.json({
        user: {
          id: syncedUser.id,
          name: syncedUser.name,
          email: syncedUser.email,
          phone: syncedUser.phone,
          role: syncedUser.role,
          authProvider: syncedUser.authProvider,
          avatarUrl: syncedUser.avatarUrl,
        },
      });
    }

    // 5. Criação de Pedido no Checkout (com reserva PNR gratuita em POST /v1/airfares/book)
    if (body.action === "CREATE_ORDER") {
      let pnr = `SNG${Math.floor(100 + Math.random() * 900)}`;

      if (body.offerId) {
        try {
          const nameParts = String(body.customerName || "CLIENTE SING")
            .trim()
            .toUpperCase()
            .split(/\s+/);
          const firstName = nameParts[0] || "CLIENTE";
          const lastName = nameParts.slice(1).join(" ") || "SING";
          const cleanDigits = String(body.customerPhone || "11999998888").replace(
            /\D/g,
            ""
          );
          const areaCode = cleanDigits.slice(0, 2) || "11";
          const phoneNum = cleanDigits.slice(2) || "999998888";

          const bookingRes = await bookAirfareOnApiViagens({
            offer_id: String(body.offerId),
            passengers: [
              {
                first_name: firstName,
                last_name: lastName,
                age_group: "ADT",
                birth_date: body.birthDate || "1990-05-20",
                gender: body.gender === "F" ? "F" : "M",
                cpf: String(body.cpf || "39053344705").replace(/\D/g, ""),
              },
            ],
            contacts: [
              {
                name: `${firstName} ${lastName}`,
                email: body.userEmail || "cliente@singviagens.com.br",
                country_code: "55",
                area_code: areaCode,
                number: phoneNum,
              },
            ],
          });

          if (bookingRes?.locator) {
            pnr = bookingRes.locator;
          }
        } catch (bookErr) {
          console.warn("Fallback local PNR no checkout:", bookErr);
        }
      }

      const singTotalPrice = Number(body.singTotalPrice) || 1290;
      const savingsAmount = Number(body.savingsAmount) || 300;
      const singProfitAmount = Number(body.singProfitAmount ?? savingsAmount);
      const milesCostTotal = Number(
        body.milesCostTotal ?? Math.max(0, singTotalPrice - singProfitAmount)
      );

      const newOrder = {
        id: `ord-${Date.now()}`,
        pnr,
        userId: body.userId || "usr-demo-1",
        userEmail: body.userEmail || "cliente@singviagens.com.br",
        customerName: body.customerName || "Cliente VIP Sing",
        customerPhone: body.customerPhone || "(11) 98888-7777",
        payerCpf: body.payerCpf || "",
        flightCode: body.flightCode || "LA3418",
        airline: body.airline || "LATAM Airlines",
        origin: body.origin || "GRU",
        destination: body.destination || "GIG",
        departureDate: body.departureDate || "2026-12-10",
        returnDate: body.returnDate,
        passengersSummary: body.passengersSummary || "1 Adulto",
        passengersDetails: Array.isArray(body.passengersDetails)
          ? body.passengersDetails
          : [],
        singTotalPrice,
        airlineDirectReferencePrice: Number(body.airlineDirectReferencePrice) || 1590,
        savingsAmount,
        milesCostTotal,
        singProfitAmount,
        paymentMethod: body.paymentMethod || "PIX",
        status: "CONFIRMADO" as const,
        createdAt: new Date().toISOString(),
      };
      db.orders.unshift(newOrder);
      await insertOrderToSupabase(newOrder);
      writeDb(db);
      return NextResponse.json({ success: true, order: newOrder });
    }

    // 6. Cancelamento / Reativação de Pedido pelo Usuário ou Admin
    if (body.action === "UPDATE_ORDER_STATUS" && body.orderId) {
      const targetStatus: "CONFIRMADO" | "CANCELADO" =
        body.status === "CANCELADO" ? "CANCELADO" : "CONFIRMADO";
      await updateOrderStatusInSupabase(body.orderId, targetStatus);
      const refreshed = await fetchDatabaseFromSupabase();
      return NextResponse.json({
        success: true,
        orders: refreshed.orders,
      });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/account:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
