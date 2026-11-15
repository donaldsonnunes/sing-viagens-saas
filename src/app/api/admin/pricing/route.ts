import { NextResponse } from "next/server";
import {
  fetchDatabaseFromSupabase,
  savePricingToSupabase,
  writeDb,
} from "@/lib/db";

export async function GET() {
  const db = await fetchDatabaseFromSupabase();
  return NextResponse.json({
    pricingConfig: db.pricingConfig,
    stats: {
      totalSearches: db.searchHistory.length,
      totalOrders: db.orders.length,
      totalUsers: db.users.length,
    },
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = await fetchDatabaseFromSupabase();

    db.pricingConfig = {
      profitShareOnSavingsPercent: Number(
        body.profitShareOnSavingsPercent ?? db.pricingConfig.profitShareOnSavingsPercent
      ),
      mileCostPerThousand: {
        LATAM: Number(
          body.mileCostPerThousand?.LATAM ?? db.pricingConfig.mileCostPerThousand.LATAM
        ),
        GOL: Number(
          body.mileCostPerThousand?.GOL ?? db.pricingConfig.mileCostPerThousand.GOL
        ),
        AZUL: Number(
          body.mileCostPerThousand?.AZUL ?? db.pricingConfig.mileCostPerThousand.AZUL
        ),
        TAP: Number(
          body.mileCostPerThousand?.TAP ?? db.pricingConfig.mileCostPerThousand.TAP
        ),
        AMERICAN: Number(
          body.mileCostPerThousand?.AMERICAN ??
            db.pricingConfig.mileCostPerThousand.AMERICAN
        ),
        AIRFRANCE: Number(
          body.mileCostPerThousand?.AIRFRANCE ??
            db.pricingConfig.mileCostPerThousand.AIRFRANCE
        ),
      },
      fallbackMarkupPercent: Number(
        body.fallbackMarkupPercent ?? db.pricingConfig.fallbackMarkupPercent
      ),
      fixedEmissionFeePerPassenger: Number(
        body.fixedEmissionFeePerPassenger ?? db.pricingConfig.fixedEmissionFeePerPassenger
      ),
      childDiscountPercent: Number(
        body.childDiscountPercent ?? db.pricingConfig.childDiscountPercent
      ),
      infantDiscountPercent: Number(
        body.infantDiscountPercent ?? db.pricingConfig.infantDiscountPercent
      ),
      updatedAt: new Date().toISOString(),
    };

    await savePricingToSupabase(db.pricingConfig);
    writeDb(db);

    return NextResponse.json({
      success: true,
      pricingConfig: db.pricingConfig,
    });
  } catch (err) {
    console.error("Failed to update pricing config:", err);
    return NextResponse.json(
      { error: "Falha ao atualizar regras de precificação." },
      { status: 500 }
    );
  }
}
