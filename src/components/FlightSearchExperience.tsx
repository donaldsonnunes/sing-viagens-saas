"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AIRPORTS } from "@/data/airports";
import { FlightOfferResult } from "@/lib/flightEngine";
import {
  Plane,
  Users,
  ArrowRightLeft,
  Search,
  Sparkles,
  TrendingDown,
  Plus,
  Minus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
} from "lucide-react";

interface FlightSearchExperienceProps {
  initialOrigin?: string;
  initialDestination?: string;
  compactHeroMode?: boolean;
}

export function FlightSearchExperience({
  initialOrigin = "GRU",
  initialDestination = "GIG",
  compactHeroMode = false,
}: FlightSearchExperienceProps) {
  const router = useRouter();
  const [tripType, setTripType] = useState<"ROUND_TRIP" | "ONE_WAY">("ROUND_TRIP");

  const [originIata, setOriginIata] = useState(initialOrigin);
  const [destinationIata, setDestinationIata] = useState(initialDestination);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [departureDate, setDepartureDate] = useState("2026-12-10");
  const [returnDate, setReturnDate] = useState("2026-12-15");

  const [adults, setAdults] = useState(2);
  const [childrenAges, setChildrenAges] = useState<number[]>([8]);
  const [cabinClass, setCabinClass] = useState<"ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS">(
    "ECONOMY"
  );
  const [showPassengerPopover, setShowPassengerPopover] = useState(false);

  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<FlightOfferResult[]>([]);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  const selectedOriginAirport = useMemo(
    () => AIRPORTS.find((a) => a.iata === originIata) || AIRPORTS[0],
    [originIata]
  );
  const selectedDestinationAirport = useMemo(
    () => AIRPORTS.find((a) => a.iata === destinationIata) || AIRPORTS[3],
    [destinationIata]
  );

  const filteredOriginAirports = useMemo(() => {
    const q = originQuery.trim().toLowerCase();
    if (!q) return AIRPORTS;
    return AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    );
  }, [originQuery]);

  const filteredDestinationAirports = useMemo(() => {
    const q = destinationQuery.trim().toLowerCase();
    if (!q) return AIRPORTS;
    return AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    );
  }, [destinationQuery]);

  const executeFlightSearch = async (saveHistory = true) => {
    setLoading(true);
    try {
      const savedUser =
        typeof window !== "undefined" ? localStorage.getItem("sing_user") : null;
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;

      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originIata,
          destination: destinationIata,
          departureDate,
          returnDate: tripType === "ROUND_TRIP" ? returnDate : undefined,
          tripType,
          adults,
          childrenAges,
          cabinClass,
          saveToHistory: saveHistory,
          userId: parsedUser?.id,
          userEmail: parsedUser?.email,
        }),
      });
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch (e) {
      console.error("Failed flight search:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeFlightSearch(false);
  }, []);

  const handleSwapAirports = () => {
    const temp = originIata;
    setOriginIata(destinationIata);
    setDestinationIata(temp);
  };

  const handleAddChild = () => {
    if (childrenAges.length < 6) {
      setChildrenAges([...childrenAges, 6]);
    }
  };

  const handleRemoveChild = () => {
    if (childrenAges.length > 0) {
      setChildrenAges(childrenAges.slice(0, -1));
    }
  };

  const handleChildAgeChange = (index: number, newAge: number) => {
    const updated = [...childrenAges];
    updated[index] = Math.max(0, Math.min(17, newAge));
    setChildrenAges(updated);
  };

  const handleSelectOfferForCheckout = (offer: FlightOfferResult) => {
    const checkoutPayload = {
      offer,
      searchParams: {
        origin: originIata,
        destination: destinationIata,
        departureDate,
        returnDate: tripType === "ROUND_TRIP" ? returnDate : undefined,
        tripType,
        adults,
        childrenAges,
        cabinClass,
      },
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("sing_selected_checkout", JSON.stringify(checkoutPayload));
    }
    router.push("/checkout");
  };

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatPassengersLabel = (adultsCount: number, minorsCount: number) => {
    const adultLabel = `${adultsCount} ${adultsCount === 1 ? "Adulto" : "Adultos"}`;
    if (minorsCount === 0) return adultLabel;
    const minorLabel = `${minorsCount} ${minorsCount === 1 ? "Criança" : "Crianças"}`;
    return `${adultLabel}, ${minorLabel}`;
  };

  const recommendedOfferId = useMemo(() => {
    if (offers.length === 0) return null;
    const sorted = [...offers].sort(
      (a, b) => b.bestSavingsVsOperatingAirline - a.bestSavingsVsOperatingAirline
    );
    return sorted[0]?.id;
  }, [offers]);

  return (
    <div className="space-y-8">
      {/* BUSCADOR EXCLUSIVO DE PASSAGENS AÉREAS */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(9,9,11,0.07)] p-5 sm:p-7 text-[#09090B]">
        {/* Topo de Controles: Ida e Volta / Somente Ida + Classe */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-2 text-sm font-bold text-[#09090B]">
            <div className="w-8 h-8 rounded-lg bg-[#09090B] text-[#BD9472] flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <span>Pesquisar Passagens Aéreas</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="inline-flex rounded-xl bg-zinc-100 p-1 border border-zinc-200/60">
              <button
                type="button"
                onClick={() => setTripType("ROUND_TRIP")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  tripType === "ROUND_TRIP"
                    ? "bg-white text-[#09090B] shadow-sm"
                    : "text-zinc-500 hover:text-[#09090B]"
                }`}
              >
                Ida e Volta
              </button>
              <button
                type="button"
                onClick={() => setTripType("ONE_WAY")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  tripType === "ONE_WAY"
                    ? "bg-white text-[#09090B] shadow-sm"
                    : "text-zinc-500 hover:text-[#09090B]"
                }`}
              >
                Somente Ida
              </button>
            </div>

            <select
              value={cabinClass}
              onChange={(e) =>
                setCabinClass(e.target.value as "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS")
              }
              aria-label="Classe da Cabine"
              className="bg-zinc-100 border border-zinc-200/60 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#09090B] focus:outline-none focus:border-[#BD9472]"
            >
              <option value="ECONOMY">Classe Econômica</option>
              <option value="PREMIUM_ECONOMY">Econômica Premium</option>
              <option value="BUSINESS">Classe Executiva</option>
            </select>
          </div>
        </div>

        {/* Campos Principais */}
        <div className="pt-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* Origem */}
            <div className="lg:col-span-3 relative">
              <div
                onClick={() => {
                  setShowOriginDropdown(true);
                  setShowDestinationDropdown(false);
                }}
                className="cursor-pointer rounded-2xl bg-[#FAFAFA] border border-zinc-200 hover:border-[#BD9472] px-4 py-3 transition-all"
              >
                <div className="text-[11px] font-medium text-zinc-400">
                  De onde você vai sair?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-display text-sm sm:text-base font-bold text-[#09090B] truncate">
                    {selectedOriginAirport.city}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#172C3B] text-[#E8E2D9]">
                    {selectedOriginAirport.iata}
                  </span>
                </div>
              </div>

              {showOriginDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 max-h-72 overflow-y-auto animate-fade-up">
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => setOriginQuery(e.target.value)}
                    placeholder="Digite a cidade ou aeroporto..."
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#09090B] mb-2 focus:outline-none focus:border-[#BD9472]"
                  />
                  <div className="space-y-1">
                    {filteredOriginAirports.map((airport) => (
                      <button
                        key={airport.iata}
                        type="button"
                        onClick={() => {
                          setOriginIata(airport.iata);
                          setShowOriginDropdown(false);
                          setOriginQuery("");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 transition flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#09090B]">
                            {airport.city} — {airport.country}
                          </div>
                          <div className="text-[11px] text-zinc-500">{airport.name}</div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#09090B] text-white">
                          {airport.iata}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inverter */}
            <div className="lg:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwapAirports}
                title="Inverter Origem e Destino"
                className="p-2.5 rounded-xl bg-[#FAFAFA] border border-zinc-200 text-zinc-700 hover:border-[#BD9472] hover:bg-[#BD9472]/10 transition"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destino */}
            <div className="lg:col-span-3 relative">
              <div
                onClick={() => {
                  setShowDestinationDropdown(true);
                  setShowOriginDropdown(false);
                }}
                className="cursor-pointer rounded-2xl bg-[#FAFAFA] border border-zinc-200 hover:border-[#BD9472] px-4 py-3 transition-all"
              >
                <div className="text-[11px] font-medium text-zinc-400">
                  Para onde você vai?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-display text-sm sm:text-base font-bold text-[#09090B] truncate">
                    {selectedDestinationAirport.city}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#172C3B] text-[#E8E2D9]">
                    {selectedDestinationAirport.iata}
                  </span>
                </div>
              </div>

              {showDestinationDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 max-h-72 overflow-y-auto animate-fade-up">
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="Digite a cidade do show ou destino..."
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#09090B] mb-2 focus:outline-none focus:border-[#BD9472]"
                  />
                  <div className="space-y-1">
                    {filteredDestinationAirports.map((airport) => (
                      <button
                        key={airport.iata}
                        type="button"
                        onClick={() => {
                          setDestinationIata(airport.iata);
                          setShowDestinationDropdown(false);
                          setDestinationQuery("");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 transition flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#09090B]">
                            {airport.city} — {airport.country}
                          </div>
                          <div className="text-[11px] text-zinc-500">{airport.name}</div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#09090B] text-white">
                          {airport.iata}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Datas */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-[#FAFAFA] border border-zinc-200 px-3.5 py-3">
                <div className="text-[11px] font-medium text-zinc-400">
                  Data de Ida
                </div>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#09090B] mt-1 focus:outline-none"
                />
              </div>
              <div
                className={`rounded-2xl bg-[#FAFAFA] border border-zinc-200 px-3.5 py-3 ${
                  tripType === "ONE_WAY" ? "opacity-40" : ""
                }`}
              >
                <div className="text-[11px] font-medium text-zinc-400">
                  Data de Volta
                </div>
                <input
                  type="date"
                  disabled={tripType === "ONE_WAY"}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs font-bold text-[#09090B] mt-1 focus:outline-none"
                />
              </div>
            </div>

            {/* Viajantes */}
            <div className="lg:col-span-2 relative">
              <button
                type="button"
                onClick={() => setShowPassengerPopover(!showPassengerPopover)}
                className="w-full text-left rounded-2xl bg-[#FAFAFA] border border-zinc-200 hover:border-[#BD9472] px-4 py-3 transition"
              >
                <div className="text-[11px] font-medium text-zinc-400">
                  Viajantes
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-[#09090B] truncate">
                    {formatPassengersLabel(adults, childrenAges.length)}
                  </span>
                  <Users className="w-4 h-4 text-[#BD9472] shrink-0" />
                </div>
              </button>

              {showPassengerPopover && (
                <div className="absolute right-0 top-full mt-2 w-80 z-40 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-4 animate-fade-up">
                  <div className="text-xs font-bold text-[#09090B] border-b border-zinc-100 pb-2">
                    Quantidade de Viajantes
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#09090B]">Adultos</div>
                      <div className="text-[11px] text-zinc-500">12 anos ou mais</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono w-6 text-center text-xs font-bold">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(9, adults + 1))}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#09090B]">
                        Crianças
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        0 a 11 anos (informe a idade)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRemoveChild}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono w-6 text-center text-xs font-bold">
                        {childrenAges.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddChild}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {childrenAges.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <div className="text-[11px] font-semibold text-zinc-500">
                        Idade de cada criança na data do voo:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {childrenAges.map((age, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-50 p-2 rounded-xl border border-zinc-200"
                          >
                            <label className="block text-[10px] font-bold text-[#172C3B] mb-1">
                              Criança #{idx + 1}
                            </label>
                            <select
                              value={age}
                              onChange={(e) =>
                                handleChildAgeChange(idx, Number(e.target.value))
                              }
                              className="w-full bg-white text-[#09090B] text-xs rounded-lg px-2 py-1 border border-zinc-200"
                            >
                              <option value={0}>0 ano (Bebê de colo)</option>
                              <option value={1}>1 ano (Bebê de colo)</option>
                              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((yr) => (
                                <option key={yr} value={yr}>
                                  {yr} anos
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassengerPopover(false)}
                    className="w-full py-2.5 rounded-xl bg-[#09090B] text-white font-semibold text-xs"
                  >
                    Confirmar Viajantes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Ação Inferior */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-[#BD9472]" />
              <span>
                Eventos e arenas em{" "}
                <strong className="text-[#09090B]">
                  {selectedDestinationAirport.city}
                </strong>
                : {selectedDestinationAirport.popularEventHub}
              </span>
            </div>

            <button
              type="button"
              onClick={() => executeFlightSearch(true)}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#09090B] text-white font-semibold text-xs sm:text-sm hover:bg-[#172C3B] transition-all shadow-sm hover:shadow-md"
            >
              <Search className="w-4 h-4 text-[#BD9472]" />
              <span>
                {loading
                  ? "Buscando os melhores voos..."
                  : "Buscar Passagens e Comparar Cias"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE VOOS & COMPARATIVO LADO A LADO */}
      {offers.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#172C3B] text-[#E8E2D9]">
                {offers.length} VOOS DISPONÍVEIS
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#09090B]">
                Valor Sing Turismo vs. Preço Direto nas Companhias Aéreas
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {offers.map((offer) => {
              const isExpanded = expandedOfferId === offer.id;
              const isRecommended = offer.id === recommendedOfferId;

              return (
                <div
                  key={offer.id}
                  className={`rounded-2xl bg-white transition-all duration-300 overflow-hidden ${
                    isRecommended
                      ? "border-2 border-[#BD9472] shadow-[0_12px_36px_rgba(189,148,114,0.16)]"
                      : "border border-zinc-200/80 shadow-sm hover:border-zinc-300 hover:shadow-md"
                  }`}
                >
                  {isRecommended && (
                    <div className="bg-gradient-to-r from-[#09090B] via-[#172C3B] to-[#09090B] text-white px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#BD9472]" />
                        <span>
                          VOO MAIS RECOMENDADO — Melhor economia para o seu destino
                        </span>
                      </div>
                      <span className="text-[11px] text-[#BD9472] font-medium">
                        {offer.eventRecommendationBadge || "Melhor Custo-Benefício"}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Coluna Esquerda (7 cols): Voo + Preço de Venda Sing */}
                    <div className="lg:col-span-7 p-6 flex flex-col justify-between gap-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-display text-xs font-bold px-3 py-1 rounded-lg bg-zinc-100 text-[#09090B]">
                            {offer.operatingAirlineName}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">
                            Voo {offer.flightNumber} • {offer.stopsDescription}
                          </span>
                        </div>
                        {offer.bestSavingsVsOperatingAirline > 0 && (
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Economize {formatBRL(offer.bestSavingsVsOperatingAirline)}
                          </span>
                        )}
                      </div>

                      {/* Horários e Visualização Rápida de Conexão */}
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#09090B] tracking-tight">
                              {offer.departureTime}
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 mt-0.5">
                              {offer.originAirport.city} ({offer.originAirport.iata})
                            </div>
                          </div>

                          <div className="flex-1 max-w-[240px] flex flex-col items-center">
                            <span className="font-mono text-[11px] font-semibold text-zinc-500">
                              Duração total: {offer.duration}
                            </span>

                            {/* Linha do Voo com Indicador Visual de Parada */}
                            <div className="w-full h-[2px] bg-zinc-200 my-2.5 relative flex items-center justify-center">
                              {offer.stops === 0 ? (
                                <Plane className="w-3.5 h-3.5 text-emerald-600 bg-white px-0.5" />
                              ) : (
                                <div className="flex items-center gap-1.5 bg-white px-2">
                                  {offer.connections?.map((conn, cIdx) => (
                                    <span
                                      key={cIdx}
                                      title={`Conexão em ${conn.city} (${conn.airportCode}) — Tempo de espera: ${conn.layoverDuration}`}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#172C3B] text-[#E8E2D9] font-mono text-[10px] font-bold shadow-xs"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#BD9472]" />
                                      {conn.airportCode}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {offer.stops === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-semibold">
                                Voo Direto • Sem paradas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#BD9472]/15 text-[#172C3B] border border-[#BD9472]/40 text-[11px] font-bold">
                                <Clock className="w-3 h-3 text-[#BD9472]" />
                                {offer.stops === 1
                                  ? `1 Conexão em ${offer.connections?.[0]?.city}`
                                  : `${offer.stops} Conexões`}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#09090B] tracking-tight">
                              {offer.arrivalTime}
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 mt-0.5">
                              {offer.destinationAirport.city} ({offer.destinationAirport.iata})
                            </div>
                          </div>
                        </div>

                        {/* Card de Destaque da Conexão (Visível Imediatamente quando há parada) */}
                        {offer.stops > 0 && offer.connections && offer.connections.length > 0 && (
                          <div className="rounded-xl bg-[#FAF8F5] border border-[#BD9472]/35 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                            {offer.connections.map((conn, cIdx) => (
                              <div
                                key={cIdx}
                                className="w-full flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 text-[#172C3B]">
                                  <MapPin className="w-3.5 h-3.5 text-[#BD9472] shrink-0" />
                                  <span>
                                    Parada em{" "}
                                    <strong className="font-bold">
                                      {conn.city} ({conn.airportCode})
                                    </strong>{" "}
                                    <span className="text-zinc-500 hidden sm:inline">
                                      • Chega às {conn.arrivalAtConnection} e sai às{" "}
                                      {conn.departureFromConnection}
                                    </span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#172C3B] text-[#E8E2D9] font-mono text-[11px] font-bold">
                                    <Clock className="w-3 h-3 text-[#BD9472]" />
                                    Tempo de conexão: {conn.layoverDuration}
                                  </span>
                                  <span className="text-[11px] font-medium text-zinc-500">
                                    {conn.changeAircraft
                                      ? "Com troca de avião"
                                      : "Mesma aeronave"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Rodapé da Coluna Sing */}
                      <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-medium text-zinc-500">
                            Valor Total na Sing ({formatPassengersLabel(adults, childrenAges.length)})
                          </div>
                          <div className="flex items-baseline gap-3 mt-0.5">
                            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#09090B]">
                              {formatBRL(offer.pricingBreakdown.singFinalSalePriceTotal)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOfferId(isExpanded ? null : offer.id)
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#BD9472] hover:underline"
                            >
                              <span>Detalhes da tarifa</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectOfferForCheckout(offer)}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                            isRecommended
                              ? "bg-[#BD9472] text-[#09090B] hover:bg-[#D4AF8E] shadow-sm"
                              : "bg-[#09090B] text-white hover:bg-[#172C3B]"
                          }`}
                        >
                          <span>Comprar Passagem</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Detalhes da Tarifa Simplificados para o Cliente */}
                      {isExpanded && (
                        <div className="rounded-xl bg-[#FAFAFA] p-4 border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-up">
                          <div>
                            <div className="text-zinc-400">Tarifa Aérea Sing</div>
                            <div className="font-mono font-bold text-[#09090B] mt-0.5">
                              {formatBRL(
                                offer.pricingBreakdown.singFinalSalePriceTotal -
                                  offer.pricingBreakdown.boardingTaxesTotal
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-400">Taxas de Embarque</div>
                            <div className="font-mono font-bold text-[#09090B] mt-0.5">
                              {formatBRL(offer.pricingBreakdown.boardingTaxesTotal)}
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-400">Sua Economia Direta</div>
                            <div className="font-mono font-bold text-emerald-700 mt-0.5">
                              {formatBRL(offer.bestSavingsVsOperatingAirline)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coluna Direita (5 cols): Comparativo Lado a Lado nas Principais Cias Aéreas */}
                    <div className="lg:col-span-5 bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-zinc-200/70 p-6 flex flex-col justify-center">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5 text-[#BD9472]" />
                          Preço nas Companhias Aéreas
                        </span>
                        <span>Mesmo Voo</span>
                      </div>

                      <div className="space-y-2">
                        {offer.airlineDirectComparison.slice(0, 3).map((comp, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xl px-3.5 py-2.5 border flex items-center justify-between text-xs ${
                              comp.isSameOperatedFlight
                                ? "bg-white border-zinc-300 shadow-2xs"
                                : "bg-white/60 border-zinc-200/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#09090B]">
                                {comp.airlineCode}
                              </span>
                              <span className="font-mono text-[11px] text-zinc-400">
                                {comp.flightNumber}
                              </span>
                              {comp.isSameOperatedFlight && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                                  Mesmo Voo
                                </span>
                              )}
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <span className="font-mono font-semibold text-zinc-400 line-through">
                                {formatBRL(comp.directWebsitePriceTotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
