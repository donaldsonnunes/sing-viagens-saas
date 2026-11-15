"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton() {
  const message = encodeURIComponent(
    "Olá! Estou no portal da Sing Viagens e gostaria de cotar passagens aéreas para um show/viagem."
  );

  return (
    <a
      href={`https://wa.me/5511999990000?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atendimento Especialista no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#172C3B] text-white border border-[#BD9472]/60 shadow-[0_10px_30px_rgba(9,9,11,0.35)] hover:bg-[#09090B] hover:scale-105 transition-all duration-200 group"
    >
      <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
        <MessageCircle className="w-4 h-4 fill-current" />
      </span>
      <div className="pr-1 hidden sm:block">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#BD9472] leading-none">
          Atendente Virtual
        </div>
        <div className="text-xs font-extrabold text-white leading-tight mt-0.5">
          Falar no WhatsApp
        </div>
      </div>
    </a>
  );
}
