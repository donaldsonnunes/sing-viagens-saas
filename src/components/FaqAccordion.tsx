"use client";

import React, { useState } from "react";
import { FAQ_ITEMS } from "@/data/siteContent";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-[#BD9472]/60 shadow-[0_8px_24px_rgba(9,9,11,0.05)]"
                : "bg-white/70 border-zinc-200/80 hover:border-zinc-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-[#172C3B] shrink-0">
                  {item.category.split(" ")[0]}
                </span>
                <span className="font-display text-sm sm:text-base font-bold text-[#09090B]">
                  {item.question}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#BD9472] shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 animate-fade-up">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
