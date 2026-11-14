"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FlightSearchExperience } from "@/components/FlightSearchExperience";
import { Sparkles, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") || "GRU";
  const destination = searchParams.get("destination") || "GIG";
  const tab = searchParams.get("tab") === "hospedagens" ? "hotels" : "flights";

  return (
    <FlightSearchExperience
      initialOrigin={origin}
      initialDestination={destination}
      initialTab={tab}
    />
  );
}

export default function PesquisaPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Banner Topo da Página de Pesquisa de Preços */}
      <section className="bg-[#172C3B] text-[#E8E2D9] py-12 border-b border-[#BD9472]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motor de Busca IATA & Comparador Multicompany</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Pesquisa de Preços — Passagens Aéreas & Hospedagens
            </h1>
            <p className="text-sm text-[#E8E2D9]/80 max-w-3xl">
              Selecione origem e destino pelas siglas internacionais (IATA), informe adultos e menores com suas idades e compare nossa composição de preço lado a lado com o valor direto nas companhias aéreas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E1B24] border border-[#BD9472]/40 text-xs font-bold text-[#BD9472] hover:bg-[#BD9472] hover:text-[#0E1B24] transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Configurar Markup no Admin</span>
            </Link>
            <Link
              href="/conta"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#BD9472]" />
              <span>Ver Meu Histórico de Buscas</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <Suspense fallback={<div className="p-12 text-center">Carregando buscador Sing...</div>}>
          <SearchPageInner />
        </Suspense>
      </div>
    </div>
  );
}
