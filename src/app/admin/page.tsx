"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Save,
  CheckCircle2,
  Calculator,
  ArrowRight,
  RefreshCw,
  Coins,
  TrendingUp,
  Calendar,
  BarChart3,
  XCircle,
  ShoppingBag,
  Search,
} from "lucide-react";

export default function AdminPricingPage() {
  const [config, setConfig] = useState({
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
  });

  const [allSearches, setAllSearches] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtro de Período da Dashboard Admin (Padrão: últimos 30 dias até hoje)
  const [startDate, setStartDate] = useState("2026-10-15");
  const [endDate, setEndDate] = useState("2026-12-31");

  // Simulador em Tempo Real no Admin
  const [simAirline, setSimAirline] =
    useState<keyof typeof config.mileCostPerThousand>("LATAM");
  const [simMilesAmount, setSimMilesAmount] = useState(35000);
  const [simBoardingTax, setSimBoardingTax] = useState(142.5);
  const [simDirectAirlineCashPrice, setSimDirectAirlineCashPrice] = useState(1500);

  const loadAdminData = () => {
    setLoading(true);
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.pricingConfig) {
          setConfig(data.pricingConfig);
        }
        if (Array.isArray(data.searchHistory)) {
          setAllSearches(data.searchHistory);
        }
        if (Array.isArray(data.orders)) {
          setAllOrders(data.orders);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtragem de Pesquisas e Pedidos pelo Período Informado (startDate -> endDate)
  const filteredMetrics = useMemo(() => {
    const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0;
    const endMs = endDate
      ? new Date(`${endDate}T23:59:59.999`).getTime()
      : Number.MAX_SAFE_INTEGER;

    const searchesInPeriod = allSearches.filter((s) => {
      const t = new Date(s.createdAt || Date.now()).getTime();
      return t >= startMs && t <= endMs;
    });

    const ordersInPeriod = allOrders.filter((o) => {
      const t = new Date(o.createdAt || Date.now()).getTime();
      return t >= startMs && t <= endMs;
    });

    const confirmedOrders = ordersInPeriod.filter((o) => o.status !== "CANCELADO");
    const cancelledOrders = ordersInPeriod.filter((o) => o.status === "CANCELADO");

    const totalRevenueSing = confirmedOrders.reduce(
      (acc, o) => acc + Number(o.singTotalPrice || 0),
      0
    );
    const totalMilesCost = confirmedOrders.reduce((acc, o) => {
      const singTotal = Number(o.singTotalPrice || 0);
      const profit = Number(o.singProfitAmount ?? o.savingsAmount ?? 0);
      const cost = Number(o.milesCostTotal ?? Math.max(0, singTotal - profit));
      return acc + cost;
    }, 0);

    const totalProfitBRL = Math.max(0, totalRevenueSing - totalMilesCost);
    const profitMarginOnRevenuePercent =
      totalRevenueSing > 0
        ? Math.round((totalProfitBRL / totalRevenueSing) * 1000) / 10
        : 0;
    const roiOnMilesCostPercent =
      totalMilesCost > 0
        ? Math.round((totalProfitBRL / totalMilesCost) * 1000) / 10
        : 0;

    const cancelledVolumeBRL = cancelledOrders.reduce(
      (acc, o) => acc + Number(o.singTotalPrice || 0),
      0
    );
    const cancellationRatePercent =
      ordersInPeriod.length > 0
        ? Math.round((cancelledOrders.length / ordersInPeriod.length) * 1000) / 10
        : 0;

    const conversionRatePercent =
      searchesInPeriod.length > 0
        ? Math.round((confirmedOrders.length / searchesInPeriod.length) * 1000) / 10
        : 0;

    return {
      searchesCount: searchesInPeriod.length,
      totalOrdersInPeriod: ordersInPeriod.length,
      confirmedCount: confirmedOrders.length,
      cancelledCount: cancelledOrders.length,
      totalRevenueSing,
      totalMilesCost,
      totalProfitBRL,
      profitMarginOnRevenuePercent,
      roiOnMilesCostPercent,
      cancelledVolumeBRL,
      cancellationRatePercent,
      conversionRatePercent,
      ordersList: ordersInPeriod,
    };
  }, [allSearches, allOrders, startDate, endDate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (data.success) {
      setConfig(data.pricingConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const handleToggleOrderStatus = async (
    orderId: string,
    newStatus: "CONFIRMADO" | "CANCELADO"
  ) => {
    const res = await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    const data = await res.json();
    if (Array.isArray(data.orders)) {
      setAllOrders(data.orders);
    }
  };

  const applyQuickPeriod = (days: number | "ALL") => {
    if (days === "ALL") {
      setStartDate("2025-01-01");
      setEndDate("2027-12-31");
      return;
    }
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    setStartDate(past.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  };

  // Cálculo do Simulador (Milheiro + Taxas vs. Valor Cia Aérea)
  const selectedMileRate = config.mileCostPerThousand[simAirline] || 24.5;
  const simMilesPureCost =
    Math.round((simMilesAmount / 1000) * selectedMileRate * 100) / 100;
  const simTotalCostInMilesWithTaxes =
    Math.round((simMilesPureCost + simBoardingTax) * 100) / 100;
  const simGrossDifference = Math.max(
    0,
    simDirectAirlineCashPrice - simTotalCostInMilesWithTaxes
  );
  const simSingProfit =
    Math.round(
      simGrossDifference * (config.profitShareOnSavingsPercent / 100) * 100
    ) / 100;
  const simSingFinalPrice =
    Math.round((simTotalCostInMilesWithTaxes + simSingProfit) * 100) / 100;
  const simCustomerSavings =
    Math.round((simDirectAirlineCashPrice - simSingFinalPrice) * 100) / 100;

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 text-[#09090B]">
      {/* Header Dark Mode Sofisticado */}
      <section className="bg-[#09090B] text-white pt-24 pb-12 -mt-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <SlidersHorizontal className="w-4 h-4" />
              <span>ADMINISTRADOR MASTER: DONALDSON.NUNES@GMAIL.COM</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Dashboard Gerencial, Margem de Lucro e Precificação
            </h1>
            <p className="text-sm text-zinc-400 max-w-3xl">
              Acompanhe por período o volume de pesquisas, passagens emitidas, margem de lucro real e cancelamentos, além de parametrizar o valor do milheiro por companhia aérea.
            </p>
          </div>

          <Link
            href="/pesquisa"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#BD9472] text-[#09090B] font-display font-bold text-xs sm:text-sm hover:bg-[#D4AF8E] transition shadow"
          >
            <span>Ver Resultado na Pesquisa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* =====================================================================
            DASHBOARD DO ADMINISTRADOR POR PERÍODO INFORMADO
           ===================================================================== */}
        <div className="rounded-2xl bg-white border border-zinc-200/90 shadow-md p-6 sm:p-7 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#BD9472]">
                <BarChart3 className="w-4 h-4" />
                <span>Indicadores de Performance & Resultado por Período</span>
              </div>
              <h2 className="font-display text-xl font-extrabold text-[#09090B]">
                Dashboard Administrativo — Pesquisas, Vendas, Lucro e Cancelamentos
              </h2>
            </div>

            {/* Filtro de Data Inicial e Data Final + Atalhos */}
            <div className="flex flex-wrap items-center gap-2.5 bg-[#FAFAFA] p-2.5 rounded-2xl border border-zinc-200">
              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-4 h-4 text-[#BD9472]" />
                <span className="text-xs font-bold text-[#172C3B]">Período:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="Data Inicial"
                  className="rounded-xl bg-white border border-zinc-300 px-2.5 py-1.5 font-mono text-xs font-bold text-[#09090B]"
                />
                <span className="text-xs text-zinc-400">até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label="Data Final"
                  className="rounded-xl bg-white border border-zinc-300 px-2.5 py-1.5 font-mono text-xs font-bold text-[#09090B]"
                />
              </div>
              <div className="flex items-center gap-1 pl-1 border-l border-zinc-200">
                <button
                  type="button"
                  onClick={() => applyQuickPeriod(7)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200/70 hover:bg-[#172C3B] hover:text-white transition"
                >
                  7 dias
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod(30)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200/70 hover:bg-[#172C3B] hover:text-white transition"
                >
                  30 dias
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod("ALL")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#172C3B] text-[#BD9472] hover:opacity-90 transition"
                >
                  Todo o Período
                </button>
              </div>
            </div>
          </div>

          {/* 4 Cards Principais do Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Pesquisas no Período */}
            <div className="rounded-2xl bg-[#FAFAFA] border border-zinc-200/90 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>1. Pesquisas no Período</span>
                <Search className="w-4 h-4 text-[#172C3B]" />
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#09090B]">
                {filteredMetrics.searchesCount}
              </div>
              <div className="text-[11px] text-zinc-500">
                Taxa de conversão em compra:{" "}
                <strong className="text-[#172C3B]">
                  {filteredMetrics.conversionRatePercent}%
                </strong>
              </div>
            </div>

            {/* 2. Passagens Compradas (Confirmadas) */}
            <div className="rounded-2xl bg-[#FAFAFA] border border-zinc-200/90 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>2. Passagens Compradas</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-[#09090B]">
                  {filteredMetrics.confirmedCount}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  ativas
                </span>
              </div>
              <div className="text-[11px] text-zinc-500">
                Faturamento Sing:{" "}
                <strong className="font-mono text-[#09090B]">
                  {formatBRL(filteredMetrics.totalRevenueSing)}
                </strong>
              </div>
            </div>

            {/* 3. Margem de Lucro Realizada no Período */}
            <div className="rounded-2xl bg-[#172C3B] text-white border border-[#BD9472]/50 p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[#BD9472]">
                <span>3. Lucro & Margem Real</span>
                <TrendingUp className="w-4 h-4 text-[#BD9472]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-extrabold text-white">
                  {formatBRL(filteredMetrics.totalProfitBRL)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                  {filteredMetrics.profitMarginOnRevenuePercent}%
                </span>
              </div>
              <div className="text-[11px] text-[#E8E2D9]/80">
                Custo Milhas: {formatBRL(filteredMetrics.totalMilesCost)} (ROI:{" "}
                +{filteredMetrics.roiOnMilesCostPercent}%)
              </div>
            </div>

            {/* 4. Cancelamentos no Período */}
            <div className="rounded-2xl bg-red-50/60 border border-red-200 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-red-800">
                <span>4. Cancelamentos</span>
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-red-700">
                  {filteredMetrics.cancelledCount}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-xs font-bold">
                  {filteredMetrics.cancellationRatePercent}% dos pedidos
                </span>
              </div>
              <div className="text-[11px] text-red-700/80">
                Volume cancelado:{" "}
                <strong className="font-mono">
                  {formatBRL(filteredMetrics.cancelledVolumeBRL)}
                </strong>
              </div>
            </div>
          </div>

          {/* Lista Auditável de Pedidos do Período (Com botão para testar Cancelamento / Reativação) */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Passagens do Período Selecionado ({filteredMetrics.ordersList.length}{" "}
                registros)
              </div>
              <span className="text-[11px] text-zinc-400">
                Você pode simular um cancelamento ou reativação abaixo para testar o impacto imediato na margem
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-600 border-b border-zinc-200 font-semibold">
                    <th className="py-2.5 px-3">PNR / Data</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Rota / Cia</th>
                    <th className="py-2.5 px-3">Custo Milhas</th>
                    <th className="py-2.5 px-3">Venda Sing</th>
                    <th className="py-2.5 px-3">Lucro Sing</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {filteredMetrics.ordersList.map((ord) => {
                    const isCancelled = ord.status === "CANCELADO";
                    const singTotal = Number(ord.singTotalPrice || 0);
                    const profit = Number(
                      ord.singProfitAmount ?? ord.savingsAmount ?? 0
                    );
                    const milesCost = Number(
                      ord.milesCostTotal ?? Math.max(0, singTotal - profit)
                    );
                    const marginPct =
                      singTotal > 0 ? Math.round((profit / singTotal) * 100) : 0;

                    return (
                      <tr
                        key={ord.id}
                        className={isCancelled ? "bg-red-50/30 text-zinc-400" : ""}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#172C3B]">
                          <div>{ord.pnr}</div>
                          <div className="text-[10px] font-normal text-zinc-400">
                            {new Date(ord.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#09090B]">
                            {ord.customerName}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {ord.userEmail}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold">
                            {ord.origin} → {ord.destination}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {ord.airline} ({ord.flightCode})
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {formatBRL(milesCost)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#09090B]">
                          {formatBRL(singTotal)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span
                            className={`font-bold ${
                              isCancelled ? "line-through text-zinc-400" : "text-emerald-700"
                            }`}
                          >
                            +{formatBRL(profit)} ({marginPct}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCancelled
                                ? "bg-red-100 text-red-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isCancelled ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleOrderStatus(ord.id, "CONFIRMADO")
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#172C3B] text-white font-semibold text-[11px] hover:opacity-90"
                            >
                              Reativar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleOrderStatus(ord.id, "CANCELADO")
                              }
                              className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-semibold text-[11px] hover:bg-red-200"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =====================================================================
            PARAMETRIZAÇÃO DE MILHEIRO E SIMULADOR
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda (7 cols): Formulário de Parametrização */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-7 rounded-2xl bg-white border border-zinc-200/80 p-7 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#BD9472]" />
                <h2 className="font-display text-lg font-extrabold text-[#09090B]">
                  1. Valor de Compra por Milheiro em Cada Companhia (R$)
                </h2>
              </div>
              {loading && (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Carregando...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(
                Object.keys(config.mileCostPerThousand) as Array<
                  keyof typeof config.mileCostPerThousand
                >
              ).map((cia) => (
                <div
                  key={cia}
                  className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-zinc-200/90 hover:border-[#BD9472] transition"
                >
                  <label className="block font-mono text-xs font-bold text-[#172C3B] mb-1">
                    Milheiro {cia} (R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.mileCostPerThousand[cia]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mileCostPerThousand: {
                          ...config.mileCostPerThousand,
                          [cia]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 font-mono text-sm font-bold text-[#09090B]"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Custo p/ 1.000 milhas
                  </span>
                </div>
              ))}
            </div>

            {/* Seção 2: Margem de Lucro sobre a Diferença */}
            <div className="pt-4 border-t border-zinc-100 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#BD9472]" />
                <h2 className="font-display text-lg font-extrabold text-[#09090B]">
                  2. Margem de Lucro (%) entre Custo em Milhas e Valor da Cia
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8E2D9]/45 border border-[#BD9472]/40 text-xs text-[#172C3B] leading-relaxed">
                <strong>Como o sistema calcula:</strong> Se a passagem fica{" "}
                <strong>R$ 1.000,00</strong> no custo em milhas (já com taxas) e está custando{" "}
                <strong>R$ 1.500,00</strong> na companhia aérea, a diferença é de{" "}
                <strong>R$ 500,00</strong>. Com <strong>50%</strong> parametrizado abaixo, o lucro da Sing será{" "}
                <strong>R$ 250,00</strong> e o preço final exibido ao cliente será{" "}
                <strong>R$ 1.250,00</strong>.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#09090B] mb-1">
                    Margem de Lucro sobre a Diferença (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={config.profitShareOnSavingsPercent}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        profitShareOnSavingsPercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 font-mono text-sm font-bold text-[#09090B]"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Ex: 50% divide a economia ao meio com o cliente
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#09090B] mb-1">
                    Desconto Criança (2 a 11 anos) (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={config.childDiscountPercent}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        childDiscountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 font-mono text-sm font-bold text-[#09090B]"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Aplicado para viajantes crianças
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#09090B] mb-1">
                    Desconto Bebê (0 a 1 ano) (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={config.infantDiscountPercent}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        infantDiscountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 font-mono text-sm font-bold text-[#09090B]"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Aplicado para bebês de colo
                  </span>
                </div>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Valores de milheiro e margem de lucro salvos no Supabase! O motor de pesquisa já está aplicando esta parametrização.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#09090B] text-white font-display font-bold text-sm hover:bg-[#BD9472] hover:text-[#09090B] transition shadow"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Valores de Milheiro e Margem de Lucro</span>
            </button>
          </form>

          {/* Coluna Direita (5 cols): Simulador Interativo do Exemplo Oficial */}
          <div className="lg:col-span-5 rounded-2xl bg-[#09090B] text-white p-7 border border-white/10 space-y-5 h-fit">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
                <Calculator className="w-4 h-4" />
                <span>Simulador de Milhas vs. Cia Aérea</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSimAirline("LATAM");
                  setSimMilesAmount(35000);
                  setSimBoardingTax(142.5);
                  setSimDirectAirlineCashPrice(1500);
                }}
                className="font-mono text-[10px] underline text-[#BD9472] hover:text-white"
              >
                Carregar Exemplo (R$ 1.000 vs R$ 1.500)
              </button>
            </div>

            <h3 className="font-display text-lg font-bold text-white">
              Simule o retorno da API (Milhas + Valor na Cia)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Companhia Aérea
                </label>
                <select
                  value={simAirline}
                  onChange={(e) =>
                    setSimAirline(
                      e.target.value as keyof typeof config.mileCostPerThousand
                    )
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs font-bold text-white"
                >
                  <option value="LATAM" className="text-black">
                    LATAM (R$ {config.mileCostPerThousand.LATAM}/mil)
                  </option>
                  <option value="GOL" className="text-black">
                    GOL (R$ {config.mileCostPerThousand.GOL}/mil)
                  </option>
                  <option value="AZUL" className="text-black">
                    AZUL (R$ {config.mileCostPerThousand.AZUL}/mil)
                  </option>
                  <option value="TAP" className="text-black">
                    TAP (R$ {config.mileCostPerThousand.TAP}/mil)
                  </option>
                  <option value="AMERICAN" className="text-black">
                    AMERICAN (R$ {config.mileCostPerThousand.AMERICAN}/mil)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Milhas Retornadas na API
                </label>
                <input
                  type="number"
                  step="500"
                  value={simMilesAmount}
                  onChange={(e) => setSimMilesAmount(Number(e.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 font-mono text-xs font-bold text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Taxas de Embarque (R$)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={simBoardingTax}
                  onChange={(e) => setSimBoardingTax(Number(e.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 font-mono text-xs font-bold text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Valor na Cia c/ Taxas (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  value={simDirectAirlineCashPrice}
                  onChange={(e) =>
                    setSimDirectAirlineCashPrice(Number(e.target.value))
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 font-mono text-xs font-bold text-white"
                />
              </div>
            </div>

            {/* Resultado Passo a Passo do Simulador */}
            <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Custo Puro das Milhas ({simMilesAmount.toLocaleString("pt-BR")} milhas × R${" "}
                  {selectedMileRate}):
                </span>
                <strong className="font-mono text-white">
                  {formatBRL(simMilesPureCost)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">+ Taxas de Embarque:</span>
                <strong className="font-mono text-white">
                  {formatBRL(simBoardingTax)}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-zinc-200 font-semibold">
                  1. Custo Total em Milhas (c/ Taxas):
                </span>
                <strong className="font-mono text-white">
                  {formatBRL(simTotalCostInMilesWithTaxes)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-200 font-semibold">
                  2. Preço Direto na Companhia Aérea:
                </span>
                <strong className="font-mono text-zinc-400 line-through">
                  {formatBRL(simDirectAirlineCashPrice)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Diferença Bruta (Cia - Custo Milhas):
                </span>
                <strong className="font-mono text-emerald-400">
                  {formatBRL(simGrossDifference)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">
                  3. Lucro Sing ({config.profitShareOnSavingsPercent}% da diferença):
                </span>
                <strong className="font-mono text-[#BD9472]">
                  + {formatBRL(simSingProfit)}
                </strong>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-display text-sm font-bold text-white">
                  Preço Final de Venda Sing:
                </span>
                <span className="font-mono text-xl font-extrabold text-[#BD9472]">
                  {formatBRL(simSingFinalPrice)}
                </span>
              </div>

              <div className="pt-1 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold text-[11px]">
                  Cliente economiza {formatBRL(simCustomerSavings)} frente à Cia Aérea
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
