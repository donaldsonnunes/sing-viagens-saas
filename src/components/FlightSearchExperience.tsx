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
  Briefcase,
  Luggage,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface FlightSearchExperienceProps {
  initialOrigin?: string;
  initialDestination?: string;
  compactHeroMode?: boolean;
}

export function FlightSearchExperience({
  initialOrigin = "",
  initialDestination = "",
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

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [cabinClass, setCabinClass] = useState<"ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS">(
    "ECONOMY"
  );
  const [showPassengerPopover, setShowPassengerPopover] = useState(false);

  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [offers, setOffers] = useState<FlightOfferResult[]>([]);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [selectedOutboundOffer, setSelectedOutboundOffer] =
    useState<FlightOfferResult | null>(null);
  const [selectedReturnOffer, setSelectedReturnOffer] =
    useState<FlightOfferResult | null>(null);
  const [extraCheckedBags, setExtraCheckedBags] = useState(0);
  const [specialBags, setSpecialBags] = useState(0);
  const [searchStrategy, setSearchStrategy] = useState<
    "SMART_ECONOMY" | "CASH_FIRST" | "ALL_ELIGIBLE"
  >("SMART_ECONOMY");
  const [telemetry, setTelemetry] = useState<any>(null);
  const [preSearchCalendar, setPreSearchCalendar] = useState<any[]>([]);

  const selectedOriginAirport = useMemo(
    () => (originIata ? AIRPORTS.find((a) => a.iata === originIata) || null : null),
    [originIata]
  );
  const selectedDestinationAirport = useMemo(
    () =>
      destinationIata
        ? AIRPORTS.find((a) => a.iata === destinationIata) || null
        : null,
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

  const executeFlightSearch = async (
    saveHistory = true,
    overrideDepartureDate?: string,
    overrideStrategy?: "SMART_ECONOMY" | "CASH_FIRST" | "ALL_ELIGIBLE"
  ) => {
    const targetDepDate = overrideDepartureDate || departureDate;
    if (!originIata || !destinationIata || !targetDepDate) {
      setSearchError("Selecione a origem, o destino e a data de ida para pesquisar.");
      return;
    }
    if (tripType === "ROUND_TRIP" && !returnDate) {
      setSearchError("Informe a data de volta para voos de Ida e Volta.");
      return;
    }
    setSearchError("");
    setLoading(true);
    setSelectedOutboundOffer(null);
    setSelectedReturnOffer(null);
    setExtraCheckedBags(0);
    setSpecialBags(0);
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
          departureDate: overrideDepartureDate || departureDate,
          returnDate: tripType === "ROUND_TRIP" ? returnDate : undefined,
          tripType,
          adults,
          childrenAges,
          cabinClass,
          strategy: overrideStrategy || searchStrategy,
          saveToHistory: saveHistory,
          userId: parsedUser?.id,
          userEmail: parsedUser?.email,
        }),
      });
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
      }
      if (data.telemetry) {
        setTelemetry(data.telemetry);
      }
      if (Array.isArray(data.preSearchCalendar)) {
        setPreSearchCalendar(data.preSearchCalendar);
      }
    } catch (e) {
      console.error("Failed flight search:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrigin && initialDestination && departureDate) {
      executeFlightSearch(false);
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const savedSearch = sessionStorage.getItem("sing_active_search");
        if (savedSearch) {
          const parsed = JSON.parse(savedSearch);
          if (Array.isArray(parsed.offers) && parsed.offers.length > 0) {
            if (parsed.tripType) setTripType(parsed.tripType);
            if (parsed.originIata) setOriginIata(parsed.originIata);
            if (parsed.destinationIata) setDestinationIata(parsed.destinationIata);
            if (parsed.departureDate) setDepartureDate(parsed.departureDate);
            if (parsed.returnDate) setReturnDate(parsed.returnDate);
            if (parsed.adults) setAdults(parsed.adults);
            if (Array.isArray(parsed.childrenAges)) setChildrenAges(parsed.childrenAges);
            if (parsed.cabinClass) setCabinClass(parsed.cabinClass);
            setOffers(parsed.offers);
            if (parsed.telemetry) setTelemetry(parsed.telemetry);
            if (Array.isArray(parsed.preSearchCalendar)) {
              setPreSearchCalendar(parsed.preSearchCalendar);
            }
            if (parsed.selectedOutboundOffer) {
              setSelectedOutboundOffer(parsed.selectedOutboundOffer);
            }
            if (parsed.selectedReturnOffer) {
              setSelectedReturnOffer(parsed.selectedReturnOffer);
            }
            if (typeof parsed.extraCheckedBags === "number") {
              setExtraCheckedBags(parsed.extraCheckedBags);
            }
            if (typeof parsed.specialBags === "number") {
              setSpecialBags(parsed.specialBags);
            }
          }
        }
      } catch {
        // ignore invalid session cache
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || offers.length === 0) return;
    try {
      sessionStorage.setItem(
        "sing_active_search",
        JSON.stringify({
          tripType,
          originIata,
          destinationIata,
          departureDate,
          returnDate,
          adults,
          childrenAges,
          cabinClass,
          offers,
          telemetry,
          preSearchCalendar,
          selectedOutboundOffer,
          selectedReturnOffer,
          extraCheckedBags,
          specialBags,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [
    tripType,
    originIata,
    destinationIata,
    departureDate,
    returnDate,
    adults,
    childrenAges,
    cabinClass,
    offers,
    telemetry,
    preSearchCalendar,
    selectedOutboundOffer,
    selectedReturnOffer,
    extraCheckedBags,
    specialBags,
  ]);

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

  const resolveBaggagePolicy = (offer: FlightOfferResult) => {
    if (offer.baggagePolicy) return offer.baggagePolicy;
    const text = (offer.baggageIncluded || "").toLowerCase();
    const has2Checked = text.includes("2 bagagens despachadas");
    const has1Checked =
      !has2Checked &&
      text.includes("despachada") &&
      !text.includes("sem mala despachada") &&
      !text.includes("não");
    const isIntl =
      offer.originAirport?.isInternational ||
      offer.destinationAirport?.isInternational;

    return {
      personalItemIncluded: true,
      carryOnIncluded: !text.includes("sem bagagem de mão"),
      checkedBagsIncluded: has2Checked ? 2 : has1Checked ? 1 : 0,
      allowsExtraCheckedBaggage: true,
      extraCheckedBagPricePerWay: isIntl ? 290 : 129,
      allowsSpecialBaggage: true,
      specialBaggagePricePerWay: isIntl ? 450 : 210,
    };
  };

  const handleSelectFlightLeg = (offer: FlightOfferResult) => {
    if (tripType === "ONE_WAY") {
      setSelectedOutboundOffer(offer);
      setSelectedReturnOffer(null);
      return;
    }

    // Ida e Volta: Passo 1 seleciona Ida (não pede passageiros antes de fechar todos os trechos)
    if (!selectedOutboundOffer) {
      setSelectedOutboundOffer(offer);
      return;
    }

    // Passo 2 seleciona Volta e exibe ambos os voos na lateral direita
    setSelectedReturnOffer(offer);
  };

  const handleProceedToCheckout = () => {
    if (!selectedOutboundOffer) return;
    if (tripType === "ROUND_TRIP" && !selectedReturnOffer) return;

    const outboundPolicy = resolveBaggagePolicy(selectedOutboundOffer);
    const legsCount = tripType === "ROUND_TRIP" ? 2 : 1;
    const extraCheckedTotal =
      extraCheckedBags * outboundPolicy.extraCheckedBagPricePerWay * legsCount;
    const specialBagTotal =
      specialBags * outboundPolicy.specialBaggagePricePerWay * legsCount;
    const baggageExtraTotal = extraCheckedTotal + specialBagTotal;

    const baseFlightPrice = selectedOutboundOffer.pricingBreakdown.singFinalSalePriceTotal;
    const baseAirlineRef =
      selectedOutboundOffer.airlineDirectComparison?.[0]?.directWebsitePriceTotal ||
      selectedOutboundOffer.pricingBreakdown.airlineDirectCashPriceTotal;

    const checkoutPayload = {
      offer: {
        ...selectedOutboundOffer,
        returnFlightNumber:
          selectedReturnOffer?.returnFlightNumber ||
          selectedReturnOffer?.flightNumber ||
          selectedOutboundOffer.returnFlightNumber,
        pricingBreakdown: {
          ...selectedOutboundOffer.pricingBreakdown,
          singFinalSalePriceTotal: baseFlightPrice + baggageExtraTotal,
          airlineDirectCashPriceTotal:
            (selectedOutboundOffer.pricingBreakdown.airlineDirectCashPriceTotal ||
              baseAirlineRef) + baggageExtraTotal,
        },
        airlineDirectComparison: Array.isArray(
          selectedOutboundOffer.airlineDirectComparison
        )
          ? selectedOutboundOffer.airlineDirectComparison.map((comp: any, idx: number) =>
              idx === 0
                ? {
                    ...comp,
                    directWebsitePriceTotal:
                      Number(comp.directWebsitePriceTotal || baseAirlineRef) +
                      baggageExtraTotal,
                  }
                : comp
            )
          : selectedOutboundOffer.airlineDirectComparison,
      },
      outboundOffer: selectedOutboundOffer,
      returnOffer: selectedReturnOffer,
      baggageExtras: {
        extraCheckedBags,
        specialBags,
        legsCount,
        baggageExtraTotal,
      },
      baseFlightPrice,
      baseAirlineRef,
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
      const savedUser = localStorage.getItem("sing_user");
      let hasLoggedUser = false;
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          hasLoggedUser = Boolean(parsedUser?.email);
        } catch {
          hasLoggedUser = false;
        }
      }
      if (!hasLoggedUser) {
        router.push("/conta?redirect=/checkout&mode=register");
        return;
      }
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
      <div className="rounded-[26px] macos-glass-light p-5 sm:p-7 text-[#1D1D1F]">
        {/* Topo de Controles: Ida e Volta / Somente Ida + Classe */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5 text-sm font-bold text-[#1D1D1F]">
            <div className="w-8 h-8 rounded-xl bg-[#172C3B] text-[#BD9472] flex items-center justify-center shadow-xs">
              <Plane className="w-4 h-4" />
            </div>
            <span>Pesquisar Passagens Aéreas</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="inline-flex rounded-xl bg-black/[0.05] p-1 border border-black/[0.04]">
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_auto_1.1fr_2fr_0.9fr] gap-2.5 items-center">
            {/* Origem */}
            <div className="relative min-w-0">
              <div
                onClick={() => {
                  setShowOriginDropdown(true);
                  setShowDestinationDropdown(false);
                }}
                className="cursor-pointer rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.06] hover:border-[#BD9472]/70 hover:bg-white px-4 py-3 transition-all duration-200"
              >
                <div className="text-[11px] font-medium text-zinc-400">
                  De onde você vai sair?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`font-display text-sm sm:text-base font-bold truncate ${
                      selectedOriginAirport ? "text-[#09090B]" : "text-zinc-400 font-medium"
                    }`}
                  >
                    {selectedOriginAirport
                      ? selectedOriginAirport.city
                      : "Selecione a origem"}
                  </span>
                  {selectedOriginAirport && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#172C3B] text-[#E8E2D9]">
                      {selectedOriginAirport.iata}
                    </span>
                  )}
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
            <div className="flex justify-center">
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
            <div className="relative min-w-0">
              <div
                onClick={() => {
                  setShowDestinationDropdown(true);
                  setShowOriginDropdown(false);
                }}
                className="cursor-pointer rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.06] hover:border-[#BD9472]/70 hover:bg-white px-4 py-3 transition-all duration-200"
              >
                <div className="text-[11px] font-medium text-zinc-400">
                  Para onde você vai?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`font-display text-sm sm:text-base font-bold truncate ${
                      selectedDestinationAirport
                        ? "text-[#09090B]"
                        : "text-zinc-400 font-medium"
                    }`}
                  >
                    {selectedDestinationAirport
                      ? selectedDestinationAirport.city
                      : "Selecione o destino"}
                  </span>
                  {selectedDestinationAirport && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#172C3B] text-[#E8E2D9]">
                      {selectedDestinationAirport.iata}
                    </span>
                  )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
              <div className="rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.06] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#BD9472]/15 px-3 py-3 transition-all min-w-0">
                <div className="text-[11px] font-medium text-zinc-400">
                  Data de Ida
                </div>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full min-w-0 bg-transparent font-mono text-[11px] sm:text-xs font-bold text-[#09090B] mt-1 focus:outline-none"
                />
              </div>
              <div
                className={`rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.06] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#BD9472]/15 px-3 py-3 transition-all min-w-0 ${
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
                  className="w-full min-w-0 bg-transparent font-mono text-[11px] sm:text-xs font-bold text-[#09090B] mt-1 focus:outline-none"
                />
              </div>
            </div>

            {/* Viajantes */}
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setShowPassengerPopover(!showPassengerPopover)}
                className="w-full text-left rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.06] hover:border-[#BD9472]/70 hover:bg-white px-4 py-3 transition"
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
                {selectedDestinationAirport ? (
                  <>
                    Eventos e arenas em{" "}
                    <strong className="text-[#09090B]">
                      {selectedDestinationAirport.city}
                    </strong>
                    : {selectedDestinationAirport.popularEventHub}
                  </>
                ) : (
                  "Escolha origem e destino para comparar passagens em tempo real."
                )}
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
          {searchError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {searchError}
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE VOOS & RESUMO LATERAL (IDA E VOLTA + BAGAGENS) */}
      {offers.length > 0 && (
        <div className="space-y-4">
          {/* Barra de Etapa na Seleção Ida e Volta */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#172C3B] text-[#E8E2D9]">
                {offers.length} VOOS DISPONÍVEIS
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#09090B]">
                {tripType === "ROUND_TRIP"
                  ? !selectedOutboundOffer
                    ? `1º Passo: Escolha o voo de Ida (${originIata} → ${destinationIata})`
                    : !selectedReturnOffer
                    ? `2º Passo: Escolha o voo de Volta (${destinationIata} → ${originIata})`
                    : "Ida e Volta Selecionadas — Revise na Lateral e Inclua Bagagens se Desejar"
                  : "Valor Sing Turismo vs. Preço Direto nas Companhias Aéreas"}
              </h3>
            </div>
            {selectedOutboundOffer && (
              <button
                type="button"
                onClick={() => {
                  setSelectedOutboundOffer(null);
                  setSelectedReturnOffer(null);
                  setExtraCheckedBags(0);
                  setSpecialBags(0);
                }}
                className="text-xs font-bold text-[#172C3B] hover:text-[#BD9472] underline"
              >
                Alterar voo de Ida
              </button>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-6 ${
              selectedOutboundOffer ? "lg:grid-cols-12 items-start" : ""
            }`}
          >
            {/* Coluna Principal de Cards de Voos */}
            <div
              className={`space-y-4 ${
                selectedOutboundOffer ? "lg:col-span-8" : "w-full"
              }`}
            >
              {offers.map((offer) => {
                const isExpanded = expandedOfferId === offer.id;
                const isRecommended = offer.id === recommendedOfferId;
                const bagPolicy = resolveBaggagePolicy(offer);
                const isSelectingReturn =
                  tripType === "ROUND_TRIP" && Boolean(selectedOutboundOffer);
                const isSelectedOutbound = selectedOutboundOffer?.id === offer.id;
                const isSelectedReturn = selectedReturnOffer?.id === offer.id;

                const displayedFromCity = isSelectingReturn
                  ? offer.destinationAirport.city
                  : offer.originAirport.city;
                const displayedFromIata = isSelectingReturn
                  ? offer.destinationAirport.iata
                  : offer.originAirport.iata;
                const displayedToCity = isSelectingReturn
                  ? offer.originAirport.city
                  : offer.destinationAirport.city;
                const displayedToIata = isSelectingReturn
                  ? offer.originAirport.iata
                  : offer.destinationAirport.iata;
                const displayedFlightNo = isSelectingReturn
                  ? offer.returnFlightNumber || offer.flightNumber
                  : offer.flightNumber;

                return (
                  <div
                    key={offer.id}
                    className={`rounded-2xl bg-white transition-all duration-300 overflow-hidden ${
                      isSelectedOutbound || isSelectedReturn
                        ? "border-2 border-emerald-500 shadow-lg"
                        : isRecommended
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
                      {/* Coluna Esquerda (7 cols): Voo + Ícones de Bagagem + Preço de Venda Sing */}
                      <div className="lg:col-span-7 p-6 flex flex-col justify-between gap-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display text-xs font-bold px-3 py-1 rounded-lg bg-zinc-100 text-[#09090B]">
                              {offer.operatingAirlineName}
                            </span>
                            <span className="font-mono text-xs text-zinc-500">
                              Voo {displayedFlightNo}
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
                                {displayedFromCity} ({displayedFromIata})
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
                                  {offer.stops === 1 && offer.connections?.[0]
                                    ? `Parada de ${offer.connections[0].layoverDuration} em ${offer.connections[0].city}`
                                    : `${offer.stops} Conexões`}
                                </span>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#09090B] tracking-tight">
                                {offer.arrivalTime}
                              </div>
                              <div className="text-xs font-semibold text-zinc-500 mt-0.5">
                                {displayedToCity} ({displayedToIata})
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

                          {/* Ícones de Bagagem Inclusa / Não Inclusa na Tarifa */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {/* 1. Bolsa / Item Pessoal */}
                            <div
                              title="1 Bolsa ou mochila pessoal inclusa (abaixo do assento)"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Bolsa Pessoal</span>
                            </div>

                            {/* 2. Mala Pequena de Mão 10kg */}
                            <div
                              title={
                                bagPolicy.carryOnIncluded
                                  ? "1 Mala pequena de mão (até 10kg) inclusa"
                                  : "Mala pequena de mão não inclusa"
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                                bagPolicy.carryOnIncluded
                                  ? "bg-emerald-50 border-emerald-200/80 text-emerald-800"
                                  : "bg-red-50 border-red-200 text-red-700"
                              }`}
                            >
                              <Luggage className="w-3.5 h-3.5" />
                              <span>Mala Pequena 10kg</span>
                              {!bagPolicy.carryOnIncluded && (
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                              )}
                            </div>

                            {/* 3. Mala Despachada 23kg (Inclusa ou Ícone com X Vermelho) */}
                            {bagPolicy.checkedBagsIncluded > 0 ? (
                              <div
                                title={`${bagPolicy.checkedBagsIncluded} mala(s) despachada(s) de 23kg inclusa(s)`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#172C3B] border border-[#BD9472] text-[#E8E2D9] text-[11px] font-bold"
                              >
                                <Package className="w-3.5 h-3.5 text-[#BD9472]" />
                                <span>
                                  {bagPolicy.checkedBagsIncluded}x Mala Despachada 23kg
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                            ) : (
                              <div
                                title="Mala despachada (23kg) NÃO inclusa nesta tarifa"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold"
                              >
                                <span className="relative inline-flex items-center">
                                  <Package className="w-3.5 h-3.5 text-zinc-400" />
                                  <XCircle className="w-3 h-3 text-red-600 bg-white rounded-full -ml-1.5 -mt-1.5" />
                                </span>
                                <span>Sem Mala Despachada</span>
                              </div>
                            )}
                          </div>
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
                            onClick={() => handleSelectFlightLeg(offer)}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                              isSelectedOutbound || isSelectedReturn
                                ? "bg-emerald-600 text-white"
                                : isRecommended
                                ? "bg-[#BD9472] text-[#09090B] hover:bg-[#D4AF8E] shadow-sm"
                                : "bg-[#09090B] text-white hover:bg-[#172C3B]"
                            }`}
                          >
                            <span>
                              {tripType === "ONE_WAY"
                                ? isSelectedOutbound
                                  ? "Voo Selecionado ✓"
                                  : "Selecionar Voo"
                                : !selectedOutboundOffer
                                ? "Selecionar Ida"
                                : isSelectedReturn
                                ? "Volta Selecionada ✓"
                                : "Selecionar Volta"}
                            </span>
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

            {/* PAINEL LATERAL DIREITO: Resumo da Compra (Ida, Volta, Bagagens Extras/Especiais e Valor Final) */}
            {selectedOutboundOffer && (() => {
              const outBag = resolveBaggagePolicy(selectedOutboundOffer);
              const legsCount = tripType === "ROUND_TRIP" ? 2 : 1;
              const isAllLegsClosed =
                tripType === "ONE_WAY" || Boolean(selectedReturnOffer);
              const extraCheckedTotal =
                extraCheckedBags * outBag.extraCheckedBagPricePerWay * legsCount;
              const specialBagTotal =
                specialBags * outBag.specialBaggagePricePerWay * legsCount;
              const baseTotal =
                selectedOutboundOffer.pricingBreakdown.singFinalSalePriceTotal;
              const finalPurchaseTotal =
                baseTotal + extraCheckedTotal + specialBagTotal;

              return (
                <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-4 sm:p-5 border-2 border-[#BD9472]/60 shadow-2xl space-y-3.5 animate-fade-up">
                  <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#BD9472] font-bold">
                        Resumo dos Trechos Selecionados
                      </span>
                      <h4 className="text-sm font-extrabold text-white">
                        Sua Viagem Sing
                      </h4>
                    </div>
                    <Plane className="w-4 h-4 text-[#BD9472]" />
                  </div>

                  {/* Trecho 1: Ida */}
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-[#BD9472] uppercase">
                        1. Voo de Ida • {departureDate}
                      </span>
                      <span className="text-emerald-300 font-bold">
                        Selecionado ✓
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-white">
                      {selectedOutboundOffer.originAirport.city} (
                      {selectedOutboundOffer.originAirport.iata}) →{" "}
                      {selectedOutboundOffer.destinationAirport.city} (
                      {selectedOutboundOffer.destinationAirport.iata})
                    </div>
                    <div className="text-[11px] text-[#E8E2D9]/80">
                      {selectedOutboundOffer.operatingAirlineName} • Voo{" "}
                      {selectedOutboundOffer.flightNumber} •{" "}
                      {selectedOutboundOffer.departureTime} -{" "}
                      {selectedOutboundOffer.arrivalTime}
                    </div>
                    <div className="text-[10px] text-[#E8E2D9]/70">
                      {selectedOutboundOffer.stops === 0
                        ? "Voo Direto"
                        : `${selectedOutboundOffer.stops} conexão(ões)`}{" "}
                      •{" "}
                      {outBag.checkedBagsIncluded > 0
                        ? `${outBag.checkedBagsIncluded}x Mala Despachada 23kg`
                        : "Mão 10kg + Bolsa (Sem mala despachada)"}
                    </div>
                  </div>

                  {/* Trecho 2: Volta (se Ida e Volta) */}
                  {tripType === "ROUND_TRIP" && (
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        selectedReturnOffer
                          ? "bg-white/10 border-white/15"
                          : "bg-[#BD9472]/15 border-dashed border-[#BD9472]"
                      }`}
                    >
                      {selectedReturnOffer ? (
                        <>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-[#BD9472] uppercase">
                              2. Voo de Volta • {returnDate}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedReturnOffer(null)}
                              className="text-[11px] text-white/75 hover:text-white underline"
                            >
                              Trocar Volta
                            </button>
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-white">
                            {selectedReturnOffer.destinationAirport.city} (
                            {selectedReturnOffer.destinationAirport.iata}) →{" "}
                            {selectedReturnOffer.originAirport.city} (
                            {selectedReturnOffer.originAirport.iata})
                          </div>
                          <div className="text-[11px] text-[#E8E2D9]/80">
                            {selectedReturnOffer.operatingAirlineName} • Voo{" "}
                            {selectedReturnOffer.returnFlightNumber ||
                              selectedReturnOffer.flightNumber}{" "}
                            • {selectedReturnOffer.departureTime} -{" "}
                            {selectedReturnOffer.arrivalTime}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-[#E8E2D9] space-y-1">
                          <div className="font-bold text-[#BD9472]">
                            2. Selecione agora o Voo de Volta
                          </div>
                          <p className="text-[11px] text-[#E8E2D9]/80">
                            Escolha um voo ao lado para fechar ida e volta antes de informar os passageiros.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inclusão de Bagagens Despachadas e Especiais após fechar todos os trechos */}
                  {isAllLegsClosed && (
                    <div className="p-3 rounded-xl bg-[#0E1B24]/70 border border-[#BD9472]/40 space-y-2.5">
                      <div className="text-[11px] font-extrabold text-[#BD9472] uppercase tracking-wider">
                        Adicionar Bagagens (Opcional)
                      </div>

                      {outBag.allowsExtraCheckedBaggage && (
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="font-bold text-white">
                              Mala Despachada (23kg)
                            </div>
                            <div className="text-[10px] text-[#E8E2D9]/70">
                              +{formatBRL(outBag.extraCheckedBagPricePerWay)} por trecho
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExtraCheckedBags(Math.max(0, extraCheckedBags - 1))
                              }
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold w-4 text-center">
                              {extraCheckedBags}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setExtraCheckedBags(Math.min(6, extraCheckedBags + 1))
                              }
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {outBag.allowsSpecialBaggage && (
                        <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-white/10">
                          <div>
                            <div className="font-bold text-white">
                              Bagagem Especial
                            </div>
                            <div className="text-[10px] text-[#E8E2D9]/70">
                              Instrumento / Esportiva (+
                              {formatBRL(outBag.specialBaggagePricePerWay)}/trecho)
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSpecialBags(Math.max(0, specialBags - 1))
                              }
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold w-4 text-center">
                              {specialBags}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSpecialBags(Math.min(4, specialBags + 1))
                              }
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Valor Final Consolidado da Compra */}
                  <div className="pt-3 border-t border-white/15 space-y-2 text-xs">
                    <div className="flex justify-between text-[#E8E2D9]/80">
                      <span>
                        Passagens ({formatPassengersLabel(adults, childrenAges.length)}):
                      </span>
                      <span className="font-mono font-bold">
                        {formatBRL(baseTotal)}
                      </span>
                    </div>
                    {(extraCheckedTotal > 0 || specialBagTotal > 0) && (
                      <div className="flex justify-between text-[#BD9472]">
                        <span>Bagagens Extras / Especiais:</span>
                        <span className="font-mono font-bold">
                          +{formatBRL(extraCheckedTotal + specialBagTotal)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline text-base font-extrabold text-white pt-1">
                      <span>Valor Final da Compra:</span>
                      <span className="font-mono text-2xl text-[#BD9472]">
                        {formatBRL(finalPurchaseTotal)}
                      </span>
                    </div>
                  </div>

                  {isAllLegsClosed ? (
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#BD9472] text-[#0E1B24] font-extrabold text-xs sm:text-sm hover:bg-[#D4AF8E] transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Ir para Dados dos Passageiros</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 text-center text-[11px] text-[#E8E2D9]/80">
                      Falta selecionar o voo de Volta para liberar os dados dos passageiros.
                    </div>
                  )}
                </aside>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
