import React from "react";
import Link from "next/link";
import { PORTFOLIO_CASES } from "@/data/siteContent";
import { Award, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Award className="w-4 h-4" />
            <span>Prova Real de Entrega • Portfólio & Cases</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Cases de Sucesso, Números Alcançados e o “Antes e Depois”
          </h1>
          <p className="text-base text-[#E8E2D9]/85 max-w-3xl">
            Veja como nossa estruturação de viagens e emissão inteligente transforma a experiência financeira e logística de fãs de eventos, famílias e empresas.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {PORTFOLIO_CASES.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white border border-[#172C3B]/15 shadow-md overflow-hidden p-8 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#172C3B] text-[#BD9472] text-xs font-bold">
                  {item.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#172C3B] mt-2">
                  {item.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Perfil atendido: {item.clientProfile}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {item.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#E8E2D9]/55 border border-[#BD9472]/40 px-4 py-2.5 text-center"
                  >
                    <div className="text-lg font-black text-[#172C3B]">{m.value}</div>
                    <div className="text-[11px] font-medium text-gray-600">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-red-50/60 border border-red-200 p-5 space-y-2">
                <div className="text-xs font-bold uppercase text-red-800">
                  Antes da Sing Viagens (Cenário Comum)
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {item.before}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-2">
                <div className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Depois da Sing Viagens (Solução Aplicada)</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                  {item.after}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="text-center pt-6">
          <Link
            href="/pesquisa"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-[#BD9472] text-[#0E1B24] font-bold text-sm hover:bg-[#D4AF8E] transition shadow-lg"
          >
            <span>Testar o Comparador de Preços Agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
