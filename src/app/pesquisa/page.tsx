"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FlightSearchExperience } from "@/components/FlightSearchExperience";
import { Plane, ShieldCheck } from "lucide-react";
import Link from "next/link";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") || "GRU";
  const destination = searchParams.get("destination") || "GIG";

  return (
    <FlightSearchExperience
      initialOrigin={origin}
      initialDestination={destination}
    />
  );
}

export default function PesquisaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <section className="bg-[#09090B] text-white pt-24 pb-12 -mt-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Plane className="w-3.5 h-3.5" />
              <span>Comparador de Passagens Aéreas</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              Pesquise seu Voo e Compare com as Companhias Aéreas
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Escolha sua cidade de origem e destino, informe adultos e crianças com suas idades e veja nossa tarifa lado a lado com o valor cobrado pelas principais companhias.
            </p>
          </div>

          <Link
            href="/conta"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            <ShieldCheck className="w-4 h-4 text-[#BD9472]" />
            <span>Meu Histórico de Buscas</span>
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <Suspense fallback={<div className="p-12 text-center">Carregando buscador de voos...</div>}>
          <SearchPageInner />
        </Suspense>
      </div>
    </div>
  );
}
