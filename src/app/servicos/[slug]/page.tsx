import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "@/data/siteContent";
import {
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function ServiceLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Hero da Landing Page Individual */}
      <section className="bg-gradient-to-b from-[#0E1B24] to-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/35">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-1.5 text-xs text-[#BD9472] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Visão Geral de Serviços</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BD9472]/20 border border-[#BD9472]/40 text-[#BD9472] text-xs font-bold ml-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{service.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            {service.title}
          </h1>
          <p className="text-lg text-[#BD9472] font-medium max-w-3xl">
            {service.subtitle}
          </p>
          <p className="text-sm sm:text-base text-[#E8E2D9]/85 max-w-3xl leading-relaxed">
            {service.heroDescription}
          </p>

          <div className="flex flex-wrap gap-4 pt-3">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#BD9472] text-[#0E1B24] font-bold text-sm hover:bg-[#D4AF8E] transition shadow-lg"
            >
              <span>Contratar ou Agendar Agora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pesquisa"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#BD9472]/50 text-[#E8E2D9] font-semibold text-sm hover:bg-white/10 transition"
            >
              <span>Simular Preços no Buscador</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona Passo a Passo */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            Metodologia Sing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172C3B] mt-1">
            Como Funciona Passo a Passo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {service.howItWorks.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl bg-white border border-[#172C3B]/15 p-6 shadow-sm space-y-3"
            >
              <span className="inline-block px-3 py-1 rounded-lg bg-[#172C3B] text-[#BD9472] font-mono font-bold text-sm">
                Etapa {step.step}
              </span>
              <h3 className="text-base font-bold text-[#172C3B]">{step.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Entregáveis e Benefícios */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          <div className="lg:col-span-6 rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-8 space-y-5 border border-[#BD9472]/40">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#BD9472]" />
              <span>O que está incluso (Entregáveis)</span>
            </h3>
            <ul className="space-y-3">
              {service.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#BD9472] shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-2xl bg-[#E8E2D9]/65 border border-[#BD9472]/40 p-8 space-y-5">
            <h3 className="text-xl font-bold text-[#172C3B]">
              Benefícios Exclusivos Sing Viagens
            </h3>
            <div className="space-y-4">
              {service.benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm font-bold text-[#172C3B]">{b.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{b.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Perguntas Frequentes Específicas do Serviço */}
        <div className="rounded-2xl bg-white border border-gray-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-[#172C3B] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#BD9472]" />
            <span>Perguntas Frequentes sobre este Serviço</span>
          </h3>
          <div className="space-y-4">
            {service.faqs.map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-200">
                <div className="text-sm font-bold text-[#172C3B]">{f.question}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {f.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
