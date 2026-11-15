import fs from "fs";
import path from "path";

export type AirlineKey = "LATAM" | "GOL" | "AZUL" | "TAP" | "AMERICAN" | "AIRFRANCE";

export interface PricingRuleConfig {
  /**
   * Percentual de lucro sobre o Spread (diferença entre o Preço na Cia Aérea e o Custo em Milhas Sing).
   */
  profitShareOnSavingsPercent: number;
  /**
   * Valor de compra do milheiro (1.000 milhas) em R$ para cada companhia aérea
   */
  mileCostPerThousand: Record<AirlineKey, number>;
  fallbackMarkupPercent: number;
  fixedEmissionFeePerPassenger: number;
  childDiscountPercent: number;
  infantDiscountPercent: number;
  updatedAt: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  userEmail: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: "ROUND_TRIP" | "ONE_WAY";
  adults: number;
  childrenAges: number[];
  cabinClass: string;
  lowestSingPrice: number;
  lowestAirlineDirectPrice: number;
  createdAt: string;
}

export interface PassengerDetailItem {
  typeLabel: string; // Ex: "Adulto 1", "Criança 1 (8 anos)"
  fullName: string;
  firstName?: string;
  lastName?: string;
  documentCpfOrPassport: string;
  cpf?: string;
  passport?: string;
  email?: string;
  phone?: string;
  birthDate: string;
  frequentPassengerId?: string;
  saveAsFrequentPassenger?: boolean;
}

export interface FrequentPassengerItem {
  id: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  cpf: string;
  email?: string;
  phone?: string;
  passport?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  pnr: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  payerCpf?: string;
  flightCode: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengersSummary: string;
  passengersDetails?: PassengerDetailItem[];
  singTotalPrice: number;
  airlineDirectReferencePrice: number;
  savingsAmount: number;
  milesCostTotal?: number;
  singProfitAmount?: number;
  paymentMethod: "PIX" | "CREDIT_CARD" | "CORPORATE_INVOICE";
  status: "CONFIRMADO" | "EM_EMISSAO" | "CANCELADO";
  createdAt: string;
}

export interface FeaturedShowItem {
  id: string;
  title: string;
  artistOrTour: string;
  venueName: string;
  city: string;
  destinationIata: string;
  eventDateLabel: string;
  suggestedDepartureDate: string;
  suggestedReturnDate: string;
  categoryBadge: string;
  active: boolean;
  createdAt?: string;
}

export interface PriceAlertLeadItem {
  id: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  showOrEventName: string;
  originIata: string;
  destinationIata: string;
  targetMonthOrDate: string;
  status: "NOVO" | "ATENDIDO" | "CONVERTIDO";
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  cpf?: string;
  passport?: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  authProvider?: "EMAIL" | "GOOGLE" | "APPLE";
  avatarUrl?: string;
  emailVerified?: boolean;
  verificationCode?: string;
  verifiedAt?: string;
  createdAt: string;
}

export const SUPER_ADMIN_EMAILS = [
  "donaldson.nunes@gmail.com",
  "admin@singviagens.com.br",
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface DatabaseSchema {
  pricingConfig: PricingRuleConfig;
  users: UserAccount[];
  searchHistory: SearchHistoryItem[];
  orders: PurchaseOrderItem[];
}

// Conexão Oficial Supabase (Região sa-east-1 São Paulo)
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lbbjgxvbjbsoaglsccun.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYmpneHZiamJzb2FnbHNjY3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MDE1MDQsImV4cCI6MjExMDI3NzUwNH0.44rc-OXXvzjw6HCCkIOl3rdXEPQn55e2IfLHQ-RHq-E";

function supabaseHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

export const DEFAULT_DB: DatabaseSchema = {
  pricingConfig: {
    profitShareOnSavingsPercent: 50,
    mileCostPerThousand: {
      LATAM: 24.5,
      GOL: 17.5,
      AZUL: 21.0,
      TAP: 42.0,
      AMERICAN: 68.0,
      AIRFRANCE: 54.0,
    },
    fallbackMarkupPercent: 10,
    fixedEmissionFeePerPassenger: 0,
    childDiscountPercent: 25,
    infantDiscountPercent: 85,
    updatedAt: new Date().toISOString(),
  },
  users: [
    {
      id: "usr-donaldson-admin",
      name: "Donaldson Nunes",
      email: "donaldson.nunes@gmail.com",
      passwordHash: "sing2026",
      phone: "(11) 99999-0000",
      role: "ADMIN",
      authProvider: "GOOGLE",
      createdAt: "2026-11-14T09:00:00.000Z",
    },
    {
      id: "usr-admin-1",
      name: "Diretoria Sing Viagens (Admin)",
      email: "admin@singviagens.com.br",
      passwordHash: "sing2026",
      phone: "(11) 99999-0000",
      role: "ADMIN",
      authProvider: "EMAIL",
      createdAt: "2026-11-14T10:00:00.000Z",
    },
    {
      id: "usr-demo-1",
      name: "Cliente VIP Sing",
      email: "cliente@singviagens.com.br",
      passwordHash: "123456",
      phone: "(11) 98888-7777",
      role: "CUSTOMER",
      authProvider: "EMAIL",
      createdAt: "2026-11-14T11:00:00.000Z",
    },
  ],
  searchHistory: [
    {
      id: "sch-demo-1",
      userId: "usr-demo-1",
      userEmail: "cliente@singviagens.com.br",
      origin: "GRU",
      destination: "GIG",
      departureDate: "2026-12-10",
      returnDate: "2026-12-14",
      tripType: "ROUND_TRIP",
      adults: 2,
      childrenAges: [8],
      cabinClass: "ECONOMY",
      lowestSingPrice: 1250.0,
      lowestAirlineDirectPrice: 1500.0,
      createdAt: "2026-11-14T15:20:00.000Z",
    },
    {
      id: "sch-demo-2",
      userId: "usr-demo-1",
      userEmail: "cliente@singviagens.com.br",
      origin: "GRU",
      destination: "LIS",
      departureDate: "2027-05-15",
      returnDate: "2027-05-26",
      tripType: "ROUND_TRIP",
      adults: 2,
      childrenAges: [],
      cabinClass: "ECONOMY",
      lowestSingPrice: 8250.0,
      lowestAirlineDirectPrice: 9800.0,
      createdAt: "2026-11-14T16:45:00.000Z",
    },
  ],
  orders: [
    {
      id: "ord-demo-1",
      pnr: "SNG84K",
      userId: "usr-demo-1",
      userEmail: "cliente@singviagens.com.br",
      customerName: "Cliente VIP Sing",
      customerPhone: "(11) 98888-7777",
      flightCode: "LA3418",
      airline: "LATAM Airlines",
      origin: "GRU",
      destination: "GIG",
      departureDate: "2026-12-10",
      returnDate: "2026-12-14",
      passengersSummary: "2 Adultos, 1 Criança (8 anos)",
      singTotalPrice: 1250.0,
      airlineDirectReferencePrice: 1500.0,
      savingsAmount: 250.0,
      paymentMethod: "PIX",
      status: "CONFIRMADO",
      createdAt: "2026-11-14T15:35:00.000Z",
    },
  ],
};

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    const mergedPricing: PricingRuleConfig = {
      ...DEFAULT_DB.pricingConfig,
      ...(parsed.pricingConfig || {}),
      mileCostPerThousand: {
        ...DEFAULT_DB.pricingConfig.mileCostPerThousand,
        ...(parsed.pricingConfig?.mileCostPerThousand || {}),
      },
    };
    return {
      pricingConfig: mergedPricing,
      users: parsed.users || DEFAULT_DB.users,
      searchHistory: parsed.searchHistory || DEFAULT_DB.searchHistory,
      orders: parsed.orders || DEFAULT_DB.orders,
    };
  } catch {
    return DEFAULT_DB;
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Em ambiente Serverless (Vercel), a persistência principal ocorre no Supabase
  }
}

/**
 * Funções Assíncronas Integradas ao Supabase PostgreSQL (sa-east-1)
 */
export async function fetchDatabaseFromSupabase(): Promise<DatabaseSchema> {
  const fallback = readDb();
  try {
    const [pricingRes, usersRes, searchRes, ordersRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/pricing_rules?id=eq.default&select=*`, {
        headers: supabaseHeaders(),
        cache: "no-store",
      }),
      fetch(`${SUPABASE_URL}/rest/v1/users?select=*&order=created_at.asc`, {
        headers: supabaseHeaders(),
        cache: "no-store",
      }),
      fetch(
        `${SUPABASE_URL}/rest/v1/search_history?select=*&order=created_at.desc&limit=30`,
        {
          headers: supabaseHeaders(),
          cache: "no-store",
        }
      ),
      fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=50`, {
        headers: supabaseHeaders(),
        cache: "no-store",
      }),
    ]);

    const pricingRows = pricingRes.ok ? await pricingRes.json() : [];
    const userRows = usersRes.ok ? await usersRes.json() : [];
    const searchRows = searchRes.ok ? await searchRes.json() : [];
    const orderRows = ordersRes.ok ? await ordersRes.json() : [];

    const pRow = pricingRows[0];
    const pricingConfig: PricingRuleConfig = pRow
      ? {
          profitShareOnSavingsPercent: Number(pRow.profit_share_on_savings_percent ?? 50),
          mileCostPerThousand: {
            ...DEFAULT_DB.pricingConfig.mileCostPerThousand,
            ...(pRow.mile_cost_per_thousand || {}),
          },
          fallbackMarkupPercent: Number(pRow.fallback_markup_percent ?? 10),
          fixedEmissionFeePerPassenger: Number(pRow.fixed_emission_fee_per_passenger ?? 0),
          childDiscountPercent: Number(pRow.child_discount_percent ?? 25),
          infantDiscountPercent: Number(pRow.infant_discount_percent ?? 85),
          updatedAt: pRow.updated_at || new Date().toISOString(),
        }
      : fallback.pricingConfig;

    const users: UserAccount[] =
      Array.isArray(userRows) && userRows.length > 0
        ? userRows.map((u: any) => ({
            id: u.id,
            name: u.name,
            firstName: u.first_name || "",
            lastName: u.last_name || "",
            birthDate: u.birth_date || "",
            cpf: u.cpf || "",
            passport: u.passport || "",
            email: u.email,
            passwordHash: u.password_hash,
            phone: u.phone || "",
            role:
              u.role === "ADMIN" || isSuperAdminEmail(u.email) ? "ADMIN" : "CUSTOMER",
            authProvider: u.auth_provider || "EMAIL",
            avatarUrl: u.avatar_url || undefined,
            emailVerified:
              typeof u.email_verified === "boolean"
                ? u.email_verified
                : isSuperAdminEmail(u.email) || u.auth_provider !== "EMAIL",
            verificationCode: u.verification_code || "",
            verifiedAt: u.verified_at || undefined,
            createdAt: u.created_at,
          }))
        : fallback.users;

    const searchHistory: SearchHistoryItem[] =
      Array.isArray(searchRows) && searchRows.length > 0
        ? searchRows.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            userEmail: s.user_email,
            origin: s.origin,
            destination: s.destination,
            departureDate: s.departure_date,
            returnDate: s.return_date || undefined,
            tripType: s.trip_type === "ONE_WAY" ? "ONE_WAY" : "ROUND_TRIP",
            adults: Number(s.adults || 1),
            childrenAges: Array.isArray(s.children_ages) ? s.children_ages : [],
            cabinClass: s.cabin_class || "ECONOMY",
            lowestSingPrice: Number(s.lowest_sing_price || 0),
            lowestAirlineDirectPrice: Number(s.lowest_airline_direct_price || 0),
            createdAt: s.created_at,
          }))
        : fallback.searchHistory;

    const orders: PurchaseOrderItem[] =
      Array.isArray(orderRows) && orderRows.length > 0
        ? orderRows.map((o: any) => {
            const singTotal = Number(o.sing_total_price || 0);
            const savings = Number(o.savings_amount || 0);
            const profit = Number(o.sing_profit_amount ?? savings);
            const milesCost = Number(
              o.miles_cost_total ?? Math.max(0, singTotal - profit)
            );
            return {
              id: o.id,
              pnr: o.pnr,
              userId: o.user_id,
              userEmail: o.user_email,
              customerName: o.customer_name,
              customerPhone: o.customer_phone,
              payerCpf: o.payer_cpf || "",
              flightCode: o.flight_code,
              airline: o.airline,
              origin: o.origin,
              destination: o.destination,
              departureDate: o.departure_date,
              returnDate: o.return_date || undefined,
              passengersSummary: o.passengers_summary,
              passengersDetails: Array.isArray(o.passengers_details)
                ? o.passengers_details
                : [],
              singTotalPrice: singTotal,
              airlineDirectReferencePrice: Number(
                o.airline_direct_reference_price || 0
              ),
              savingsAmount: savings,
              milesCostTotal: milesCost,
              singProfitAmount: profit,
              paymentMethod: o.payment_method || "PIX",
              status: o.status || "CONFIRMADO",
              createdAt: o.created_at,
            };
          })
        : fallback.orders;

    return { pricingConfig, users, searchHistory, orders };
  } catch (err) {
    console.error("Supabase fetch fallback to local:", err);
    return fallback;
  }
}

export async function savePricingToSupabase(config: PricingRuleConfig): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/pricing_rules?id=eq.default`, {
      method: "PATCH",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        profit_share_on_savings_percent: config.profitShareOnSavingsPercent,
        mile_cost_per_thousand: config.mileCostPerThousand,
        fallback_markup_percent: config.fallbackMarkupPercent,
        fixed_emission_fee_per_passenger: config.fixedEmissionFeePerPassenger,
        child_discount_percent: config.childDiscountPercent,
        infant_discount_percent: config.infantDiscountPercent,
        updated_at: config.updatedAt,
      }),
    });
  } catch (err) {
    console.error("Failed to save pricing to Supabase:", err);
  }
}

export async function insertSearchHistoryToSupabase(
  item: SearchHistoryItem
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/search_history`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        id: item.id,
        user_id: item.userId,
        user_email: item.userEmail,
        origin: item.origin,
        destination: item.destination,
        departure_date: item.departureDate,
        return_date: item.returnDate || null,
        trip_type: item.tripType,
        adults: item.adults,
        children_ages: item.childrenAges,
        cabin_class: item.cabinClass,
        lowest_sing_price: item.lowestSingPrice,
        lowest_airline_direct_price: item.lowestAirlineDirectPrice,
        created_at: item.createdAt,
      }),
    });
  } catch (err) {
    console.error("Failed to insert search history to Supabase:", err);
  }
}

export async function insertUserToSupabase(user: UserAccount): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=email`, {
      method: "POST",
      headers: supabaseHeaders({
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        birth_date: user.birthDate || "",
        cpf: user.cpf || "",
        passport: user.passport || "",
        email: user.email,
        password_hash: user.passwordHash,
        phone: user.phone,
        role: isSuperAdminEmail(user.email) ? "ADMIN" : user.role,
        auth_provider: user.authProvider || "EMAIL",
        avatar_url: user.avatarUrl || null,
        email_verified:
          typeof user.emailVerified === "boolean"
            ? user.emailVerified
            : isSuperAdminEmail(user.email) || user.authProvider !== "EMAIL",
        verification_code: user.verificationCode || "",
        verified_at: user.verifiedAt || null,
        created_at: user.createdAt,
      }),
    });
  } catch (err) {
    console.error("Failed to insert user to Supabase:", err);
  }
}

export async function insertOrderToSupabase(order: PurchaseOrderItem): Promise<void> {
  try {
    const profit = order.singProfitAmount ?? order.savingsAmount;
    const milesCost =
      order.milesCostTotal ?? Math.max(0, order.singTotalPrice - profit);
    await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        id: order.id,
        pnr: order.pnr,
        user_id: order.userId,
        user_email: order.userEmail,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        payer_cpf: order.payerCpf || "",
        flight_code: order.flightCode,
        airline: order.airline,
        origin: order.origin,
        destination: order.destination,
        departure_date: order.departureDate,
        return_date: order.returnDate || null,
        passengers_summary: order.passengersSummary,
        passengers_details: order.passengersDetails || [],
        sing_total_price: order.singTotalPrice,
        airline_direct_reference_price: order.airlineDirectReferencePrice,
        savings_amount: order.savingsAmount,
        miles_cost_total: milesCost,
        sing_profit_amount: profit,
        payment_method: order.paymentMethod,
        status: order.status,
        created_at: order.createdAt,
      }),
    });
  } catch (err) {
    console.error("Failed to insert order to Supabase:", err);
  }
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  status: "CONFIRMADO" | "CANCELADO"
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        status,
        cancelled_at: status === "CANCELADO" ? new Date().toISOString() : null,
      }),
    });
  } catch (err) {
    console.error("Failed to update order status in Supabase:", err);
  }
}

export async function logExternalApiTestToSupabase(params: {
  providerName: string;
  endpoint: string;
  requestPayload: unknown;
  responsePayload: unknown;
  httpStatus?: number;
  latencyMs?: number;
  notes?: string;
}): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/external_api_logs`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        provider_name: params.providerName,
        endpoint: params.endpoint,
        request_payload: params.requestPayload ?? {},
        response_payload: params.responsePayload ?? {},
        http_status: params.httpStatus ?? 200,
        latency_ms: params.latencyMs ?? 0,
        notes: params.notes ?? null,
      }),
    });
  } catch (err) {
    console.error("Failed to log external API call to Supabase:", err);
  }
}

export const DEFAULT_FREQUENT_PASSENGERS: FrequentPassengerItem[] = [
  {
    id: "PAX-DON-1",
    userEmail: "donaldson.nunes@gmail.com",
    firstName: "Donaldson",
    lastName: "Nunes",
    birthDate: "1985-04-12",
    cpf: "284.910.378-00",
    email: "donaldson.nunes@gmail.com",
    phone: "(11) 99999-0000",
    passport: "FP892341",
    createdAt: "2026-11-15T05:00:00.000Z",
  },
  {
    id: "PAX-CLI-1",
    userEmail: "cliente@singviagens.com.br",
    firstName: "Mariana",
    lastName: "Costa",
    birthDate: "1992-08-19",
    cpf: "391.482.108-45",
    email: "cliente@singviagens.com.br",
    phone: "(11) 98877-6655",
    passport: "",
    createdAt: "2026-11-15T05:00:00.000Z",
  },
];

export async function fetchFrequentPassengersFromSupabase(
  userEmail?: string
): Promise<FrequentPassengerItem[]> {
  try {
    const queryUrl = userEmail
      ? `${SUPABASE_URL}/rest/v1/frequent_passengers?select=*&order=created_at.desc`
      : `${SUPABASE_URL}/rest/v1/frequent_passengers?select=*&order=created_at.desc`;
    const res = await fetch(queryUrl, {
      headers: supabaseHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_FREQUENT_PASSENGERS;
    const rows = await res.json();
    if (!Array.isArray(rows)) return DEFAULT_FREQUENT_PASSENGERS;
    const mapped: FrequentPassengerItem[] = rows.map((r: any) => ({
      id: r.id,
      userEmail: r.user_email,
      firstName: r.first_name,
      lastName: r.last_name,
      birthDate: r.birth_date,
      cpf: r.cpf,
      email: r.email || "",
      phone: r.phone || "",
      passport: r.passport || "",
      createdAt: r.created_at,
    }));
    if (userEmail) {
      return mapped.filter(
        (p) => p.userEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()
      );
    }
    return mapped;
  } catch (err) {
    console.error("Failed to fetch frequent passengers from Supabase:", err);
    return userEmail
      ? DEFAULT_FREQUENT_PASSENGERS.filter(
          (p) => p.userEmail.toLowerCase() === userEmail.toLowerCase()
        )
      : DEFAULT_FREQUENT_PASSENGERS;
  }
}

export async function upsertFrequentPassengerToSupabase(
  pax: FrequentPassengerItem
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/frequent_passengers?on_conflict=id`, {
      method: "POST",
      headers: supabaseHeaders({
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify({
        id: pax.id,
        user_email: pax.userEmail.trim().toLowerCase(),
        first_name: pax.firstName.trim(),
        last_name: pax.lastName.trim(),
        birth_date: pax.birthDate.trim(),
        cpf: pax.cpf.trim(),
        email: (pax.email || "").trim(),
        phone: (pax.phone || "").trim(),
        passport: (pax.passport || "").trim(),
        created_at: pax.createdAt || new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Failed to upsert frequent passenger to Supabase:", err);
  }
}

export async function deleteFrequentPassengerFromSupabase(id: string): Promise<void> {
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/frequent_passengers?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: supabaseHeaders({ Prefer: "return=minimal" }),
      }
    );
  } catch (err) {
    console.error("Failed to delete frequent passenger from Supabase:", err);
  }
}
