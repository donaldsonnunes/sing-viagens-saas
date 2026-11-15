import { NextResponse } from "next/server";
import {
  deleteFrequentPassengerFromSupabase,
  fetchDatabaseFromSupabase,
  fetchFrequentPassengersFromSupabase,
  FrequentPassengerItem,
  insertOrderToSupabase,
  insertUserToSupabase,
  isSuperAdminEmail,
  PassengerDetailItem,
  SUPABASE_KEY,
  SUPABASE_URL,
  updateOrderStatusInSupabase,
  upsertFrequentPassengerToSupabase,
  writeDb,
} from "@/lib/db";
import { bookAirfareOnApiViagens } from "@/lib/apiViagensService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      {
        user: null,
        searchHistory: [],
        orders: [],
        frequentPassengers: [],
      },
      { status: 401 }
    );
  }

  const [db, frequentPassengers] = await Promise.all([
    fetchDatabaseFromSupabase(),
    fetchFrequentPassengersFromSupabase(email),
  ]);

  const user = db.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    return NextResponse.json(
      {
        user: null,
        searchHistory: [],
        orders: [],
        frequentPassengers: [],
      },
      { status: 404 }
    );
  }

  const isAdmin = user.role === "ADMIN" || isSuperAdminEmail(user.email);

  const searchHistory = db.searchHistory.filter(
    (s) =>
      s.userEmail.toLowerCase() === user.email.toLowerCase() || s.userId === user.id
  );
  const orders = db.orders.filter(
    (o) =>
      o.userEmail.toLowerCase() === user.email.toLowerCase() || o.userId === user.id
  );

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      birthDate: user.birthDate || "",
      cpf: user.cpf || "",
      passport: user.passport || "",
      email: user.email,
      phone: user.phone,
      role: isAdmin ? "ADMIN" : "CUSTOMER",
      authProvider: user.authProvider || "EMAIL",
      avatarUrl: user.avatarUrl,
    },
    searchHistory,
    orders,
    frequentPassengers,
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

      if (user.emailVerified === false && !isSuperAdminEmail(user.email)) {
        return NextResponse.json(
          {
            requiresEmailConfirmation: true,
            email: user.email,
            verificationCodeHint: user.verificationCode || "",
            error:
              "Seu e-mail ainda não foi confirmado. Verifique o link enviado para o seu e-mail ou digite abaixo o código de confirmação de 6 dígitos.",
          },
          { status: 403 }
        );
      }

      const role = isSuperAdminEmail(user.email) ? "ADMIN" : user.role;
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          birthDate: user.birthDate || "",
          cpf: user.cpf || "",
          passport: user.passport || "",
          email: user.email,
          phone: user.phone,
          role,
          emailVerified: true,
          authProvider: user.authProvider || "EMAIL",
          avatarUrl: user.avatarUrl,
        },
      });
    }

    // 2. Cadastro de Nova Conta por E-mail e Senha (com Confirmação de E-mail + Replicação para Passageiro Frequente)
    if (body.action === "REGISTER") {
      const normalizedEmail = (body.email || "").trim().toLowerCase();
      if (!normalizedEmail) {
        return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
      }

      const fullParts = String(body.name || "")
        .trim()
        .split(/\s+/);
      const firstName = String(body.firstName || fullParts[0] || "").trim();
      const lastName = String(
        body.lastName || fullParts.slice(1).join(" ") || ""
      ).trim();
      const birthDate = String(body.birthDate || "").trim();
      const cpf = String(body.cpf || "").trim();
      const phone = String(body.phone || "").trim();
      const passport = String(body.passport || "")
        .trim()
        .toUpperCase();

      if (!firstName || !lastName || !birthDate || !cpf) {
        return NextResponse.json(
          {
            error:
              "Preencha Nome, Sobrenome, Data de Nascimento e CPF para criar sua conta e cadastrar seu perfil de passageiro.",
          },
          { status: 400 }
        );
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      const role = isSuperAdminEmail(normalizedEmail) ? "ADMIN" : "CUSTOMER";

      if (existing) {
        // Se for o Administrador Master (donaldson.nunes@gmail.com), atualiza a senha/dados e replica no passageiro
        if (isSuperAdminEmail(normalizedEmail)) {
          existing.name = fullName || existing.name || "Donaldson Nunes";
          existing.firstName = firstName;
          existing.lastName = lastName;
          existing.birthDate = birthDate;
          existing.cpf = cpf;
          existing.passport = passport;
          existing.passwordHash = body.password || existing.passwordHash;
          existing.phone = phone || existing.phone;
          existing.role = "ADMIN";
          existing.emailVerified = true;
          await insertUserToSupabase(existing);
          await upsertFrequentPassengerToSupabase({
            id: "PAX-DON-1",
            userEmail: normalizedEmail,
            firstName,
            lastName,
            birthDate,
            cpf,
            email: normalizedEmail,
            phone,
            passport,
            createdAt: new Date().toISOString(),
          });
          writeDb(db);
          return NextResponse.json({
            user: {
              id: existing.id,
              name: existing.name,
              firstName,
              lastName,
              birthDate,
              cpf,
              passport,
              email: existing.email,
              phone: existing.phone,
              role: "ADMIN",
              emailVerified: true,
              authProvider: existing.authProvider || "EMAIL",
            },
          });
        }

        if (existing.emailVerified === false) {
          return NextResponse.json({
            requiresEmailConfirmation: true,
            email: existing.email,
            verificationCodeHint: existing.verificationCode || "",
            message:
              "Este e-mail já iniciou o cadastro e aguarda confirmação. Verifique seu e-mail ou digite o código de 6 dígitos.",
          });
        }

        return NextResponse.json(
          { error: "Este e-mail já está cadastrado. Use a aba Entrar (Login)." },
          { status: 400 }
        );
      }

      const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
      const originUrl =
        request.headers.get("origin") || "https://www.singviagens.com.br";
      const redirectConfirmUrl = `${originUrl}/conta?confirm_email=${encodeURIComponent(
        normalizedEmail
      )}&code=${verificationCode}`;

      // Dispara o e-mail real de confirmação via Supabase Auth (/auth/v1/signup)
      let emailDispatched = false;
      try {
        const supaSignupRes = await fetch(
          `${SUPABASE_URL}/auth/v1/signup?redirect_to=${encodeURIComponent(
            redirectConfirmUrl
          )}`,
          {
            method: "POST",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: normalizedEmail,
              password:
                String(body.password || "").length >= 6
                  ? body.password
                  : `${body.password || "123456"}_sing`,
              data: {
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                verification_code: verificationCode,
              },
            }),
          }
        );
        emailDispatched = supaSignupRes.ok;
      } catch (e) {
        console.warn("Aviso no disparo Supabase Auth signup email:", e);
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: fullName || "Viajante Sing",
        firstName,
        lastName,
        birthDate,
        cpf,
        passport,
        email: normalizedEmail,
        passwordHash: body.password || "123456",
        phone: phone || "",
        role: role as "CUSTOMER" | "ADMIN",
        authProvider: "EMAIL" as const,
        emailVerified: false,
        verificationCode,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      await insertUserToSupabase(newUser);

      // Replica automaticamente os dados do titular no cadastro de Passageiros Frequentes
      await upsertFrequentPassengerToSupabase({
        id: `PAX-TITULAR-${newUser.id}`,
        userEmail: normalizedEmail,
        firstName,
        lastName,
        birthDate,
        cpf,
        email: normalizedEmail,
        phone,
        passport,
        createdAt: newUser.createdAt,
      });

      writeDb(db);
      return NextResponse.json({
        requiresEmailConfirmation: true,
        email: normalizedEmail,
        emailDispatched,
        verificationCodeHint: verificationCode,
        message: `Enviamos um e-mail de confirmação para ${normalizedEmail}. Clique no link enviado ao seu e-mail ou informe o código de confirmação de 6 dígitos para validar e ativar sua conta.`,
      });
    }

    // 2B. Validação / Confirmação de E-mail (por Código de 6 dígitos ou Link de Confirmação)
    if (body.action === "VERIFY_EMAIL") {
      const normalizedEmail = (body.email || "").trim().toLowerCase();
      const inputCode = String(body.code || "").trim();

      const targetUser = db.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (!targetUser) {
        return NextResponse.json(
          { error: "Conta não encontrada para este e-mail." },
          { status: 404 }
        );
      }

      if (
        !inputCode ||
        (targetUser.verificationCode && inputCode !== targetUser.verificationCode)
      ) {
        return NextResponse.json(
          {
            error:
              "Código de confirmação inválido. Verifique o código enviado ao seu e-mail e tente novamente.",
          },
          { status: 400 }
        );
      }

      targetUser.emailVerified = true;
      targetUser.verifiedAt = new Date().toISOString();
      await insertUserToSupabase(targetUser);
      writeDb(db);

      const role = isSuperAdminEmail(targetUser.email)
        ? "ADMIN"
        : targetUser.role;

      return NextResponse.json({
        verified: true,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          firstName: targetUser.firstName || "",
          lastName: targetUser.lastName || "",
          birthDate: targetUser.birthDate || "",
          cpf: targetUser.cpf || "",
          passport: targetUser.passport || "",
          email: targetUser.email,
          phone: targetUser.phone,
          role,
          emailVerified: true,
          authProvider: targetUser.authProvider || "EMAIL",
        },
      });
    }

    // 2C. Reenvio do E-mail de Confirmação
    if (body.action === "RESEND_VERIFICATION_EMAIL") {
      const normalizedEmail = (body.email || "").trim().toLowerCase();
      const targetUser = db.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (!targetUser) {
        return NextResponse.json(
          { error: "E-mail não localizado." },
          { status: 404 }
        );
      }

      const newCode =
        targetUser.verificationCode ||
        String(Math.floor(100000 + Math.random() * 900000));
      targetUser.verificationCode = newCode;
      await insertUserToSupabase(targetUser);

      const originUrl =
        request.headers.get("origin") || "https://www.singviagens.com.br";
      const redirectConfirmUrl = `${originUrl}/conta?confirm_email=${encodeURIComponent(
        normalizedEmail
      )}&code=${newCode}`;

      try {
        await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "signup",
            email: normalizedEmail,
            options: {
              emailRedirectTo: redirectConfirmUrl,
            },
          }),
        });
      } catch {
        // ignore
      }

      return NextResponse.json({
        success: true,
        verificationCodeHint: newCode,
        message: `Reenviamos a solicitação de confirmação para ${normalizedEmail}.`,
      });
    }

    // 3. Login / Cadastro Integrado com Google ou ID Apple (com replicação para Passageiro Frequente se informado)
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

      const fullParts = String(body.name || "")
        .trim()
        .split(/\s+/);
      const firstName = String(
        body.firstName || fullParts[0] || ""
      ).trim();
      const lastName = String(
        body.lastName || fullParts.slice(1).join(" ") || ""
      ).trim();
      const birthDate = String(body.birthDate || "").trim();
      const cpf = String(body.cpf || "").trim();
      const phone = String(body.phone || "").trim();
      const passport = String(body.passport || "")
        .trim()
        .toUpperCase();

      const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      const computedName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : body.name ||
            existing?.name ||
            (isSuperAdminEmail(normalizedEmail)
              ? "Donaldson Nunes"
              : normalizedEmail.split("@")[0]);

      const userRecord = existing
        ? {
            ...existing,
            name: computedName,
            firstName: firstName || existing.firstName || "",
            lastName: lastName || existing.lastName || "",
            birthDate: birthDate || existing.birthDate || "",
            cpf: cpf || existing.cpf || "",
            passport: passport || existing.passport || "",
            phone: phone || existing.phone || "",
            role,
            authProvider: provider,
          }
        : {
            id: isSuperAdminEmail(normalizedEmail)
              ? "usr-donaldson-admin"
              : `usr-${provider.toLowerCase()}-${Date.now()}`,
            name: computedName,
            firstName,
            lastName,
            birthDate,
            cpf,
            passport,
            email: normalizedEmail,
            passwordHash: "oauth_managed",
            phone: phone || "(11) 99999-0000",
            role,
            authProvider: provider,
            createdAt: new Date().toISOString(),
          };

      if (!existing) {
        db.users.push(userRecord);
      }
      await insertUserToSupabase(userRecord);

      if (firstName && lastName && birthDate && cpf) {
        const existingPaxList =
          await fetchFrequentPassengersFromSupabase(normalizedEmail);
        const matched = existingPaxList.find(
          (ep) => ep.cpf.replace(/\D/g, "") === cpf.replace(/\D/g, "")
        );
        await upsertFrequentPassengerToSupabase({
          id: matched?.id || `PAX-TITULAR-${userRecord.id}`,
          userEmail: normalizedEmail,
          firstName,
          lastName,
          birthDate,
          cpf,
          email: normalizedEmail,
          phone,
          passport,
          createdAt: matched?.createdAt || new Date().toISOString(),
        });
      }

      writeDb(db);

      return NextResponse.json({
        user: {
          id: userRecord.id,
          name: userRecord.name,
          firstName: userRecord.firstName,
          lastName: userRecord.lastName,
          birthDate: userRecord.birthDate,
          cpf: userRecord.cpf,
          passport: userRecord.passport,
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

      const existingInDb = db.users.find(
        (u) => u.email.toLowerCase() === email
      );

      const syncedUser = existingInDb
        ? {
            ...existingInDb,
            name: existingInDb.name || name,
            role,
            emailVerified: true,
            verifiedAt: new Date().toISOString(),
            avatarUrl:
              supaUser.user_metadata?.avatar_url || existingInDb.avatarUrl,
          }
        : {
            id: supaUser.id || `usr-${Date.now()}`,
            name,
            firstName: "",
            lastName: "",
            birthDate: "",
            cpf: "",
            passport: "",
            email,
            passwordHash: "oauth_managed",
            phone: supaUser.phone || "",
            role,
            authProvider: provider,
            emailVerified: true,
            verifiedAt: new Date().toISOString(),
            avatarUrl: supaUser.user_metadata?.avatar_url,
            createdAt: supaUser.created_at || new Date().toISOString(),
          };

      await insertUserToSupabase(syncedUser);

      return NextResponse.json({
        user: {
          id: syncedUser.id,
          name: syncedUser.name,
          firstName: syncedUser.firstName || "",
          lastName: syncedUser.lastName || "",
          birthDate: syncedUser.birthDate || "",
          cpf: syncedUser.cpf || "",
          passport: syncedUser.passport || "",
          email: syncedUser.email,
          phone: syncedUser.phone,
          role: syncedUser.role,
          emailVerified: true,
          authProvider: syncedUser.authProvider,
          avatarUrl: syncedUser.avatarUrl,
        },
      });
    }

    // 5. Criação de Pedido no Checkout (com reserva PNR gratuita em POST /v1/airfares/book)
    if (body.action === "CREATE_ORDER") {
      let pnr = `SNG${Math.floor(100 + Math.random() * 900)}`;
      const userEmail = String(
        body.userEmail || "cliente@singviagens.com.br"
      ).toLowerCase();
      const passengersDetails: PassengerDetailItem[] = Array.isArray(
        body.passengersDetails
      )
        ? body.passengersDetails
        : [];

      // Salva automaticamente passageiros novos marcados para cadastro na hora nos Passageiros Frequentes
      if (passengersDetails.length > 0) {
        const existingPaxList = await fetchFrequentPassengersFromSupabase(userEmail);
        for (const pax of passengersDetails) {
          if (pax.saveAsFrequentPassenger !== false) {
            const fullParts = String(pax.fullName || "")
              .trim()
              .split(/\s+/);
            const firstName = (pax.firstName || fullParts[0] || "").trim();
            const lastName = (
              pax.lastName ||
              fullParts.slice(1).join(" ") ||
              ""
            ).trim();
            const cpfClean = (
              pax.cpf ||
              pax.documentCpfOrPassport ||
              ""
            ).trim();

            if (firstName && lastName && pax.birthDate && cpfClean) {
              const matchedByIdOrCpf = existingPaxList.find(
                (ep) =>
                  (pax.frequentPassengerId && ep.id === pax.frequentPassengerId) ||
                  ep.cpf.replace(/\D/g, "") === cpfClean.replace(/\D/g, "")
              );

              const paxRecord: FrequentPassengerItem = {
                id:
                  matchedByIdOrCpf?.id ||
                  pax.frequentPassengerId ||
                  `PAX-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`,
                userEmail,
                firstName,
                lastName,
                birthDate: pax.birthDate,
                cpf: cpfClean,
                email: pax.email || matchedByIdOrCpf?.email || "",
                phone: pax.phone || matchedByIdOrCpf?.phone || "",
                passport: pax.passport || matchedByIdOrCpf?.passport || "",
                createdAt:
                  matchedByIdOrCpf?.createdAt || new Date().toISOString(),
              };

              await upsertFrequentPassengerToSupabase(paxRecord);
            }
          }
        }
      }

      if (body.offerId) {
        try {
          const nameParts = String(body.customerName || "CLIENTE SING")
            .trim()
            .toUpperCase()
            .split(/\s+/);
          const fallbackFirst = nameParts[0] || "CLIENTE";
          const fallbackLast = nameParts.slice(1).join(" ") || "SING";
          const cleanDigits = String(body.customerPhone || "11999998888").replace(
            /\D/g,
            ""
          );
          const areaCode = cleanDigits.slice(0, 2) || "11";
          const phoneNum = cleanDigits.slice(2) || "999998888";

          const apiPassengers =
            passengersDetails.length > 0
              ? passengersDetails.map((p) => {
                  const parts = String(p.fullName || "")
                    .trim()
                    .toUpperCase()
                    .split(/\s+/);
                  const fName = (p.firstName || parts[0] || fallbackFirst)
                    .trim()
                    .toUpperCase();
                  const lName = (
                    p.lastName ||
                    parts.slice(1).join(" ") ||
                    fallbackLast
                  )
                    .trim()
                    .toUpperCase();
                  const isChild = p.typeLabel
                    ?.toLowerCase()
                    .includes("criança");
                  return {
                    first_name: fName,
                    last_name: lName,
                    age_group: (isChild ? "CHD" : "ADT") as "ADT" | "CHD" | "INF",
                    birth_date: p.birthDate || body.birthDate || "1990-05-20",
                    gender: (body.gender === "F" ? "F" : "M") as "M" | "F",
                    cpf: String(
                      p.cpf || p.documentCpfOrPassport || body.cpf || "39053344705"
                    ).replace(/\D/g, ""),
                  };
                })
              : [
                  {
                    first_name: fallbackFirst,
                    last_name: fallbackLast,
                    age_group: "ADT" as const,
                    birth_date: body.birthDate || "1990-05-20",
                    gender: (body.gender === "F" ? "F" : "M") as "M" | "F",
                    cpf: String(body.cpf || "39053344705").replace(/\D/g, ""),
                  },
                ];

          const bookingRes = await bookAirfareOnApiViagens({
            offer_id: String(body.offerId),
            passengers: apiPassengers,
            contacts: [
              {
                name: `${fallbackFirst} ${fallbackLast}`,
                email: userEmail,
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
        userEmail,
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
        passengersDetails,
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
      const updatedFrequentPassengers =
        await fetchFrequentPassengersFromSupabase(userEmail);
      return NextResponse.json({
        success: true,
        order: newOrder,
        frequentPassengers: updatedFrequentPassengers,
      });
    }

    // 6. Cadastro ou Edição de Passageiro Frequente (Sem limites por conta)
    if (body.action === "SAVE_FREQUENT_PASSENGER") {
      const userEmail = String(
        body.userEmail || "cliente@singviagens.com.br"
      )
        .trim()
        .toLowerCase();
      const firstName = String(body.firstName || "").trim();
      const lastName = String(body.lastName || "").trim();
      const birthDate = String(body.birthDate || "").trim();
      const cpf = String(body.cpf || "").trim();

      if (!firstName || !lastName || !birthDate || !cpf) {
        return NextResponse.json(
          {
            error:
              "Preencha os campos obrigatórios do passageiro: Nome, Sobrenome, Data de Nascimento e CPF.",
          },
          { status: 400 }
        );
      }

      const pax: FrequentPassengerItem = {
        id:
          body.id ||
          `PAX-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`,
        userEmail,
        firstName,
        lastName,
        birthDate,
        cpf,
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim(),
        passport: String(body.passport || "").trim().toUpperCase(),
        createdAt: body.createdAt || new Date().toISOString(),
      };

      await upsertFrequentPassengerToSupabase(pax);
      const frequentPassengers =
        await fetchFrequentPassengersFromSupabase(userEmail);

      return NextResponse.json({
        success: true,
        passenger: pax,
        frequentPassengers,
      });
    }

    // 7. Remoção de Passageiro Frequente
    if (body.action === "DELETE_FREQUENT_PASSENGER" && body.passengerId) {
      const userEmail = String(
        body.userEmail || "cliente@singviagens.com.br"
      )
        .trim()
        .toLowerCase();
      await deleteFrequentPassengerFromSupabase(String(body.passengerId));
      const frequentPassengers =
        await fetchFrequentPassengersFromSupabase(userEmail);
      return NextResponse.json({
        success: true,
        frequentPassengers,
      });
    }

    // 8. Cancelamento / Reativação de Pedido pelo Usuário ou Admin
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
