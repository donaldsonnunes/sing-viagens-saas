import React from "react";
import Link from "next/link";
import { FlightSearchExperience } from "@/components/FlightSearchExperience";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SERVICES, TESTIMONIALS } from "@/data/siteContent";
import {
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  Music,
  Plane,
  TrendingDown,
  Zap,
  Globe,
  Clock,
  SlidersHorizontal,
  CheckCircle2,
  Layers,
  Headphones,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-[#FAFAFA] text-[#09090B]">
      {/* 1. HERO SECTION DE ALTO IMPACTO (Dark Mode Sofisticado #09090B + Radial Glow + Mockup Interativo) */}
      <section className="relative bg-[#09090B] text-white pt-24 pb-28 -mt-20 overflow-hidden border-b border-white/10 bg-grid-pattern-dark">
        {/* Brilhos Radiais Suaves Estilo Linear / Stripe */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full opacity-30 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(189,148,114,0.45) 0%, rgba(23,44,59,0.5) 55%, transparent 100%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
          {/* Bloco Central Escaneável */}
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-up">
            {/* Badge Pílula com JetBrains Mono */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#BD9472] animate-pulse" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#E8E2D9]">
                SING TURISMO • O ELO ENTRE PESSOAS E EVENTOS
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.06]">
              Engenharia de viagens com a{" "}
              <span className="bg-gradient-to-r from-[#BD9472] via-[#E8E2D9] to-[#BD9472] bg-clip-text text-transparent">
                energia dos grandes palcos.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Compare em tempo real nossa tarifa consolidada lado a lado com o preço direto nas companhias aéreas. Emissão IATA, cálculo automático por idade e concierge 24/7 para shows e viagens.
            </p>

            {/* Dois Botões de Ação: Primário em Destaque + Secundário Fantasma */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <a
                href="#pesquisa-motor"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#BD9472] text-[#09090B] font-display font-bold text-sm shadow-[0_0_30px_rgba(189,148,114,0.4)] hover:bg-[#D4AF8E] hover:scale-[1.02] transition-all duration-200"
              >
                <Plane className="w-4 h-4" />
                <span>Simular e Comparar Cias Agora</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <Link
                href="/servicos/viagens-para-shows-e-eventos"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-zinc-200 font-display font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
              >
                <Music className="w-4 h-4 text-[#BD9472]" />
                <span>Conhecer Pacotes de Shows</span>
              </Link>
            </div>
          </div>

          {/* MOCKUP / DASHBOARD INTERATIVO SIMULADO ABAIXO DO HERO */}
          <div className="rounded-2xl bg-[#0E1318]/90 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden backdrop-blur-xl">
            {/* Barra de Janela Estilo macOS / Linear */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="font-mono text-[11px] text-zinc-400 ml-2">
                  sing-turismo://comparador-tarifario/tempo-real
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  ● API CONECTADA • MARKUP ADMIN ATIVO
                </span>
              </div>
            </div>

            {/* Corpo do Dashboard Simulado */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Identidade & Proposta Visual */}
              <div className="lg:col-span-4 rounded-2xl bg-[#09090B] border border-white/10 p-5 flex flex-col items-center text-center space-y-3">
                <img
                  src="/logo.png"
                  alt="Sing Viagens e Turismo"
                  className="h-28 w-auto object-contain"
                />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tecnologia proprietária de comparação multicompany com atendimento humano dedicado.
                </p>
              </div>

              {/* Comparativo Simulado em Tempo Real */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white/[0.03] border border-[#BD9472]/50 p-5 space-y-2 relative">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#BD9472] text-[#09090B] font-bold">
                    Preço Final Sing (50% Spread)
                  </span>
                  <div className="font-mono text-2xl font-bold text-white pt-1">
                    R$ 1.250
                  </div>
                  <div className="text-xs text-zinc-400">
                    GRU → GIG • 2 Adultos e 1 Criança (8 anos)
                  </div>
                  <div className="font-mono text-[11px] text-emerald-400 pt-1">
                    ✓ Custo Milhas: R$ 1.000 | Economia: R$ 250
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Direto na Companhia #1
                  </span>
                  <div className="font-mono text-2xl font-bold text-zinc-500 line-through pt-1">
                    R$ 1.500
                  </div>
                  <div className="text-xs text-zinc-400">
                    LATAM Oficial • Mesmo Voo LA3418
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 pt-1">
                    Tarifa comercial na Cia Aérea
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Direto na Companhia #2
                  </span>
                  <div className="font-mono text-2xl font-bold text-zinc-500 line-through pt-1">
                    R$ 1.620
                  </div>
                  <div className="text-xs text-zinc-400">
                    GOL / Azul • Horário Equivalente
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 pt-1">
                    Sem concierge de evento
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE PROVA SOCIAL COM LOGOTIPOS / PARCEIROS EM ESCALA DE CINZA E OPACIDADE REDUZIDA */}
      <section className="py-10 bg-white border-b border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <p className="text-center font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            COMPARAÇÃO EM TEMPO REAL COM AS PRINCIPAIS COMPANHIAS E HUBS GLOBAIS DE EVENTOS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center grayscale opacity-55 hover:opacity-90 transition-opacity">
            {[
              { name: "LATAM AIRLINES", code: "IATA: LA" },
              { name: "GOL LINHAS AÉREAS", code: "IATA: G3" },
              { name: "AZUL LINHAS AÉREAS", code: "IATA: AD" },
              { name: "TAP AIR PORTUGAL", code: "IATA: TP" },
              { name: "AMERICAN AIRLINES", code: "IATA: AA" },
              { name: "AIR FRANCE / KLM", code: "IATA: AF" },
            ].map((brand) => (
              <div key={brand.name} className="text-center">
                <div className="font-display text-xs sm:text-sm font-extrabold tracking-wider text-zinc-700">
                  {brand.name}
                </div>
                <div className="font-mono text-[10px] text-zinc-400">{brand.code}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO DE PESQUISA DE PASSAGENS E HOSPEDAGENS (Com Destaque na Opção Recomendada e Toggle) */}
      <section id="pesquisa-motor" className="py-20 bg-[#FAFAFA] bg-grid-pattern-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
                MOTOR INTERATIVO • PASSAGENS & HOSPEDAGENS
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
                Pesquise siglas IATA e compare o mesmo voo
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              Informe a quantidade de adultos e menores com suas idades. A opção mais vantajosa recebe nosso selo de recomendação automática.
            </p>
          </div>

          <FlightSearchExperience />
        </div>
      </section>

      {/* 4. SEÇÃO "COMO FUNCIONA & BENEFÍCIOS" EM BENTO GRID ASSIMÉTRICO MODERNO */}
      <section id="beneficios" className="py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              ARQUITETURA DE VALOR SING
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
              Por que viajar pela Sing supera comprar sozinho?
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
              Unimos a precisão de um motor SaaS de precificação parametrizada ao cuidado artesanal de especialistas em eventos e mobilidade aérea.
            </p>
          </div>

          {/* Bento Grid Assimétrico (12 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Bento Card 1 (7 cols) — Escuro Sofisticado */}
            <div className="md:col-span-7 rounded-2xl bg-[#09090B] text-white p-8 border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-[#BD9472] bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  <TrendingDown className="w-4 h-4" />
                  <span>01 • COMPARATIVO MULTICOMPANY LADO A LADO</span>
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Você vê nossa composição de preço e o valor nas Cias Aéreas na mesma tela.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Sem taxas ocultas no último passo do checkout. Mostramos a Tarifa Net Consolidada, o Markup parametrizado e quanto o mesmo voo custa diretamente na LATAM, GOL, Azul, TAP ou American.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
                <span>PRECISÃO TARIFÁRIA: ADULTOS • CRIANÇAS (2-11 ANOS) • BEBÊS (0-1 ANO)</span>
                <Link
                  href="/pesquisa"
                  className="text-[#BD9472] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Abrir Comparador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2 (5 cols) — Areia Clara #E8E2D9 */}
            <div className="md:col-span-5 rounded-2xl bg-[#E8E2D9]/60 border border-[#BD9472]/30 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-[#172C3B] bg-white/80 px-3 py-1 rounded-lg border border-zinc-200">
                  <Music className="w-4 h-4 text-[#BD9472]" />
                  <span>02 • LOGÍSTICA DE SHOWS & FESTIVAIS</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#09090B]">
                  Horários protegidos e hotéis próximos aos portões da arena.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Planejamos sua chegada com margem de segurança e seu retorno respeitando o descanso pós-espetáculo.
                </p>
              </div>

              <Link
                href="/servicos/viagens-para-shows-e-eventos"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172C3B] hover:text-[#BD9472] transition"
              >
                <span>Ver Landing Page de Shows</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bento Card 3 (4 cols) */}
            <div className="md:col-span-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200/90 p-7 space-y-3 hover:border-[#BD9472] transition">
              <SlidersHorizontal className="w-6 h-6 text-[#BD9472]" />
              <h3 className="font-display text-lg font-bold text-[#09090B]">
                Motor Admin Parametrizável
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Gestão inteligente de markup por companhia aérea e simulação instantânea de lucro sobre o retorno da API.
              </p>
            </div>

            {/* Bento Card 4 (4 cols) */}
            <div className="md:col-span-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200/90 p-7 space-y-3 hover:border-[#BD9472] transition">
              <Layers className="w-6 h-6 text-[#BD9472]" />
              <h3 className="font-display text-lg font-bold text-[#09090B]">
                Histórico de Buscas 1-Click
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Sua conta salva automaticamente cada pesquisa, idades das crianças e localizadores emitidos (PNR).
              </p>
            </div>

            {/* Bento Card 5 (4 cols) */}
            <div className="md:col-span-4 rounded-2xl bg-[#172C3B] text-white p-7 space-y-3 border border-[#BD9472]/30">
              <Headphones className="w-6 h-6 text-[#BD9472]" />
              <h3 className="font-display text-lg font-bold">
                Plantão Humano 24/7
              </h3>
              <p className="text-xs text-[#E8E2D9]/80 leading-relaxed">
                Se o voo atrasar ou o evento mudar de horário, você fala em minutos com especialistas reais no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VITRINE DE LANDING PAGES DE SERVIÇOS & PROVAS SOCIAIS */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
                MODALIDADES DEDICADAS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#09090B] mt-1">
                Soluções completas para cada perfil de viajante
              </h2>
            </div>
            <Link
              href="/servicos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172C3B] hover:text-[#BD9472] transition"
            >
              <span>Explorar todas as páginas de serviço</span>
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
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 text-[#172C3B]">
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
                  <span>Acessar página</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#BD9472] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ INTERATIVO EM FORMATO ACORDEÃO (ACCORDION) LIMPO */}
      <section id="faq" className="py-20 bg-white border-t border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              DÚVIDAS FREQUENTES • TRANSPARÊNCIA
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#09090B]">
              Perguntas Frequentes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Tudo o que você precisa saber sobre emissão comparativa, menores de idade, bagagens e garantias ANAC.
            </p>
          </div>

          <FaqAccordion />

          <div className="text-center pt-4">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172C3B] hover:text-[#BD9472] transition"
            >
              <span>Ir para a Central de Ajuda Completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
