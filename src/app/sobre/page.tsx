import React from "react";
import Link from "next/link";
import { SingCompactSymbol } from "@/components/Navbar";
import {
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  CheckCircle2,
  Globe,
  Music,
} from "lucide-react";

export default function SobrePage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Sparkles className="w-4 h-4" />
              <span>Quem Somos • Nossa História e Identidade</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              A marca confiável para viajar, apaixonada por experiências, shows e eventos.
            </h1>
            <p className="text-base text-[#E8E2D9]/85 leading-relaxed">
              A <strong>Sing Viagens e Turismo</strong> nasceu da união entre especialistas em engenharia tarifária da aviação comercial e apaixonados pela indústria de grandes espetáculos e eventos ao redor do mundo.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#0B141C] border border-[#BD9472]/40 p-5 shadow-xl text-center space-y-3">
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

      {/* Missão, Certificações e Equipe */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#BD9472]" />
            <h3 className="text-lg font-bold text-[#172C3B]">
              Segurança & Credenciamento Oficial
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Operação 100% regularizada junto ao Ministério do Turismo (Cadastur), acordos com as maiores consolidadoras IATA e conformidade rigorosa com a Resolução 400 da ANAC.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3">
            <Music className="w-8 h-8 text-[#BD9472]" />
            <h3 className="text-lg font-bold text-[#172C3B]">
              Especialistas em Logística de Shows
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Conhecemos os acessos dos principais estádios e arenas das Américas e da Europa, garantindo voos e hotéis pensados para você viver o espetáculo sem imprevistos.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3">
            <Globe className="w-8 h-8 text-[#BD9472]" />
            <h3 className="text-lg font-bold text-[#172C3B]">
              Tecnologia SaaS Comparativa
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Nosso sistema próprio mostra a composição exata do preço da passagem e compara lado a lado com o site oficial de cada companhia aérea.
            </p>
          </div>
        </div>

        {/* Seção: Identidade Visual e Evolução do Símbolo */}
        <div className="rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-8 border border-[#BD9472]/40 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#BD9472]">
                Design System Oficial Sing
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Nossa Paleta de Cores e Evolução Responsiva da Marca
              </h2>
            </div>
            <div className="flex items-center gap-3 bg-[#0E1B24] px-4 py-2.5 rounded-xl border border-[#BD9472]/35">
              <SingCompactSymbol className="w-10 h-10" />
              <div className="text-xs">
                <div className="font-bold text-white">Símbolo Simplificado (Miniaturas)</div>
                <div className="text-[#E8E2D9]/70">Arco + Avião + Pin Musical em Cobre</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-[#0E1B24] p-5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#172C3B] border border-white/30" />
                <div>
                  <div className="font-bold text-white text-sm">Azul-Petróleo Profundo</div>
                  <div className="font-mono text-xs text-[#BD9472]">#172C3B</div>
                </div>
              </div>
              <p className="text-xs text-[#E8E2D9]/80">
                Transmite confiança, segurança e profissionalismo para cada emissão aérea e operação corporativa.
              </p>
            </div>

            <div className="rounded-xl bg-[#0E1B24] p-5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#BD9472] border border-white/30" />
                <div>
                  <div className="font-bold text-white text-sm">Cobre Suave</div>
                  <div className="font-mono text-xs text-[#BD9472]">#BD9472</div>
                </div>
              </div>
              <p className="text-xs text-[#E8E2D9]/80">
                Representa experiências especiais, calor humano, luzes de palco e exclusividade.
              </p>
            </div>

            <div className="rounded-xl bg-[#0E1B24] p-5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8E2D9] border border-white/30" />
                <div>
                  <div className="font-bold text-white text-sm">Areia Clara</div>
                  <div className="font-mono text-xs text-[#BD9472]">#E8E2D9</div>
                </div>
              </div>
              <p className="text-xs text-[#E8E2D9]/80">
                Traz leveza, equilíbrio visual e versatilidade para leitura confortável de tarifas e roteiros.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
