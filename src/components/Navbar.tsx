"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

/**
 * Símbolo Vetorial Simplificado da Sing
 * Desenhado em estilo geométrico de alta precisão (Linear/Stripe aesthetic)
 */
export function SingCompactSymbol({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Símbolo Sing Turismo"
    >
      <rect width="48" height="48" rx="12" fill="#09090B" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="11.25"
        stroke="url(#borderGlow)"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <path
        d="M14 34C10 31 11 25 18 23L27 20C33 18 34 13 30 10"
        stroke="url(#copperGradNav)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M36 8L27 11L30 13.5L33 18L36 8Z" fill="#BD9472" />
      <circle cx="19" cy="33" r="3.8" fill="#BD9472" />
      <circle cx="19" cy="33" r="1.5" fill="#09090B" />
      <defs>
        <linearGradient
          id="copperGradNav"
          x1="10"
          y1="35"
          x2="36"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD9472" />
          <stop offset="0.5" stopColor="#E8E2D9" />
          <stop offset="1" stopColor="#BD9472" />
        </linearGradient>
        <linearGradient
          id="borderGlow"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD9472" />
          <stop offset="0.5" stopColor="#172C3B" />
          <stop offset="1" stopColor="#BD9472" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sing_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserName(parsed.name);
      } catch {
        setUserName(null);
      }
    }
  }, [pathname]);

  const primaryLinks = [
    { href: "/pesquisa", label: "Pesquisa & Cias" },
    { href: "/#beneficios", label: "Como Funciona" },
    { href: "/servicos", label: "Serviços" },
    { href: "/portfolio", label: "Cases" },
    { href: "/#faq", label: "FAQ" },
  ];

  const secondaryLinks = [
    { href: "/sobre", label: "Sobre a Sing Turismo", tag: "Institucional" },
    { href: "/depoimentos", label: "Depoimentos & Reviews", tag: "4.9 ★" },
    { href: "/blog", label: "Central de Conteúdo (Blog)", tag: "SEO" },
    { href: "/checkout", label: "Checkout & Agendamento", tag: "Online" },
    { href: "/contato", label: "Solicitar Orçamento VIP", tag: "24/7" },
    { href: "/admin", label: "Painel Admin (Markup API)", tag: "SaaS" },
  ];

  return (
    <div className="sticky top-0 z-50 px-3 sm:px-6 pt-3 pb-1 pointer-events-none">
      <header className="pointer-events-auto max-w-6xl mx-auto rounded-2xl bg-[#09090B]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.28)] text-white transition-all duration-300">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identidade Minimalista */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <SingCompactSymbol className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-tight text-white">
                Sing<span className="text-[#BD9472]">Turismo</span>
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#E8E2D9]/70">
                v2.0
              </span>
            </div>
          </Link>

          {/* Links Centrais (Estilo Linear / Vercel) */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.replace("/#", "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Menu Ecossistema Completo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 200)}
                className="whitespace-nowrap flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <span>Páginas</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#09090B]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 z-50 animate-fade-up">
                  {secondaryLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition"
                    >
                      <span>{sub.label}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#172C3B] text-[#BD9472] border border-[#BD9472]/30">
                        {sub.tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Ações Direita com Micro-interação de Brilho */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin"
              className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Parametrizar Markup da API"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#BD9472]" />
              <span className="font-mono text-[11px]">Admin</span>
            </Link>

            <Link
              href="/conta"
              className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-zinc-200 hover:border-[#BD9472]/50 hover:text-white transition"
            >
              <User className="w-3.5 h-3.5 text-[#BD9472]" />
              <span>{userName ? userName.split(" ")[0] : "Entrar"}</span>
            </Link>

            <Link
              href="/pesquisa"
              className="group relative whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#BD9472] via-[#D4AF8E] to-[#BD9472] text-[#09090B] shadow-[0_0_20px_rgba(189,148,114,0.35)] hover:shadow-[0_0_28px_rgba(189,148,114,0.65)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
              <span>Simular Tarifa</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 px-4 pt-3 pb-5 space-y-1.5 animate-fade-up">
            {[...primaryLinks, ...secondaryLinks].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#BD9472]" />
              </Link>
            ))}
            <div className="pt-3 grid grid-cols-2 gap-2">
              <Link
                href="/conta"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white"
              >
                Minha Conta
              </Link>
              <Link
                href="/pesquisa"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-bold bg-[#BD9472] text-[#09090B]"
              >
                Simular Tarifa
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
