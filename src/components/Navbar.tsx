"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  SlidersHorizontal,
  ArrowUpRight,
  Plane,
} from "lucide-react";

export function SingCompactSymbol({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sing Viagens e Turismo"
    >
      <defs>
        <linearGradient
          id="bgGradNav"
          x1="0"
          y1="0"
          x2="128"
          y2="128"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0B151D" />
          <stop offset="60%" stopColor="#172C3B" />
          <stop offset="100%" stopColor="#0E1B24" />
        </linearGradient>
        <linearGradient
          id="copperGradNav"
          x1="20"
          y1="108"
          x2="108"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#A87C58" />
          <stop offset="50%" stopColor="#BD9472" />
          <stop offset="100%" stopColor="#E8C9A9" />
        </linearGradient>
        <linearGradient
          id="silverRibbonNav"
          x1="28"
          y1="96"
          x2="88"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#E8E2D9" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      <rect
        x="4"
        y="4"
        width="120"
        height="120"
        rx="28"
        fill="url(#bgGradNav)"
        stroke="#BD9472"
        strokeWidth="3.5"
        strokeOpacity="0.55"
      />

      {/* Curva S em fita dupla (Cobre Suave + Areia Clara) fiel ao Logo Sing */}
      <path
        d="M32 94 C18 86, 22 68, 44 64 C66 60, 74 78, 56 92 C40 104, 20 96, 24 78"
        stroke="url(#copperGradNav)"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M58 88 C74 76, 66 62, 44 56 C24 50, 26 34, 78 24"
        stroke="url(#silverRibbonNav)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 48 C22 36, 42 26, 80 22"
        stroke="url(#copperGradNav)"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Avião Dourado/Cobre no topo direito do S */}
      <g transform="translate(76, 10) rotate(-18)">
        <path
          d="M2 16 L30 8 L18 18 L22 28 L14 20 L4 22 L8 17 Z"
          fill="url(#copperGradNav)"
        />
        <path d="M8 14 L30 8 L16 17 Z" fill="#FFF8F0" fillOpacity="0.85" />
      </g>

      {/* Pin de Destino/Show em Cobre Suave */}
      <path
        d="M94 58 C85.2 58 78 65.2 78 74 C78 85.5 94 100 94 100 C94 100 110 85.5 110 74 C110 65.2 102.8 58 94 58 Z"
        fill="url(#copperGradNav)"
      />
      <circle cx="94" cy="73" r="6.5" fill="#0E1B24" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/servicos", label: "Shows & Destinos" },
    { href: "/sobre", label: "Sobre a Sing" },
    { href: "/faq", label: "Dúvidas" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <div className="sticky top-0 z-50 px-3 sm:px-6 pt-3 pb-1 pointer-events-none">
      <header className="pointer-events-auto max-w-6xl mx-auto rounded-2xl bg-[#09090B]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.28)] text-white transition-all duration-300">
        <div className="px-4 sm:px-5 h-16 flex items-center justify-between gap-3 overflow-hidden">
          {/* Logo Limpo (Sem badge técnico v2.0) */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <SingCompactSymbol className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-white leading-none">
                Sing<span className="text-[#BD9472]">Turismo</span>
              </span>
              <span className="text-[10px] text-[#E8E2D9]/65 tracking-wider uppercase mt-0.5">
                Passagens & Eventos
              </span>
            </div>
          </Link>

          {/* Links Diretos Focados em Passagens */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

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
          </nav>

          {/* Ações Direita */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin"
              className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Área Administrativa"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#BD9472]" />
              <span>Admin</span>
            </Link>

            <Link
              href="/conta"
              className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-zinc-200 hover:border-[#BD9472]/50 hover:text-white transition"
            >
              <User className="w-3.5 h-3.5 text-[#BD9472]" />
              <span>{userName ? userName.split(" ")[0] : "Minha Conta"}</span>
            </Link>

            <Link
              href="/pesquisa"
              className="group relative whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#BD9472] via-[#D4AF8E] to-[#BD9472] text-[#09090B] shadow-[0_0_20px_rgba(189,148,114,0.35)] hover:shadow-[0_0_28px_rgba(189,148,114,0.65)] transition-all duration-200"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Buscar Passagens</span>
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
            {navLinks.map((item) => (
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
                Pesquisar Voos
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
