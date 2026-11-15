"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicketVoucherModal } from "@/components/TicketVoucherModal";
import {
  CheckCircle2,
  Calendar,
  Plane,
  Sparkles,
  UserCheck,
  FileText,
} from "lucide-react";

interface PassengerFormRow {
  typeLabel: string;
  fullName: string;
  documentCpfOrPassport: string;
  birthDate: string;
}

export default function CheckoutPage() {
  const [mode, setMode] = useState<"CHECKOUT_FLIGHT" | "SCHEDULE_CONSULTATION">(
    "CHECKOUT_FLIGHT"
  );
  const [selectedData, setSelectedData] = useState<any>(null);
  const [customerName, setCustomerName] = useState("Donaldson Nunes");
  const [customerEmail, setCustomerEmail] = useState("donaldson.nunes@gmail.com");
  const [customerPhone, setCustomerPhone] = useState("(11) 98888-7777");
  const [payerCpf, setPayerCpf] = useState("123.456.789-00");
  const [passengersDetails, setPassengersDetails] = useState<PassengerFormRow[]>([
    {
      typeLabel: "Adulto 1 (Titular)",
      fullName: "Donaldson Nunes",
      documentCpfOrPassport: "123.456.789-00",
      birthDate: "1988-05-14",
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sing_user");
    let defaultName = "Cliente VIP Sing";
    let defaultEmail = "cliente@singviagens.com.br";
    let defaultPhone = "(11) 98888-7777";

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.name) defaultName = parsedUser.name;
        if (parsedUser.email) defaultEmail = parsedUser.email;
        if (parsedUser.phone) defaultPhone = parsedUser.phone;
        setCustomerName(defaultName);
        setCustomerEmail(defaultEmail);
        setCustomerPhone(defaultPhone);
      } catch {
        // ignore
      }
    }

    const raw = localStorage.getItem("sing_selected_checkout");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSelectedData(parsed);

        const adultsCount = Math.max(1, Number(parsed?.searchParams?.adults) || 1);
        const childrenAges: number[] = Array.isArray(parsed?.searchParams?.childrenAges)
          ? parsed.searchParams.childrenAges
          : [];

        const rows: PassengerFormRow[] = [];
        for (let i = 0; i < adultsCount; i++) {
          rows.push({
            typeLabel: `Adulto ${i + 1}`,
            fullName: i === 0 ? defaultName : "",
            documentCpfOrPassport: i === 0 ? "123.456.789-00" : "",
            birthDate: i === 0 ? "1988-05-14" : "1990-01-01",
          });
        }
        childrenAges.forEach((age, idx) => {
          rows.push({
            typeLabel:
              age < 2
                ? `Bebê ${idx + 1} (${age} ano)`
                : `Criança ${idx + 1} (${age} anos)`,
            fullName: "",
            documentCpfOrPassport: "",
            birthDate: "2018-06-10",
          });
        });

        setPassengersDetails(rows);
      } catch {
        setSelectedData(null);
      }
    }
  }, []);

  const updatePassengerField = (
    idx: number,
    field: keyof PassengerFormRow,
    value: string
  ) => {
    const copy = [...passengersDetails];
    copy[idx] = { ...copy[idx], [field]: value };
    setPassengersDetails(copy);
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const offer = selectedData?.offer;
    const adultsCount = selectedData?.searchParams?.adults || 1;
    const minorsCount = selectedData?.searchParams?.childrenAges?.length || 0;

    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_ORDER",
        userEmail: customerEmail,
        customerName,
        customerPhone,
        payerCpf,
        flightCode: offer?.flightNumber || "LA3418",
        airline: offer?.operatingAirlineName || "LATAM Airlines",
        origin: offer?.originAirport?.iata || "GRU",
        destination: offer?.destinationAirport?.iata || "GIG",
        departureDate: selectedData?.searchParams?.departureDate || "2026-12-10",
        returnDate: selectedData?.searchParams?.returnDate || "2026-12-15",
        passengersSummary: `${adultsCount} ${
          adultsCount === 1 ? "Adulto" : "Adultos"
        }${
          minorsCount > 0
            ? `, ${minorsCount} ${minorsCount === 1 ? "Criança" : "Crianças"}`
            : ""
        }`,
        passengersDetails,
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
            <span>Emissão Segura ANAC & Agendamento VIP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Identificação dos Passageiros & Emissão de Passagens
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
                Passagem Emitida! Localizador Oficial: {confirmedOrder.pnr}
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Os dados de todos os passageiros foram registrados no banco de dados da Sing Viagens ({confirmedOrder.userEmail}). Você economizou{" "}
                <strong>
                  R$ {Number(confirmedOrder.savingsAmount).toLocaleString("pt-BR")}
                </strong>{" "}
                em relação à compra direta na companhia aérea.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BD9472] text-[#0E1B24] font-extrabold text-xs sm:text-sm hover:bg-[#D4AF8E] transition shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>Abrir Voucher / E-Ticket Oficial (PDF)</span>
                </button>
                <Link
                  href="/conta"
                  className="px-6 py-3 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-xs sm:text-sm"
                >
                  Ir para Meu Dashboard e Compras
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
              <div className="lg:col-span-7 rounded-2xl bg-white border border-gray-200 p-7 space-y-6 shadow-xs">
                <form onSubmit={handleConfirmPurchase} className="space-y-6">
                  {/* Seção 1: Dados de Cada Passageiro (Nome, CPF/Passaporte, Nascimento) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <UserCheck className="w-5 h-5 text-[#BD9472]" />
                      <div>
                        <h2 className="text-lg font-extrabold text-[#172C3B]">
                          1. Dados dos Passageiros para Emissão do Bilhete
                        </h2>
                        <p className="text-xs text-gray-500">
                          Preencha exatamente como consta no documento oficial de embarque (RG, CPF ou Passaporte).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {passengersDetails.map((pax, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#172C3B] text-[#BD9472] font-mono text-xs font-bold">
                              Passageiro #{idx + 1} • {pax.typeLabel}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Obrigatório ANAC
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-6">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                Nome Completo (Igual ao Documento)
                              </label>
                              <input
                                type="text"
                                required
                                value={pax.fullName}
                                onChange={(e) =>
                                  updatePassengerField(idx, "fullName", e.target.value)
                                }
                                placeholder="Nome e Sobrenome completo"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                CPF ou Passaporte
                              </label>
                              <input
                                type="text"
                                required
                                value={pax.documentCpfOrPassport}
                                onChange={(e) =>
                                  updatePassengerField(
                                    idx,
                                    "documentCpfOrPassport",
                                    e.target.value
                                  )
                                }
                                placeholder="000.000.000-00"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 font-mono text-xs text-[#09090B]"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                Data de Nasc.
                              </label>
                              <input
                                type="date"
                                required
                                value={pax.birthDate}
                                onChange={(e) =>
                                  updatePassengerField(idx, "birthDate", e.target.value)
                                }
                                className="w-full rounded-xl bg-white border border-gray-300 px-2.5 py-2 font-mono text-xs text-[#09090B]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seção 2: Dados do Pagador e Envio do E-Ticket */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <h2 className="text-lg font-extrabold text-[#172C3B]">
                      2. Contato para Recebimento do Bilhete & Pagador
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172C3B] mb-1">
                          Nome do Responsável Financeiro
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172C3B] mb-1">
                          CPF do Pagador
                        </label>
                        <input
                          type="text"
                          required
                          value={payerCpf}
                          onChange={(e) => setPayerCpf(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172C3B] mb-1">
                          E-mail (Vinculado ao Seu Dashboard)
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
                  </div>

                  {/* Seção 3: Forma de Pagamento */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[#172C3B] mb-2">
                      3. Forma de Pagamento
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
                          Emissão prioritária do Localizador PNR
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
                          Parcelamento conforme tarifa
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#BD9472] text-[#0E1B24] font-extrabold text-sm hover:bg-[#D4AF8E] transition shadow-md"
                  >
                    Confirmar Dados dos Passageiros e Emitir Localizador
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-7 border border-[#BD9472]/40 space-y-4 h-fit">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#BD9472]">
                  <Plane className="w-4 h-4" />
                  <span>Resumo da Passagem Selecionada</span>
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
                <div className="text-xs text-[#BD9472] font-semibold">
                  Passageiros no bilhete: {passengersDetails.length} viajante(s)
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
                      <option>10:00 — Consultoria Passagens para Shows & Festivais</option>
                      <option>14:30 — Emissão Internacional & Executiva</option>
                      <option>16:00 — Passagens para Grupos & Equipes</option>
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

      {showVoucherModal && confirmedOrder && (
        <TicketVoucherModal
          order={confirmedOrder}
          onClose={() => setShowVoucherModal(false)}
        />
      )}
    </div>
  );
}
