import React from "react";
import Link from "next/link";
import { SERVICES } from "@/data/siteContent";
import { ArrowRight, CheckCircle2, Sparkles, PhoneCall } from "lucide-react";

export default function ServicosOverviewPage() {
  return (
    <div className="bg-[#F5F5F7] text-[#1D1D1F] min-h-screen pb-20">
      {/* Header */}
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>O Elo entre Você e o Seu Show</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Emissão de Passagens Aéreas para Shows e Destinos
          </h1>
          <p className="text-base sm:text-lg text-[#E8E2D9]/85 max-w-3xl">
            Escolha a modalidade de emissão ideal para a sua viagem — seja para garantir o voo perfeito para o seu festival favorito, emitir passagens nacionais e internacionais com economia comparada ou organizar o embarque do seu grupo.
          </p>
        </div>
      </section>

      {/* Lista Detalhada de Todos os Serviços */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        {SERVICES.map((srv, idx) => (
          <div
            key={srv.slug}
            className="rounded-2xl bg-white border border-[#172C3B]/15 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-8 p-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#172C3B] text-[#E8E2D9] text-xs font-bold">
                  0{idx + 1} • {srv.badge}
                </span>
                <span className="text-xs font-bold text-[#BD9472]">
                  {srv.priceStartingAt}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-[#172C3B]">
                {srv.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {srv.heroDescription}
              </p>

              <div className="bg-[#E8E2D9]/45 rounded-xl p-4 border border-[#BD9472]/30">
                <div className="text-xs font-bold uppercase text-[#172C3B] mb-2">
                  Principais Entregáveis Inclusos:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {srv.deliverables.map((deliv, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#172C3B]">
                      <CheckCircle2 className="w-4 h-4 text-[#BD9472] shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#172C3B] text-[#E8E2D9] p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#BD9472]/30">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-widest text-[#BD9472] font-bold">
                  Para quem é indicado?
                </div>
                <p className="text-xs sm:text-sm text-[#E8E2D9]/85 leading-relaxed">
                  {srv.idealFor}
                </p>
              </div>

              <div className="space-y-3 pt-6">
                <Link
                  href={`/servicos/${srv.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#BD9472] text-[#0E1B24] font-bold text-xs sm:text-sm hover:bg-[#D4AF8E] transition shadow"
                >
                  <span>Ver Página Exclusiva do Serviço</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#BD9472]" />
                  <span>Contratar / Agendar Online</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
