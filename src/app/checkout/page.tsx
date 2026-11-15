"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicketVoucherModal } from "@/components/TicketVoucherModal";
import {
  isValidCpf,
  validatePassportWithExpiry,
} from "@/lib/documentValidation";
import {
  CheckCircle2,
  Calendar,
  Plane,
  Sparkles,
  UserCheck,
  FileText,
  Users,
  UserPlus,
  AlertTriangle,
  X,
} from "lucide-react";

interface PassengerFormRow {
  typeLabel: string;
  frequentPassengerId?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  passport: string;
  passportExpiry: string;
  saveAsFrequentPassenger: boolean;
  fullName: string;
  documentCpfOrPassport: string;
}

export default function CheckoutPage() {
  const [mode, setMode] = useState<"CHECKOUT_FLIGHT" | "SCHEDULE_CONSULTATION">(
    "CHECKOUT_FLIGHT"
  );
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [payerCpf, setPayerCpf] = useState("");

  const [frequentPassengers, setFrequentPassengers] = useState<any[]>([]);
  const [savingInstantIdx, setSavingInstantIdx] = useState<number | null>(null);
  const [instantSaveFeedback, setInstantSaveFeedback] = useState<
    Record<number, string>
  >({});

  const [passengersDetails, setPassengersDetails] = useState<PassengerFormRow[]>([
    {
      typeLabel: "Adulto 1 (Titular)",
      frequentPassengerId: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      cpf: "",
      email: "",
      phone: "",
      passport: "",
      passportExpiry: "",
      saveAsFrequentPassenger: true,
      fullName: "",
      documentCpfOrPassport: "",
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);

  const checkOrderPaymentStatus = async (orderId: string) => {
    if (!orderId) return;
    setCheckingPaymentStatus(true);
    try {
      const res = await fetch(
        `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.status === "CONFIRMADO") {
        setConfirmedOrder((prev: any) =>
          prev ? { ...prev, status: "CONFIRMADO" } : prev
        );
        setPaymentIntent((prev: any) =>
          prev ? { ...prev, status: "APPROVED" } : prev
        );
      } else if (data?.status === "CANCELADO") {
        setConfirmedOrder((prev: any) =>
          prev ? { ...prev, status: "CANCELADO" } : prev
        );
      }
    } catch {
      // falha silenciosa no polling
    } finally {
      setCheckingPaymentStatus(false);
    }
  };

  useEffect(() => {
    if (!confirmedOrder?.id || paymentIntent?.status !== "PENDING") return;
    const interval = setInterval(() => {
      checkOrderPaymentStatus(confirmedOrder.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [confirmedOrder?.id, paymentIntent?.status]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [showAnacConsentModal, setShowAnacConsentModal] = useState(false);
  const [anacConsentChecked, setAnacConsentChecked] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const loadFrequentPassengersForEmail = async (
    targetEmail: string,
    initialRows?: PassengerFormRow[]
  ) => {
    if (!targetEmail) {
      setFrequentPassengers([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/account?email=${encodeURIComponent(targetEmail)}`
      );
      const data = await res.json();
      const list = Array.isArray(data.frequentPassengers)
        ? data.frequentPassengers
        : [];
      setFrequentPassengers(list);

      if (list.length > 0 && initialRows && initialRows.length > 0) {
        const firstSaved = list[0];
        const updatedRows = [...initialRows];
        updatedRows[0] = {
          ...updatedRows[0],
          frequentPassengerId: firstSaved.id,
          firstName: firstSaved.firstName || "",
          lastName: firstSaved.lastName || "",
          birthDate: firstSaved.birthDate || "",
          cpf: firstSaved.cpf || "",
          email: firstSaved.email || "",
          phone: firstSaved.phone || "",
          passport: firstSaved.passport || "",
          passportExpiry: firstSaved.passportExpiry || "",
          saveAsFrequentPassenger: true,
          fullName: `${firstSaved.firstName || ""} ${
            firstSaved.lastName || ""
          }`.trim(),
          documentCpfOrPassport: firstSaved.cpf || firstSaved.passport || "",
        };
        setPassengersDetails(updatedRows);
        if (firstSaved.cpf) {
          setPayerCpf(firstSaved.cpf);
        }
      }
    } catch {
      // fallback silencioso
    }
  };

  useEffect(() => {
    const syncCheckoutAuth = () => {
      const savedUser = localStorage.getItem("sing_user");
      let parsedUser: any = null;
      let defaultName = "";
      let defaultEmail = "";
      let defaultPhone = "";
      let defaultCpf = "";
      let defaultBirthDate = "";
      let defaultFirst = "";
      let defaultLast = "";

      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
          if (parsedUser?.email) {
            setLoggedUser(parsedUser);
            defaultName = parsedUser.name || "";
            defaultEmail = parsedUser.email || "";
            defaultPhone = parsedUser.phone || "";
            defaultCpf = parsedUser.cpf || "";
            defaultBirthDate = parsedUser.birthDate || "";
            const nameParts = defaultName.trim().split(/\s+/);
            defaultFirst = parsedUser.firstName || nameParts[0] || "";
            defaultLast =
              parsedUser.lastName || nameParts.slice(1).join(" ") || "";

            setCustomerName(defaultName);
            setCustomerEmail(defaultEmail);
            setCustomerPhone(defaultPhone);
            setPayerCpf(defaultCpf);
          } else {
            setLoggedUser(null);
          }
        } catch {
          setLoggedUser(null);
        }
      } else {
        setLoggedUser(null);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setPayerCpf("");
        setFrequentPassengers([]);
      }

      let computedRows: PassengerFormRow[] = [
        {
          typeLabel: "Adulto 1 (Titular)",
          frequentPassengerId: "",
          firstName: defaultFirst,
          lastName: defaultLast,
          birthDate: defaultBirthDate,
          cpf: defaultCpf,
          email: defaultEmail,
          phone: defaultPhone,
          passport: "",
          passportExpiry: "",
          saveAsFrequentPassenger: true,
          fullName: `${defaultFirst} ${defaultLast}`.trim(),
          documentCpfOrPassport: defaultCpf,
        },
      ];

      const raw = localStorage.getItem("sing_selected_checkout");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setSelectedData(parsed);

          const adultsCount = Math.max(
            1,
            Number(parsed?.searchParams?.adults) || 1
          );
          const childrenAges: number[] = Array.isArray(
            parsed?.searchParams?.childrenAges
          )
            ? parsed.searchParams.childrenAges
            : [];

          const rows: PassengerFormRow[] = [];
          for (let i = 0; i < adultsCount; i++) {
            rows.push({
              typeLabel: i === 0 ? "Adulto 1 (Titular)" : `Adulto ${i + 1}`,
              frequentPassengerId: "",
              firstName: i === 0 ? defaultFirst : "",
              lastName: i === 0 ? defaultLast : "",
              birthDate: i === 0 ? defaultBirthDate : "",
              cpf: i === 0 ? defaultCpf : "",
              email: i === 0 ? defaultEmail : "",
              phone: i === 0 ? defaultPhone : "",
              passport: "",
              passportExpiry: "",
              saveAsFrequentPassenger: true,
              fullName: i === 0 ? `${defaultFirst} ${defaultLast}`.trim() : "",
              documentCpfOrPassport: i === 0 ? defaultCpf : "",
            });
          }
          childrenAges.forEach((age, idx) => {
            rows.push({
              typeLabel:
                age < 2
                  ? `Bebê ${idx + 1} (${age} ano)`
                  : `Criança ${idx + 1} (${age} anos)`,
              frequentPassengerId: "",
              firstName: "",
              lastName: "",
              birthDate: "",
              cpf: "",
              email: "",
              phone: "",
              passport: "",
              passportExpiry: "",
              saveAsFrequentPassenger: true,
              fullName: "",
              documentCpfOrPassport: "",
            });
          });

          computedRows = rows;
        } catch {
          setSelectedData(null);
        }
      }

      setPassengersDetails(computedRows);
      setAuthChecked(true);

      if (defaultEmail) {
        loadFrequentPassengersForEmail(defaultEmail, computedRows);
      } else {
        setFrequentPassengers([]);
      }
    };

    syncCheckoutAuth();
    window.addEventListener("sing-auth-change", syncCheckoutAuth);
    return () => window.removeEventListener("sing-auth-change", syncCheckoutAuth);
  }, []);

  const handleSelectFrequentPassenger = (rowIdx: number, selectedId: string) => {
    const copy = [...passengersDetails];
    if (selectedId === "__NEW__") {
      copy[rowIdx] = {
        ...copy[rowIdx],
        frequentPassengerId: "",
        firstName: "",
        lastName: "",
        birthDate: "",
        cpf: "",
        email: "",
        phone: "",
        passport: "",
        passportExpiry: "",
        saveAsFrequentPassenger: true,
        fullName: "",
        documentCpfOrPassport: "",
      };
      setPassengersDetails(copy);
      return;
    }

    const found = frequentPassengers.find((p) => p.id === selectedId);
    if (found) {
      copy[rowIdx] = {
        ...copy[rowIdx],
        frequentPassengerId: found.id,
        firstName: found.firstName || "",
        lastName: found.lastName || "",
        birthDate: found.birthDate || "",
        cpf: found.cpf || "",
        email: found.email || "",
        phone: found.phone || "",
        passport: found.passport || "",
        passportExpiry: found.passportExpiry || "",
        saveAsFrequentPassenger: true,
        fullName: `${found.firstName || ""} ${found.lastName || ""}`.trim(),
        documentCpfOrPassport: found.cpf || found.passport || "",
      };
      setPassengersDetails(copy);
    }
  };

  const updatePassengerField = (
    idx: number,
    field: keyof PassengerFormRow,
    value: string | boolean
  ) => {
    const copy = [...passengersDetails];
    const updated = { ...copy[idx], [field]: value } as PassengerFormRow;
    updated.fullName = `${updated.firstName || ""} ${updated.lastName || ""}`.trim();
    updated.documentCpfOrPassport = updated.cpf || updated.passport || "";
    copy[idx] = updated;
    setPassengersDetails(copy);
  };

  const handleInstantSaveFrequentPassenger = async (idx: number) => {
    const pax = passengersDetails[idx];
    if (
      !pax.firstName.trim() ||
      !pax.lastName.trim() ||
      !pax.birthDate ||
      !pax.cpf.trim()
    ) {
      setInstantSaveFeedback((prev) => ({
        ...prev,
        [idx]: "Preencha Nome, Sobrenome, Data de Nascimento e CPF para salvar.",
      }));
      return;
    }
    if (!isValidCpf(pax.cpf)) {
      setInstantSaveFeedback((prev) => ({
        ...prev,
        [idx]:
          "CPF inválido. Informe um CPF válido (para testes, dígitos repetidos são aceitos).",
      }));
      return;
    }
    const paxPassportCheck = validatePassportWithExpiry(
      pax.passport,
      pax.passportExpiry
    );
    if (!paxPassportCheck.valid) {
      setInstantSaveFeedback((prev) => ({
        ...prev,
        [idx]:
          paxPassportCheck.error || "Informe a data de vencimento do passaporte.",
      }));
      return;
    }

    setSavingInstantIdx(idx);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_FREQUENT_PASSENGER",
          id: pax.frequentPassengerId || undefined,
          userEmail: customerEmail,
          firstName: pax.firstName,
          lastName: pax.lastName,
          birthDate: pax.birthDate,
          cpf: pax.cpf,
          email: pax.email,
          phone: pax.phone,
          passport: pax.passport,
          passportExpiry: pax.passport.trim() ? pax.passportExpiry : "",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setInstantSaveFeedback((prev) => ({
          ...prev,
          [idx]: data.error || "Não foi possível salvar o passageiro.",
        }));
        return;
      }
      if (data.frequentPassengers) {
        setFrequentPassengers(data.frequentPassengers);
      }
      if (data.passenger?.id) {
        const copy = [...passengersDetails];
        copy[idx] = {
          ...copy[idx],
          frequentPassengerId: data.passenger.id,
        };
        setPassengersDetails(copy);
      }
      setInstantSaveFeedback((prev) => ({
        ...prev,
        [idx]: "Passageiro salvo nos seus Passageiros Frequentes!",
      }));
      setTimeout(() => {
        setInstantSaveFeedback((prev) => ({ ...prev, [idx]: "" }));
      }, 3500);
    } finally {
      setSavingInstantIdx(null);
    }
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!isValidCpf(payerCpf)) {
      setCheckoutError(
        "CPF do pagador inválido. Informe um CPF válido (para testes, dígitos repetidos são aceitos)."
      );
      return;
    }

    for (const pax of passengersDetails) {
      if (!isValidCpf(pax.cpf)) {
        setCheckoutError(
          `CPF inválido para ${pax.firstName || pax.typeLabel}. Informe um CPF válido (para testes, dígitos repetidos são aceitos).`
        );
        return;
      }
      const passportCheck = validatePassportWithExpiry(
        pax.passport,
        pax.passportExpiry
      );
      if (!passportCheck.valid) {
        setCheckoutError(
          `${pax.firstName || pax.typeLabel}: ${passportCheck.error}`
        );
        return;
      }
    }

    setAnacConsentChecked(false);
    setShowAnacConsentModal(true);
  };

  const executeCreateOrder = async () => {
    if (!anacConsentChecked || submittingOrder) return;
    setSubmittingOrder(true);
    setCheckoutError("");
    try {
      const offer = selectedData?.offer;
    const baggageExtraTotal = Number(
      selectedData?.baggageExtras?.baggageExtraTotal || 0
    );
    const baseFlightPrice = Number(
      selectedData?.baseFlightPrice ??
        (offer?.pricingBreakdown?.singFinalSalePriceTotal
          ? offer.pricingBreakdown.singFinalSalePriceTotal - baggageExtraTotal
          : 1842.5)
    );
    const baseAirlineRef = Number(
      selectedData?.baseAirlineRef ??
        (offer?.airlineDirectComparison?.[0]?.directWebsitePriceTotal
          ? offer.airlineDirectComparison[0].directWebsitePriceTotal -
            baggageExtraTotal
          : 2190)
    );
    const adultsCount = selectedData?.searchParams?.adults || 1;
    const minorsCount = selectedData?.searchParams?.childrenAges?.length || 0;

    const normalizedPassengers = passengersDetails.map((p) => ({
      ...p,
      fullName: `${p.firstName} ${p.lastName}`.trim(),
      documentCpfOrPassport: p.cpf || p.passport,
    }));

    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_ORDER",
        offerId: offer?.id,
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
        passengersDetails: normalizedPassengers,
        singTotalPrice: baseFlightPrice,
        checkoutTotalWithBaggage: baseFlightPrice + baggageExtraTotal,
        airlineDirectReferencePrice: baseAirlineRef,
        savingsAmount:
          offer?.bestSavingsVsOperatingAirline ??
          Math.max(0, baseAirlineRef - baseFlightPrice),
        milesCostTotal: offer?.pricingBreakdown?.totalMilesCostWithTaxes || 1495,
        singProfitAmount: offer?.pricingBreakdown?.singProfitAmount || 347.5,
        paymentMethod,
      }),
    });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCheckoutError(data.error || "Não foi possível confirmar a emissão.");
        setShowAnacConsentModal(false);
        return;
      }
      if (data.frequentPassengers) {
        setFrequentPassengers(data.frequentPassengers);
      }
      if (data.order) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("sing_active_search");
          localStorage.removeItem("sing_selected_checkout");
        }
        setPaymentIntent(data.paymentIntent || null);
        setConfirmedOrder(data.order);
        setShowAnacConsentModal(false);
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-[#F5F5F7] text-[#1D1D1F] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-12 border-b border-[#BD9472]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>Emissão Segura ANAC & Passageiros Frequentes</span>
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
          authChecked && !loggedUser ? (
            <div className="max-w-xl mx-auto rounded-2xl bg-white border border-gray-200 p-8 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#172C3B] text-[#BD9472] flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[#172C3B]">
                Entre ou Crie sua Conta para Continuar
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Sua pesquisa e os voos selecionados já estão salvos. Para cadastrar ou selecionar seus passageiros e emitir o bilhete com segurança, acesse sua conta Sing.
              </p>
              <Link
                href="/conta?redirect=/checkout&mode=register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-extrabold text-xs sm:text-sm hover:bg-[#BD9472] hover:text-[#0E1B24] transition shadow-md"
              >
                <span>Entrar ou Criar Conta Agora</span>
              </Link>
            </div>
          ) : confirmedOrder ? (
            <div className="rounded-2xl bg-white border border-emerald-300 p-8 text-center space-y-5 shadow-lg">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172C3B]">
                {paymentIntent?.status === "PENDING"
                  ? `Pedido Registrado! Localizador: ${confirmedOrder.pnr}`
                  : `Passagem Emitida! Localizador Oficial: ${confirmedOrder.pnr}`}
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Os dados de todos os passageiros foram registrados no banco de dados da Sing Viagens ({confirmedOrder.userEmail}) e atualizados na sua lista de Passageiros Frequentes. Você economizou{" "}
                <strong>
                  R$ {Number(confirmedOrder.savingsAmount).toLocaleString("pt-BR")}
                </strong>{" "}
                em relação à compra direta na companhia aérea.
              </p>

              {paymentIntent && (paymentIntent.pixQrCode || paymentIntent.checkoutUrl) && (
                <div className="max-w-lg mx-auto rounded-2xl bg-[#F5F5F7] border border-gray-200 p-5 text-left space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#172C3B]">
                      {paymentIntent.pixQrCode ? "Pagamento via PIX" : "Pagamento via Cartão"}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                      {paymentIntent.mode === "PRODUCTION"
                        ? paymentIntent.status === "PENDING"
                          ? "Aguardando Confirmação"
                          : "Confirmado"
                        : "Modo Demonstração"}
                    </span>
                  </div>

                  {paymentIntent.pixQrCodeBase64 && (
                    <div className="flex justify-center py-2">
                      <img
                        src={`data:image/png;base64,${paymentIntent.pixQrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-44 h-44 rounded-xl border border-gray-200 bg-white p-2"
                      />
                    </div>
                  )}

                  {paymentIntent.pixQrCode && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">
                        Copie o código PIX Copia e Cola abaixo e pague no aplicativo do seu banco:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={paymentIntent.pixQrCode}
                          className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(paymentIntent.pixQrCode);
                            setCopiedPix(true);
                            setTimeout(() => setCopiedPix(false), 2500);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#172C3B] text-white text-xs font-bold hover:bg-[#BD9472] hover:text-[#0E1B24] transition whitespace-nowrap"
                        >
                          {copiedPix ? "Copiado!" : "Copiar PIX"}
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentIntent.checkoutUrl && (
                    <div className="pt-1">
                      <a
                        href={paymentIntent.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#009EE3] text-white font-extrabold text-xs sm:text-sm hover:opacity-90 transition shadow"
                      >
                        Pagar com Cartão no Mercado Pago
                      </a>
                    </div>
                  )}

                  {paymentIntent.status === "PENDING" && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200">
                      <span className="text-[11px] text-gray-500">
                        Verificando confirmação automática a cada 5s...
                      </span>
                      <button
                        type="button"
                        disabled={checkingPaymentStatus}
                        onClick={() => checkOrderPaymentStatus(confirmedOrder.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-[#172C3B] text-[11px] font-bold hover:bg-gray-100 transition disabled:opacity-60"
                      >
                        {checkingPaymentStatus
                          ? "Verificando..."
                          : "Já paguei / Verificar Agora"}
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                  Ir para Meu Dashboard e Passageiros Frequentes
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
                  {/* Seção 1: Seleção ou Cadastro na Hora de Cada Passageiro */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[#BD9472]" />
                        <div>
                          <h2 className="text-lg font-extrabold text-[#172C3B]">
                            1. Dados dos Passageiros para Emissão do Bilhete
                          </h2>
                          <p className="text-xs text-gray-500">
                            Selecione um passageiro frequente cadastrado ou cadastre um novo na hora (sem limites por conta).
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/conta"
                        className="text-xs font-bold text-[#172C3B] hover:text-[#BD9472] underline"
                      >
                        Gerenciar todos ({frequentPassengers.length})
                      </Link>
                    </div>

                    <div className="space-y-5">
                      {passengersDetails.map((pax, idx) => (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-[#172C3B] text-[#BD9472] font-mono text-xs font-bold">
                              Passageiro #{idx + 1} • {pax.typeLabel}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleSelectFrequentPassenger(idx, "__NEW__")
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#172C3B]/30 text-[#172C3B] hover:bg-[#172C3B] hover:text-white text-xs font-bold transition"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-[#BD9472]" />
                              <span>+ Cadastrar Novo na Hora</span>
                            </button>
                          </div>

                          {/* Seletor de Passageiro Frequente Cadastrado vs Cadastrar na Hora */}
                          <div className="p-3 rounded-xl bg-white border border-[#BD9472]/50 space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#172C3B] uppercase tracking-wider">
                              <Users className="w-3.5 h-3.5 text-[#BD9472]" />
                              <span>
                                Selecionar Passageiro Cadastrado ou Cadastrar na Hora:
                              </span>
                            </label>
                            <select
                              value={pax.frequentPassengerId || "__NEW__"}
                              onChange={(e) =>
                                handleSelectFrequentPassenger(idx, e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-300 bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-[#09090B]"
                            >
                              <option value="__NEW__">
                                ➕ Cadastrar novo passageiro na hora (preencher campos abaixo)
                              </option>
                              {frequentPassengers.map((fp) => (
                                <option key={fp.id} value={fp.id}>
                                  👤 {fp.firstName} {fp.lastName} — CPF: {fp.cpf} • Nasc:{" "}
                                  {fp.birthDate}
                                  {fp.passport ? ` • Passaporte: ${fp.passport}` : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Campos Obrigatórios e Opcionais do Passageiro */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                Nome *
                              </label>
                              <input
                                type="text"
                                required
                                value={pax.firstName}
                                onChange={(e) =>
                                  updatePassengerField(idx, "firstName", e.target.value)
                                }
                                placeholder="Ex: José"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                Sobrenome *
                              </label>
                              <input
                                type="text"
                                required
                                value={pax.lastName}
                                onChange={(e) =>
                                  updatePassengerField(idx, "lastName", e.target.value)
                                }
                                placeholder="Ex: Silva"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                Data de Nascimento *
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

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                                CPF *
                              </label>
                              <input
                                type="text"
                                required
                                value={pax.cpf}
                                onChange={(e) =>
                                  updatePassengerField(idx, "cpf", e.target.value)
                                }
                                placeholder="000.000.000-00"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 font-mono text-xs text-[#09090B]"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                E-mail{" "}
                                <span className="font-normal text-gray-400">
                                  (opcional)
                                </span>
                              </label>
                              <input
                                type="email"
                                value={pax.email}
                                onChange={(e) =>
                                  updatePassengerField(idx, "email", e.target.value)
                                }
                                placeholder="passageiro@email.com"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                Celular{" "}
                                <span className="font-normal text-gray-400">
                                  (opcional)
                                </span>
                              </label>
                              <input
                                type="text"
                                value={pax.phone}
                                onChange={(e) =>
                                  updatePassengerField(idx, "phone", e.target.value)
                                }
                                placeholder="(11) 99999-9999"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                              />
                            </div>

                            <div className="sm:col-span-6">
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                Passaporte{" "}
                                <span className="font-normal text-gray-400">
                                  (opcional — voos internacionais)
                                </span>
                              </label>
                              <input
                                type="text"
                                value={pax.passport}
                                onChange={(e) => {
                                  const val = e.target.value.toUpperCase();
                                  updatePassengerField(idx, "passport", val);
                                  if (!val.trim()) {
                                    updatePassengerField(idx, "passportExpiry", "");
                                  }
                                }}
                                placeholder="Ex: FP123456"
                                className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 font-mono text-xs text-[#09090B]"
                              />
                            </div>

                            {pax.passport.trim() !== "" && (
                              <div className="sm:col-span-6">
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                  Data de Vencimento do Passaporte *
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={pax.passportExpiry}
                                  onChange={(e) =>
                                    updatePassengerField(
                                      idx,
                                      "passportExpiry",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                                />
                              </div>
                            )}

                            <div className="sm:col-span-6 flex items-end">
                              <button
                                type="button"
                                disabled={savingInstantIdx === idx}
                                onClick={() => handleInstantSaveFrequentPassenger(idx)}
                                className="w-full py-2 px-3 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-xs hover:bg-[#BD9472] hover:text-[#0E1B24] transition"
                              >
                                {savingInstantIdx === idx
                                  ? "Salvando..."
                                  : pax.frequentPassengerId
                                  ? "Atualizar nos Passageiros Frequentes"
                                  : "Salvar nos Passageiros Frequentes Agora"}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <label className="inline-flex items-center gap-2 text-xs text-[#172C3B] font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pax.saveAsFrequentPassenger}
                                onChange={(e) =>
                                  updatePassengerField(
                                    idx,
                                    "saveAsFrequentPassenger",
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 text-[#172C3B]"
                              />
                              <span>
                                Salvar/atualizar automaticamente na minha lista de Passageiros Frequentes ao emitir
                              </span>
                            </label>

                            {instantSaveFeedback[idx] && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                {instantSaveFeedback[idx]}
                              </span>
                            )}
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

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {checkoutError}
                    </div>
                  )}

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

                {/* Trecho de Ida */}
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                  <div className="text-[11px] font-mono font-bold text-[#BD9472] uppercase">
                    Voo de Ida • {selectedData?.searchParams?.departureDate || "2026-12-10"}
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {selectedData?.offer
                      ? `${selectedData.offer.originAirport.city} (${selectedData.offer.originAirport.iata}) → ${selectedData.offer.destinationAirport.city} (${selectedData.offer.destinationAirport.iata})`
                      : "São Paulo (GRU) → Rio de Janeiro (GIG)"}
                  </div>
                  <div className="text-xs text-[#E8E2D9]/80">
                    {selectedData?.offer
                      ? `${selectedData.offer.operatingAirlineName} • Voo ${selectedData.offer.flightNumber} • ${selectedData.offer.departureTime} - ${selectedData.offer.arrivalTime}`
                      : "LATAM Airlines (LA3418)"}
                  </div>
                </div>

                {/* Trecho de Volta (quando Ida e Volta) */}
                {selectedData?.returnOffer && (
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                    <div className="text-[11px] font-mono font-bold text-[#BD9472] uppercase">
                      Voo de Volta • {selectedData?.searchParams?.returnDate || ""}
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {selectedData.returnOffer.destinationAirport.city} (
                      {selectedData.returnOffer.destinationAirport.iata}) →{" "}
                      {selectedData.returnOffer.originAirport.city} (
                      {selectedData.returnOffer.originAirport.iata})
                    </div>
                    <div className="text-xs text-[#E8E2D9]/80">
                      {selectedData.returnOffer.operatingAirlineName} • Voo{" "}
                      {selectedData.returnOffer.returnFlightNumber ||
                        selectedData.returnOffer.flightNumber}{" "}
                      • {selectedData.returnOffer.departureTime} -{" "}
                      {selectedData.returnOffer.arrivalTime}
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#BD9472] font-semibold">
                  Passageiros no bilhete: {passengersDetails.length} viajante(s)
                </div>

                {selectedData?.baggageExtras &&
                  (selectedData.baggageExtras.extraCheckedBags > 0 ||
                    selectedData.baggageExtras.specialBags > 0) && (
                    <div className="p-3 rounded-xl bg-[#0E1B24]/70 border border-[#BD9472]/40 text-xs space-y-1">
                      <div className="font-bold text-[#BD9472]">
                        Bagagens Adicionais Incluídas:
                      </div>
                      {selectedData.baggageExtras.extraCheckedBags > 0 && (
                        <div>
                          • {selectedData.baggageExtras.extraCheckedBags}x Mala(s) Despachada(s) 23kg
                        </div>
                      )}
                      {selectedData.baggageExtras.specialBags > 0 && (
                        <div>
                          • {selectedData.baggageExtras.specialBags}x Bagagem(ns) Especial(is)
                        </div>
                      )}
                      <div className="font-mono font-bold text-emerald-300 pt-1">
                        Acréscimo bagagens: +R${" "}
                        {Number(
                          selectedData.baggageExtras.baggageExtraTotal || 0
                        ).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  )}

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

      {/* Modal de Ciência e Consentimento ANAC antes da Emissão */}
      {showAnacConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border-2 border-[#BD9472] shadow-2xl overflow-hidden animate-fade-up">
            <div className="bg-[#172C3B] text-white px-6 py-4 flex items-center justify-between border-b border-[#BD9472]/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[#BD9472] font-bold">
                    Termo de Ciência Obrigatório
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    ATENÇÃO — Normas da ANAC e Regras Tarifárias
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAnacConsentModal(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5">
                <p>
                  De acordo com as <strong>resoluções e normas da ANAC</strong>{" "}
                  (Agência Nacional de Aviação Civil), a compra da passagem
                  aérea só poderá ser <strong>cancelada sem nenhum custo</strong>{" "}
                  em até <strong>24 (vinte e quatro) horas</strong> a partir do
                  recebimento do comprovante da emissão, inclusive em caso de{" "}
                  <strong>informações incorretas fornecidas</strong> no
                  preenchimento dos dados dos passageiros.
                </p>
                <p>
                  <strong>Após este prazo de 24 horas</strong>, serão seguidas
                  integralmente as regras da{" "}
                  <strong>
                    classe tarifária e do tipo de passagem adquirida
                  </strong>{" "}
                  fornecidas pela companhia aérea emissora (sujeitas a multas,
                  diferenças tarifárias ou restrições de reembolso),{" "}
                  <strong>não sendo mais possível reverter a emissão</strong>.
                </p>
              </div>

              <div className="text-xs text-zinc-500">
                Antes de concluir, certifique-se de que nome, sobrenome, data de
                nascimento, CPF e eventual passaporte/validade conferem
                exatamente com os documentos oficiais de embarque.
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200 hover:border-[#BD9472] cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={anacConsentChecked}
                  onChange={(e) => setAnacConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#172C3B] rounded cursor-pointer shrink-0"
                />
                <span className="text-xs font-semibold text-[#172C3B]">
                  Li, compreendi e concordo com as normas da ANAC, assumindo
                  ciência do prazo de 24 horas para cancelamento sem custos e das
                  regras da classe/tarifa da companhia aérea após esse período.
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnacConsentModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-zinc-700 font-bold text-xs hover:bg-gray-50 transition"
                >
                  Revisar Dados
                </button>
                <button
                  type="button"
                  disabled={!anacConsentChecked || submittingOrder}
                  onClick={executeCreateOrder}
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs transition shadow-md ${
                    anacConsentChecked && !submittingOrder
                      ? "bg-[#BD9472] text-[#0E1B24] hover:bg-[#D4AF8E] cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {submittingOrder
                    ? "Emitindo Localizador..."
                    : "Concordar e Finalizar Compra"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVoucherModal && confirmedOrder && (
        <TicketVoucherModal
          order={confirmedOrder}
          onClose={() => setShowVoucherModal(false)}
        />
      )}
    </div>
  );
}
