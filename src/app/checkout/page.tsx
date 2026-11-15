"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Calendar,
  ShieldCheck,
  Plane,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CheckoutPage() {
  const [mode, setMode] = useState<"CHECKOUT_FLIGHT" | "SCHEDULE_CONSULTATION">(
    "CHECKOUT_FLIGHT"
  );
  const [selectedData, setSelectedData] = useState<any>(null);
  const [customerName, setCustomerName] = useState("Cliente VIP Sing");
  const [customerEmail, setCustomerEmail] = useState("cliente@singviagens.com.br");
  const [customerPhone, setCustomerPhone] = useState("(11) 98888-7777");
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("sing_selected_checkout");
    if (raw) {
      try {
        setSelectedData(JSON.parse(raw));
      } catch {
        setSelectedData(null);
      }
    }
  }, []);

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const offer = selectedData?.offer;
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_ORDER",
        userEmail: customerEmail,
        customerName,
        customerPhone,
        flightCode: offer?.flightNumber || "LA3418",
        airline: offer?.operatingAirlineName || "LATAM Airlines",
        origin: offer?.originAirport?.iata || "GRU",
        destination: offer?.destinationAirport?.iata || "GIG",
        departureDate: selectedData?.searchParams?.departureDate || "2026-12-10",
        returnDate: selectedData?.searchParams?.returnDate || "2026-12-15",
        passengersSummary: `${selectedData?.searchParams?.adults || 2} Adulto(s), ${
          selectedData?.searchParams?.childrenAges?.length || 0
        } Menor(es)`,
        singTotalPrice: offer?.pricingBreakdown?.singFinalSalePriceTotal || 1842.5,
        airlineDirectReferencePrice:
          offer?.airlineDirectComparison?.[0]?.directWebsitePriceTotal || 2190,
        savingsAmount: offer?.bestSavingsVsOperatingAirline || 347.5,
        milesCostTotal: offer?.pricingBreakdown?.totalMilesCostWithTaxes || 1495,
        singProfitAmount: offer?.pricingBreakdown?.singProfitAmount || 347.5,
        paymentMethod,
      }),
    });
    const data = await res.json();
    if (data.order) {
      setConfirmedOrder(data.order);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-12 border-b border-[#BD9472]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>Fechamento Online Seguro & Agendamento VIP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Checkout Direto de Passagens & Agenda de Consultoria
          </h1>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMode("CHECKOUT_FLIGHT")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                mode === "CHECKOUT_FLIGHT"
                  ? "bg-[#BD9472] text-[#0E1B24]"
                  : "bg-white/10 text-white"
              }`}
            >
              1. Emitir Passagem Aérea Online
            </button>
            <button
              type="button"
              onClick={() => setMode("SCHEDULE_CONSULTATION")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                mode === "SCHEDULE_CONSULTATION"
                  ? "bg-[#BD9472] text-[#0E1B24]"
                  : "bg-white/10 text-white"
              }`}
            >
              2. Agendar Horário com Especialista na Agenda
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {mode === "CHECKOUT_FLIGHT" ? (
          confirmedOrder ? (
            <div className="rounded-2xl bg-white border border-emerald-300 p-8 text-center space-y-5 shadow-lg">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172C3B]">
                Reserva Confirmada! Localizador Oficial: {confirmedOrder.pnr}
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Sua emissão foi registrada no seu Histórico de Compras da Sing Viagens ({confirmedOrder.userEmail}). Você economizou{" "}
                <strong>
                  R$ {confirmedOrder.savingsAmount.toLocaleString("pt-BR")}
                </strong>{" "}
                em relação à compra direta na companhia aérea.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Link
                  href="/conta"
                  className="px-6 py-3 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-xs sm:text-sm"
                >
                  Acessar Minha Conta e Ver Bilhete
                </Link>
                <Link
                  href="/pesquisa"
                  className="px-6 py-3 rounded-xl border border-gray-300 text-[#172C3B] font-bold text-xs sm:text-sm"
                >
                  Nova Pesquisa
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 rounded-2xl bg-white border border-gray-200 p-7 space-y-6">
                <h2 className="text-xl font-extrabold text-[#172C3B]">
                  Dados do Responsável e Pagamento
                </h2>
                <form onSubmit={handleConfirmPurchase} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      Nome Completo do Passageiro Responsável
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172C3B] mb-1">
                        E-mail (para salvar no Histórico da Conta)
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172C3B] mb-1">
                        WhatsApp para Receber o E-Ticket
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#172C3B] mb-2">
                      Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("PIX")}
                        className={`p-3.5 rounded-xl border text-left transition ${
                          paymentMethod === "PIX"
                            ? "border-[#BD9472] bg-[#172C3B] text-white"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="text-xs font-bold">PIX Imediato</div>
                        <div className="text-[11px] opacity-80">
                          Emissão prioritária do PNR
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CREDIT_CARD")}
                        className={`p-3.5 rounded-xl border text-left transition ${
                          paymentMethod === "CREDIT_CARD"
                            ? "border-[#BD9472] bg-[#172C3B] text-white"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="text-xs font-bold">Cartão de Crédito</div>
                        <div className="text-[11px] opacity-80">
                          Em até 10x conforme cia aérea
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#BD9472] text-[#0E1B24] font-extrabold text-sm hover:bg-[#D4AF8E] transition shadow-md"
                  >
                    Finalizar Compra e Emitir Localizador
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-7 border border-[#BD9472]/40 space-y-4 h-fit">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#BD9472]">
                  <Plane className="w-4 h-4" />
                  <span>Resumo da Seleção Sing</span>
                </div>
                <div className="text-lg font-extrabold text-white">
                  {selectedData?.offer
                    ? `${selectedData.offer.originAirport.city} (${selectedData.offer.originAirport.iata}) → ${selectedData.offer.destinationAirport.city} (${selectedData.offer.destinationAirport.iata})`
                    : "São Paulo (GRU) → Rio de Janeiro (GIG)"}
                </div>
                <div className="text-xs text-[#E8E2D9]/80">
                  Voo:{" "}
                  {selectedData?.offer
                    ? `${selectedData.offer.operatingAirlineName} (${selectedData.offer.flightNumber})`
                    : "LATAM Airlines (LA3418)"}
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Preço no site oficial da Cia Aérea:</span>
                    <span className="line-through text-red-300">
                      R${" "}
                      {(
                        selectedData?.offer?.airlineDirectComparison?.[0]
                          ?.directWebsitePriceTotal || 2190
                      ).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#BD9472]">
                    <span>Total Final Sing Viagens:</span>
                    <span>
                      R${" "}
                      {(
                        selectedData?.offer?.pricingBreakdown?.singFinalSalePriceTotal ||
                        1842.5
                      ).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Agendamento Online de Consultoria VIP */
          <div className="rounded-2xl bg-white border border-gray-200 p-8 max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-extrabold text-[#172C3B] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#BD9472]" />
              <span>Agendar Atendimento Online com Especialista Sing</span>
            </h2>
            {scheduleConfirmed ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <div className="font-bold text-[#172C3B]">
                  Horário Reservado na Agenda Sing!
                </div>
                <p className="text-xs text-gray-600">
                  Enviamos o link da videochamada / confirmação de WhatsApp para o seu e-mail.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setScheduleConfirmed(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      Escolha a Data
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-11-18"
                      required
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      Escolha o Horário Disponível
                    </label>
                    <select className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm">
                      <option>10:00 — Consultoria Shows & Festivais</option>
                      <option>14:30 — Planejamento Internacional / Família</option>
                      <option>16:00 — Atendimento Corporativo & Grupos</option>
                      <option>19:00 — Horário Especial Noturno</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-sm hover:bg-[#BD9472] hover:text-[#0E1B24] transition"
                >
                  Confirmar Agendamento Online
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
