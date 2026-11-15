import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Music, Plane, ArrowRight } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 text-[#09090B]">
      {/* Hero Institucional */}
      <section className="bg-[#09090B] text-white pt-24 pb-16 -mt-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Sparkles className="w-4 h-4" />
              <span>Quem Somos • Sing Viagens e Turismo</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              O elo entre você e os momentos que ficam para sempre na memória.
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed">
              A <strong>Sing Viagens e Turismo</strong> nasceu para conectar pessoas aos seus grandes shows, festivais e destinos dos sonhos através de uma emissão de passagens aéreas mais justa, inteligente e transparente.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#0E1318] border border-white/10 p-6 shadow-xl text-center space-y-3">
              <img
                src="/logo.png"
                alt="Logotipo Sing Viagens e Turismo"
                className="w-full h-44 object-contain mx-auto"
              />
              <p className="text-xs text-[#BD9472] font-semibold tracking-wider uppercase">
                O Elo entre Pessoas e Eventos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares da Sing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-zinc-200 p-7 space-y-3">
            <Plane className="w-8 h-8 text-[#BD9472]" />
            <h3 className="font-display text-lg font-bold text-[#09090B]">
              Economia Transparente em Passagens
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Em todas as buscas, mostramos o nosso valor final ao lado do preço cobrado pelas principais companhias aéreas para que você tenha certeza de estar fazendo o melhor negócio.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-zinc-200 p-7 space-y-3">
            <Music className="w-8 h-8 text-[#BD9472]" />
            <h3 className="font-display text-lg font-bold text-[#09090B]">
              Paixão por Shows e Eventos
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Sabemos que viajar para um show tem hora marcada. Por isso, ajudamos você a escolher voos com janelas seguras de chegada e partida.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-zinc-200 p-7 space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#BD9472]" />
            <h3 className="font-display text-lg font-bold text-[#09090B]">
              Segurança do Início ao Embarque
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Toda emissão gera o código localizador oficial da companhia aérea, acompanhado pelo nosso suporte humano via WhatsApp.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#172C3B] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-2xl font-bold">
              Pronto para encontrar o voo ideal para o seu próximo show?
            </h2>
            <p className="text-xs sm:text-sm text-[#E8E2D9]/80">
              Utilize nosso comparador de passagens aéreas agora mesmo e veja a diferença.
            </p>
          </div>
          <Link
            href="/pesquisa"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#BD9472] text-[#09090B] font-display font-bold text-sm hover:bg-[#D4AF8E] transition"
          >
            <span>Pesquisar Passagens</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
