import React from "react";
import Link from "next/link";
import { TESTIMONIALS } from "@/data/siteContent";
import { Star, PlayCircle, CheckCircle2, Sparkles } from "lucide-react";

export default function DepoimentosPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>Avaliações Verificadas • Google Reviews & Vídeos</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Depoimentos Reais de Clientes Sing Viagens
          </h1>
          <p className="text-base text-[#E8E2D9]/85 max-w-3xl">
            Nota média <strong>4.9 de 5.0</strong> baseada em centenas de emissões aéreas, viagens em família e pacotes para grandes festivais.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((dep) => (
            <div
              key={dep.id}
              className="rounded-2xl bg-white border border-[#172C3B]/15 p-7 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#BD9472]">
                    {[...Array(dep.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#BD9472]" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {dep.source} • {dep.date}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#172C3B]">
                  “{dep.highlight}”
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dep.comment}
                </p>

                {dep.videoDuration && (
                  <div className="rounded-xl bg-[#172C3B] text-[#E8E2D9] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      <PlayCircle className="w-5 h-5 text-[#BD9472]" />
                      <span>Relato em Vídeo Curtinho ({dep.eventTag})</span>
                    </div>
                    <span className="text-xs font-mono text-[#BD9472]">
                      {dep.videoDuration}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#172C3B]">{dep.name}</div>
                  <div className="text-xs text-gray-500">
                    {dep.role} — {dep.location}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#E8E2D9] text-[#172C3B] text-[11px] font-bold">
                  {dep.eventTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
