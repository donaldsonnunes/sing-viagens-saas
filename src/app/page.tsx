import React from "react";
import Link from "next/link";
import { FlightSearchExperience } from "@/components/FlightSearchExperience";
import { PortalShowsAndAlertSection } from "@/components/PortalShowsAndAlertSection";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SERVICES } from "@/data/siteContent";
import {
  ArrowRight,
  Music,
  Plane,
  TrendingDown,
  Layers,
  Headphones,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-[#FAFAFA] text-[#09090B]">
      {/* 1. HERO SECTION FOCADO EM PASSAGENS AÉREAS & SHOWS */}
      <section className="relative bg-[#09090B] text-white pt-24 pb-24 -mt-20 overflow-hidden border-b border-white/10 bg-grid-pattern-dark">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full opacity-30 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(189,148,114,0.45) 0%, rgba(23,44,59,0.5) 55%, transparent 100%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#BD9472] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E8E2D9]">
                SING TURISMO • O ELO ENTRE PESSOAS E EVENTOS
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[62px] font-extrabold tracking-tight text-white leading-[1.08]">
              A sua passagem aérea com a{" "}
              <span className="bg-gradient-to-r from-[#BD9472] via-[#E8E2D9] to-[#BD9472] bg-clip-text text-transparent">
                emoção dos grandes shows.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Conectamos você aos maiores espetáculos, festivais e destinos do mundo. Pesquise seu voo e compare na mesma tela o nosso preço especial ao lado do valor cobrado pelas companhias aéreas.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <a
                href="#pesquisa-motor"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#BD9472] text-[#09090B] font-display font-bold text-sm shadow-[0_0_30px_rgba(189,148,114,0.4)] hover:bg-[#D4AF8E] hover:scale-[1.02] transition-all duration-200"
              >
                <Plane className="w-4 h-4" />
                <span>Pesquisar Passagens Agora</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <Link
                href="/servicos/viagens-para-shows-e-eventos"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-zinc-200 font-display font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
              >
                <Music className="w-4 h-4 text-[#BD9472]" />
                <span>Passagens para Shows e Festivais</span>
              </Link>
            </div>
          </div>

          {/* DEMONSTRAÇÃO SIMPLES DE ECONOMIA EM PASSAGENS */}
          <div className="relative rounded-2xl bg-[#0E1318]/90 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden backdrop-blur-xl">
            {/* Carimbo redondo ilustrativo */}
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#BD9472]/75 bg-[#09090B]/70 backdrop-blur-xs flex items-center justify-center -rotate-12 shadow-lg"
            >
              <div className="w-[84%] h-[84%] rounded-full border border-[#BD9472]/45 flex flex-col items-center justify-center text-center px-1">
                <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.2em] text-[#BD9472]/80">
                  ★ SING ★
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#BD9472] leading-tight mt-0.5">
                  Exemplo
                  <br />
                  Ilustrativo
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 rounded-2xl bg-[#09090B] border border-white/10 p-5 flex flex-col items-center text-center space-y-3">
                <img
                  src="/logo.png"
                  alt="Sing Viagens e Turismo"
                  className="h-28 w-auto object-contain"
                />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  O mesmo voo das principais companhias aéreas por um valor muito mais inteligente.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white/[0.03] border border-[#BD9472]/50 p-5 space-y-2">
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#BD9472] text-[#09090B] font-bold">
                    Passagem na Sing Turismo
                  </span>
                  <div className="font-mono text-2xl font-bold text-white pt-1">
                    R$ 1.250
                  </div>
                  <div className="text-xs text-zinc-400">
                    São Paulo → Rio de Janeiro (2 Adultos, 1 Criança)
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                    ✓ Você economiza R$ 250 no mesmo voo
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-2">
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Direto na Companhia #1
                  </span>
                  <div className="font-mono text-2xl font-bold text-zinc-500 line-through pt-1">
                    R$ 1.500
                  </div>
                  <div className="text-xs text-zinc-400">
                    LATAM • Mesmo Voo LA3418
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1">
                    Preço tradicional na companhia
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-2">
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Direto na Companhia #2
                  </span>
                  <div className="font-mono text-2xl font-bold text-zinc-500 line-through pt-1">
                    R$ 1.620
                  </div>
                  <div className="text-xs text-zinc-400">
                    GOL / Azul • Mesmo Horário
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1">
                    Preço tradicional na companhia
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE COMPANHIAS AÉREAS COMPARADAS */}
      <section className="py-9 bg-white border-b border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            COMPARAMOS O MESMO VOO NAS PRINCIPAIS COMPANHIAS AÉREAS NACIONAIS E INTERNACIONAIS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center grayscale opacity-55">
            {[
              "LATAM AIRLINES",
              "GOL LINHAS AÉREAS",
              "AZUL LINHAS AÉREAS",
              "TAP AIR PORTUGAL",
              "AMERICAN AIRLINES",
              "AIR FRANCE",
            ].map((brand) => (
              <div
                key={brand}
                className="font-display text-xs sm:text-sm font-extrabold tracking-wider text-zinc-700"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOTOR DE PESQUISA DE PASSAGENS AÉREAS */}
      <section id="pesquisa-motor" className="py-20 bg-[#FAFAFA] bg-grid-pattern-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#BD9472]">
                PESQUISA E COMPARAÇÃO DE PASSAGENS AÉREAS
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
                Encontre o seu voo e compare na hora
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              Escolha a cidade de origem e destino, informe adultos e crianças com suas idades e veja a economia real em cada voo.
            </p>
          </div>

          <FlightSearchExperience />
        </div>
      </section>

      {/* 3.5. PRÓXIMOS SHOWS & FESTIVAIS EM DESTAQUE + ALERTA DE PREÇO */}
      <div className="bg-white border-t border-zinc-200/80">
        <PortalShowsAndAlertSection />
      </div>

      {/* 4. COMO FUNCIONA E BENEFÍCIOS (BENTO GRID FOCADO EM PASSAGENS E SHOWS) */}
      <section id="beneficios" className="py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              O ELO ENTRE VOCÊ E O SEU EVENTO
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
              Por que emitir suas passagens aéreas pela Sing?
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
              Unimos inteligência tarifária em passagens aéreas ao cuidado de especialistas que entendem a importância de chegar no horário certo para o seu show.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 rounded-2xl bg-[#09090B] text-white p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs text-[#BD9472] bg-white/5 px-3 py-1 rounded-lg border border-white/10 font-semibold">
                  <TrendingDown className="w-4 h-4" />
                  <span>COMPARATIVO LADO A LADO</span>
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Você vê o nosso preço e o valor direto nas companhias aéreas na mesma tela.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Através da nossa emissão inteligente e monitoramento contínuo quando a tarifa baixa, reduzimos o impacto das passagens caras em finais de semana de shows, feriados e viagens internacionais.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
                <span>Cálculo exato para Adultos, Crianças e Bebês</span>
                <Link
                  href="/pesquisa"
                  className="text-[#BD9472] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Pesquisar Passagens</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 rounded-2xl bg-[#E8E2D9]/60 border border-[#BD9472]/30 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs text-[#172C3B] bg-white/80 px-3 py-1 rounded-lg border border-zinc-200 font-semibold">
                  <Music className="w-4 h-4 text-[#BD9472]" />
                  <span>CONEXÃO COM O SEU SHOW</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#09090B]">
                  Voos planejados para você aproveitar cada segundo do espetáculo.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Emitimos seu bilhete aéreo pensando na logística real do evento, com horários seguros de chegada e retorno.
                </p>
              </div>

              <Link
                href="/servicos/viagens-para-shows-e-eventos"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172C3B] hover:text-[#BD9472] transition"
              >
                <span>Ver Passagens para Shows</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="md:col-span-6 rounded-2xl bg-[#FAFAFA] border border-zinc-200/90 p-7 space-y-3">
              <Layers className="w-6 h-6 text-[#BD9472]" />
              <h3 className="font-display text-lg font-bold text-[#09090B]">
                Histórico de Pesquisas Salvo na Sua Conta
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Suas pesquisas recentes e a configuração de viajantes ficam salvas para você retomar sua cotação com apenas 1 clique.
              </p>
            </div>

            <div className="md:col-span-6 rounded-2xl bg-[#172C3B] text-white p-7 space-y-3 border border-[#BD9472]/30">
              <Headphones className="w-6 h-6 text-[#BD9472]" />
              <h3 className="font-display text-lg font-bold">
                Código Localizador Oficial e Suporte Humano
              </h3>
              <p className="text-xs text-[#E8E2D9]/80 leading-relaxed">
                Você recebe o localizador oficial para fazer check-in no app da companhia aérea e conta com nosso suporte direto pelo WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MODALIDADES DE PASSAGENS AÉREAS */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#BD9472]">
                MODALIDADES DE EMISSÃO AÉREA
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#09090B] mt-1">
                Passagens aéreas para cada momento
              </h2>
            </div>
            <Link
              href="/servicos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172C3B] hover:text-[#BD9472] transition"
            >
              <span>Ver todas as modalidades</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((srv) => (
              <Link
                key={srv.slug}
                href={`/servicos/${srv.slug}`}
                className="group rounded-2xl bg-white border border-zinc-200/80 p-6 hover:border-[#BD9472] hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 text-[#172C3B]">
                    {srv.badge}
                  </span>
                  <h3 className="font-display text-base font-bold text-[#09090B] group-hover:text-[#BD9472] transition">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                    {srv.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-[#09090B]">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#BD9472] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ INTERATIVO */}
      <section id="faq" className="py-20 bg-white border-t border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              TIRE SUAS DÚVIDAS
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
              Perguntas Frequentes sobre Passagens
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Entenda como garantimos economia real e segurança na emissão da sua passagem aérea.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>
    </div>
  );
}
