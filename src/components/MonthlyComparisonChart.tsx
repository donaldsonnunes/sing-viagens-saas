"use client";

import React, { useMemo, useState } from "react";

interface OrderLike {
  status?: string;
  createdAt?: string;
  departureDate?: string;
  singTotalPrice?: number;
  airlineDirectReferencePrice?: number;
  savingsAmount?: number;
}

interface MonthlyPoint {
  key: string; // YYYY-MM
  label: string; // Ex: Nov/26
  airlineTotal: number;
  singTotal: number;
  savingsTotal: number;
  ordersCount: number;
}

const MONTH_ABBR_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatBRL(val: number): string {
  return val.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCompactBRL(val: number): string {
  if (val >= 1000) {
    return `R$ ${(val / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return `R$ ${Math.round(val)}`;
}

export function MonthlyComparisonChart({
  orders,
}: {
  orders: OrderLike[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { points, maxVal, activeMonthsCount } = useMemo(() => {
    const confirmed = orders.filter((o) => o.status !== "CANCELADO");
    const now = new Date();
    const months: MonthlyPoint[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${yyyy}-${mm}`;
      const label = `${MONTH_ABBR_PT[d.getMonth()]}/${String(yyyy).slice(2)}`;
      months.push({
        key,
        label,
        airlineTotal: 0,
        singTotal: 0,
        savingsTotal: 0,
        ordersCount: 0,
      });
    }

    const monthMap = new Map(months.map((m) => [m.key, m]));

    for (const o of confirmed) {
      const dateStr = String(o.createdAt || o.departureDate || "").slice(0, 7);
      const bucket = monthMap.get(dateStr);
      if (!bucket) continue;

      const sing = Number(o.singTotalPrice || 0);
      const rawRef = Number(o.airlineDirectReferencePrice || 0);
      const sav = Number(o.savingsAmount || 0);
      const airline = rawRef < sing && sav > 0 ? sing + sav : rawRef;

      bucket.singTotal += sing;
      bucket.airlineTotal += airline;
      bucket.savingsTotal += Math.max(0, airline - sing);
      bucket.ordersCount += 1;
    }

    const highest = months.reduce(
      (acc, m) => Math.max(acc, m.airlineTotal, m.singTotal, m.savingsTotal),
      0
    );
    const activeCount = months.filter((m) => m.ordersCount > 0).length;

    return {
      points: months,
      maxVal: highest > 0 ? highest * 1.18 : 1000,
      activeMonthsCount: activeCount,
    };
  }, [orders]);

  if (orders.filter((o) => o.status !== "CANCELADO").length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 text-xs text-zinc-400 text-center">
        Realize sua primeira emissão para visualizar o gráfico temporal dos últimos 12 meses.
      </div>
    );
  }

  // Dimensões do SVG responsivo
  const svgW = 760;
  const svgH = 250;
  const padL = 56;
  const padR = 20;
  const padT = 24;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const slotW = plotW / points.length;
  const barW = Math.min(18, slotW * 0.28);
  const barGap = 3;

  const yForValue = (val: number) =>
    padT + plotH - (Math.max(0, val) / maxVal) * plotH;

  const linePoints = points
    .map((pt, idx) => {
      const cx = padL + idx * slotW + slotW / 2;
      const cy = yForValue(pt.savingsTotal);
      return `${cx},${cy}`;
    })
    .join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    val: maxVal * ratio,
    y: padT + plotH * (1 - ratio),
  }));

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="pt-3 border-t border-white/10 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-white">
            Evolução Mensal (Últimos 12 Meses)
          </div>
          <div className="text-[11px] text-zinc-400">
            Colunas comparando Preço Aérea vs. Preço Sing e linha de diferença mensal ({activeMonthsCount}{" "}
            {activeMonthsCount === 1 ? "mês com emissões" : "meses com emissões"})
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#94A3B8] inline-block" />
            Preço Aérea
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#BD9472] font-semibold">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#BD9472] inline-block" />
            Preço Sing
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
            <span className="inline-flex items-center">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-2 inline-block border border-[#09090B]" />
            </span>
            Diferença (Economia)
          </span>
        </div>
      </div>

      {/* Tooltip dinâmico no topo se houver mês em foco */}
      {hoveredPoint && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#172C3B] border border-[#BD9472]/40 text-[11px]">
          <span className="font-bold text-white">
            {hoveredPoint.label} ({hoveredPoint.ordersCount}{" "}
            {hoveredPoint.ordersCount === 1 ? "emissão" : "emissões"})
          </span>
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span className="text-zinc-300">
              Aérea: <strong>{formatBRL(hoveredPoint.airlineTotal)}</strong>
            </span>
            <span className="text-[#BD9472]">
              Sing: <strong>{formatBRL(hoveredPoint.singTotal)}</strong>
            </span>
            <span className="text-emerald-300 font-bold">
              Diferença: +{formatBRL(hoveredPoint.savingsTotal)}
            </span>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full min-w-[560px] h-auto select-none"
          role="img"
          aria-label="Gráfico comparativo mensal dos últimos 12 meses: Preço Aérea vs Preço Sing e linha de economia"
        >
          {/* Grid horizontal */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={padL}
                y1={t.y}
                x2={svgW - padR}
                y2={t.y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray={i === 0 ? undefined : "3 3"}
              />
              <text
                x={padL - 8}
                y={t.y + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.45)"
                fontSize="9"
                fontFamily="monospace"
              >
                {t.val === 0 ? "R$ 0" : formatCompactBRL(t.val)}
              </text>
            </g>
          ))}

          {/* Colunas (Preço Aérea e Preço Sing) */}
          {points.map((pt, idx) => {
            const centerX = padL + idx * slotW + slotW / 2;
            const airlineX = centerX - barW - barGap / 2;
            const singX = centerX + barGap / 2;

            const airlineY = yForValue(pt.airlineTotal);
            const singY = yForValue(pt.singTotal);
            const baselineY = padT + plotH;

            const airlineH = Math.max(0, baselineY - airlineY);
            const singH = Math.max(0, baselineY - singY);

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={pt.key}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Área invisível de hover por coluna */}
                <rect
                  x={padL + idx * slotW}
                  y={padT}
                  width={slotW}
                  height={plotH + 24}
                  fill={isHovered ? "rgba(255,255,255,0.04)" : "transparent"}
                  rx={4}
                />

                {/* Barra Preço Aérea */}
                {airlineH > 0 && (
                  <rect
                    x={airlineX}
                    y={airlineY}
                    width={barW}
                    height={airlineH}
                    rx={3}
                    fill="#94A3B8"
                    opacity={isHovered ? 1 : 0.85}
                  />
                )}

                {/* Barra Preço Sing */}
                {singH > 0 && (
                  <rect
                    x={singX}
                    y={singY}
                    width={barW}
                    height={singH}
                    rx={3}
                    fill="#BD9472"
                    opacity={isHovered ? 1 : 0.95}
                  />
                )}

                {/* Rótulo do mês no eixo X */}
                <text
                  x={centerX}
                  y={baselineY + 16}
                  textAnchor="middle"
                  fill={
                    pt.ordersCount > 0 || isHovered
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.42)"
                  }
                  fontSize="9.5"
                  fontWeight={pt.ordersCount > 0 ? "700" : "400"}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}

          {/* Linha de Diferença (Economia) */}
          <polyline
            fill="none"
            stroke="#34D399"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={linePoints}
          />

          {/* Pontos (points) em cada mês mostrando a diferença */}
          {points.map((pt, idx) => {
            const cx = padL + idx * slotW + slotW / 2;
            const cy = yForValue(pt.savingsTotal);
            const isHovered = hoveredIdx === idx;
            const hasSavings = pt.savingsTotal > 0;

            return (
              <g
                key={`pt-${pt.key}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : hasSavings ? 4.2 : 2.5}
                  fill={hasSavings ? "#34D399" : "#475569"}
                  stroke="#09090B"
                  strokeWidth="1.5"
                />
                {hasSavings && (
                  <text
                    x={cx}
                    y={Math.max(12, cy - 8)}
                    textAnchor="middle"
                    fill="#6EE7B7"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    +{formatCompactBRL(pt.savingsTotal)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
