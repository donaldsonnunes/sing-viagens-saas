import { NextResponse } from "next/server";
import { getApiViagensAccountAndSavingsSummary } from "@/lib/apiViagensService";

/**
 * GET /api/apiviagens/account
 * Consulta gratuita de saldo (/v1/account) + Relatório em tempo real de créditos poupados pelo Gateway
 */
export async function GET() {
  try {
    const summary = await getApiViagensAccountAndSavingsSummary();
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("Error in GET /api/apiviagens/account:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao consultar saldo e métricas APIVIAGENS." },
      { status: 500 }
    );
  }
}
