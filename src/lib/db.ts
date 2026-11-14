import fs from "fs";
import path from "path";

export type AirlineKey = "LATAM" | "GOL" | "AZUL" | "TAP" | "AMERICAN" | "AIRFRANCE";

export interface PricingRuleConfig {
  /**
   * Percentual de lucro sobre o Spread (diferença entre o Preço na Cia Aérea e o Custo em Milhas Sing).
   * Exemplo oficial: Se o custo em milhas + taxas fica R$ 1.000,00 e na Cia Aérea custa R$ 1.500,00,
   * a diferença (spread) é R$ 500,00. Com 50% parametrizado, o lucro é R$ 250,00 e o Preço Final Sing = R$ 1.250,00.
   */
  profitShareOnSavingsPercent: number; // Padrão: 50%
  /**
   * Valor de compra do milheiro (1.000 milhas) em R$ para cada companhia aérea
   */
  mileCostPerThousand: Record<AirlineKey, number>;
  /**
   * Caso em algum voo específico o custo em milhas supere ou empate com a tarifa em dinheiro,
   * aplica margem mínima de segurança (%)
   */
  fallbackMarkupPercent: number;
  fixedEmissionFeePerPassenger: number; // Taxa administrativa opcional (R$ 0 por padrão para cálculo puro do spread)
  childDiscountPercent: number; // Desconto para Criança (2 a 11 anos)
  infantDiscountPercent: number; // Desconto para Bebê de colo (0 a 1 ano)
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

export interface PurchaseOrderItem {
  id: string;
  pnr: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  flightCode: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengersSummary: string;
  singTotalPrice: number;
  airlineDirectReferencePrice: number;
  savingsAmount: number;
  paymentMethod: "PIX" | "CREDIT_CARD" | "CORPORATE_INVOICE";
  status: "CONFIRMADO" | "EM_EMISSAO";
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
}

export interface DatabaseSchema {
  pricingConfig: PricingRuleConfig;
  users: UserAccount[];
  searchHistory: SearchHistoryItem[];
  orders: PurchaseOrderItem[];
}

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

const DEFAULT_DB: DatabaseSchema = {
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
      id: "usr-admin-1",
      name: "Diretoria Sing Viagens (Admin)",
      email: "admin@singviagens.com.br",
      passwordHash: "sing2026",
      phone: "(11) 99999-0000",
      role: "ADMIN",
      createdAt: "2026-11-14T10:00:00.000Z",
    },
    {
      id: "usr-demo-1",
      name: "Cliente VIP Sing",
      email: "cliente@singviagens.com.br",
      passwordHash: "123456",
      phone: "(11) 98888-7777",
      role: "CUSTOMER",
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
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    // Garante compatibilidade caso db.json antigo exista sem os novos campos de milheiro
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
  } catch (err) {
    console.error("Failed to write db.json:", err);
  }
}
