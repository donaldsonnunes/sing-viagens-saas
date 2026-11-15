"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AIRPORTS } from "@/data/airports";
import {
  Sparkles,
  Calendar,
  MapPin,
  Plane,
  BellRing,
  CheckCircle2,
  ArrowRight,
  Music,
} from "lucide-react";

export function PortalShowsAndAlertSection() {
  const [shows, setShows] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showOrEventName, setShowOrEventName] = useState("");
  const [originIata, setOriginIata] = useState("GRU");
  const [destinationIata, setDestinationIata] = useState("GIG");
  const [targetMonthOrDate, setTargetMonthOrDate] = useState("Setembro/2026");
  const [submitting, setSubmitting] = useState(false);
  const [alertSaved, setAlertSaved] = useState(false);

  useEffect(() => {
    fetch("/api/portal")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.shows)) {
          setShows(data.shows.filter((s: any) => s.active !== false));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertSaved(false);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PRICE_ALERT",
          customerName,
          customerWhatsapp,
          customerEmail,
          showOrEventName,
          originIata,
          destinationIata,
          targetMonthOrDate,
        }),
      });
      if (res.ok) {
        setAlertSaved(true);
        setShowOrEventName("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* 1. Vitrine Dinâmica de Próximos Shows & Festivais (Gerenciada no Admin) */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Music className="w-3.5 h-3.5" />
              <span>Agenda de Shows & Destinos Conectados</span>
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
              Próximos Shows, Festivais e Turnês em Alta
            </h2>
          </div>
          <p className="text-sm text-zinc-500 max-w-md">
            Escolha o seu evento abaixo para já simular passagens aéreas chegando com antecedência na cidade do show.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {shows.map((show) => (
            <div
              key={show.id}
              className="rounded-3xl bg-white border border-zinc-200/90 hover:border-[#BD9472] p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#172C3B] text-[#BD9472] text-[10px] font-bold uppercase tracking-wider">
                    {show.categoryBadge}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-[#09090B]">
                    {show.destinationIata}
                  </span>
                </div>

                <h3 className="font-display text-lg font-extrabold text-[#09090B] group-hover:text-[#172C3B] transition">
                  {show.title}
                </h3>
                <p className="text-xs font-semibold text-[#BD9472]">
                  {show.artistOrTour}
                </p>

                <div className="pt-2 space-y-1.5 text-xs text-zinc-500 border-t border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#BD9472] shrink-0" />
                    <span>
                      {show.venueName} — <strong className="text-[#09090B]">{show.city}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#BD9472] shrink-0" />
                    <span>{show.eventDateLabel}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/pesquisa?destination=${show.destinationIata}&departureDate=${show.suggestedDepartureDate}&returnDate=${show.suggestedReturnDate}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#09090B] text-white font-semibold text-xs group-hover:bg-[#BD9472] group-hover:text-[#09090B] transition"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Buscar Voo para este Show</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Captação de Alerta de Preço para o Meu Show (Salva nos Leads do Admin) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#09090B] via-[#172C3B] to-[#09090B] text-white p-8 sm:p-10 border border-[#BD9472]/35 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BD9472]/20 border border-[#BD9472]/40 text-[#BD9472] text-xs font-bold">
            <BellRing className="w-3.5 h-3.5" />
            <span>Monitoramento Inteligente de Tarifas</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Já comprou o ingresso? Ative o Alerta de Passagem para o Seu Show
          </h3>
          <p className="text-xs sm:text-sm text-[#E8E2D9]/80 leading-relaxed">
            Informe para qual show ou festival você vai e de qual cidade pretende sair. Nossa equipe monitora a queda do milheiro nas companhias aéreas e avisa você no WhatsApp no momento ideal de emitir.
          </p>
        </div>

        <div className="lg:col-span-7">
          {alertSaved ? (
            <div className="rounded-2xl bg-white/10 border border-emerald-400/40 p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-extrabold text-white">
                Alerta de Passagem Registrado com Sucesso!
              </h4>
              <p className="text-xs text-[#E8E2D9]/85 max-w-md mx-auto">
                Recebemos o seu pedido de monitoramento. Assim que identificarmos a melhor janela tarifária para o seu show, avisaremos no seu WhatsApp ({customerWhatsapp}).
              </p>
              <button
                type="button"
                onClick={() => setAlertSaved(false)}
                className="px-4 py-2 rounded-xl bg-[#BD9472] text-[#09090B] font-bold text-xs"
              >
                Cadastrar Outro Alerta
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCreateAlert}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#E8E2D9] mb-1">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Rodrigo Almeida"
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#BD9472]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#E8E2D9] mb-1">
                    Seu WhatsApp (Para Receber o Alerta)
                  </label>
                  <input
                    type="text"
                    required
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#BD9472]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#E8E2D9] mb-1">
                    Qual Show, Artista ou Festival você vai?
                  </label>
                  <input
                    type="text"
                    required
                    value={showOrEventName}
                    onChange={(e) => setShowOrEventName(e.target.value)}
                    placeholder="Ex: Rock in Rio, Coldplay, The Town..."
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#BD9472]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#E8E2D9] mb-1">
                    Data ou Mês do Show
                  </label>
                  <input
                    type="text"
                    required
                    value={targetMonthOrDate}
                    onChange={(e) => setTargetMonthOrDate(e.target.value)}
                    placeholder="Ex: 18 de Setembro de 2026"
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#BD9472]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#E8E2D9] mb-1">
                    Cidade de Saída
                  </label>
                  <select
                    value={originIata}
                    onChange={(e) => setOriginIata(e.target.value)}
                    className="w-full rounded-xl bg-[#09090B] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#BD9472]"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.iata} value={a.iata}>
                        {a.city} ({a.iata})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#E8E2D9] mb-1">
                    Cidade do Show (Destino)
                  </label>
                  <select
                    value={destinationIata}
                    onChange={(e) => setDestinationIata(e.target.value)}
                    className="w-full rounded-xl bg-[#09090B] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#BD9472]"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.iata} value={a.iata}>
                        {a.city} ({a.iata})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#BD9472] text-[#09090B] font-display font-extrabold text-xs sm:text-sm hover:bg-[#D4AF8E] transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Ativando Alerta..."
                    : "Ativar Alerta Gratuito de Passagem no Meu WhatsApp"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
