import React from "react";
import Link from "next/link";
import { FAQ_ITEMS } from "@/data/siteContent";
import { HelpCircle, Sparkles } from "lucide-react";

export default function FaqPage() {
  return (
    <div className="bg-[#F5F5F7] text-[#1D1D1F] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>Central de Ajuda & Transparência</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Perguntas Frequentes (FAQ)
          </h1>
          <p className="text-base text-[#E8E2D9]/85 max-w-2xl">
            Tire suas dúvidas sobre nossa composição de preços, comparativo com companhias aéreas, tarifas para menores, prazos de emissão e regras de reembolso.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-2"
          >
            <span className="inline-block px-2.5 py-0.5 rounded bg-[#E8E2D9] text-[#172C3B] text-[11px] font-bold">
              {item.category}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#172C3B] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#BD9472] shrink-0" />
              <span>{item.question}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-6">
              {item.answer}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
