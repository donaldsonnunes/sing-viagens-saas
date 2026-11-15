import React from "react";
import Link from "next/link";
import { SingCompactSymbol } from "./Navbar";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Lock,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#09090B] text-zinc-400 border-t border-white/10">
      {/* Banner CTA Superior */}
      <div className="border-b border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <SingCompactSymbol className="w-11 h-11 shrink-0" />
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">
                Sing Viagens e Turismo — O Elo entre Pessoas e Eventos
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Passagens aéreas com economia comparada para você viver seus melhores shows e destinos.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pesquisa"
              className="px-5 py-2.5 rounded-xl bg-[#BD9472] text-[#09090B] font-display font-bold text-xs sm:text-sm hover:bg-[#D4AF8E] transition shadow-[0_0_20px_rgba(189,148,114,0.3)]"
            >
              Pesquisar Passagens Agora
            </Link>
            <Link
              href="/contato"
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 font-display font-semibold text-xs sm:text-sm hover:bg-white/10 transition"
            >
              Falar no WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* Colunas Limpas (Sem informações técnicas de Design Tokens, Portfólio ou Depoimentos) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Coluna 1: Identidade */}
        <div className="space-y-4">
          <div className="w-44 rounded-2xl overflow-hidden border border-white/10 bg-black p-2.5">
            <img
              src="/logo.png"
              alt="Logo Sing Viagens e Turismo"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Especialistas em conectar você aos maiores shows, festivais e destinos do Brasil e do mundo através de passagens aéreas com preços comparados em tempo real.
          </p>
          <div className="pt-1 space-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#BD9472]" />
              <span>+55 (11) 99800-7464 (Atendimento & Plantão)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#BD9472]" />
              <span>contato@singviagens.com.br</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#BD9472]" />
              <span>São Paulo, SP • Emissão Nacional e Internacional</span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Passagens Aéreas */}
        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white mb-4">
            Passagens Aéreas
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/pesquisa" className="hover:text-[#BD9472] transition">
                Buscador e Comparador de Voos
              </Link>
            </li>
            <li>
              <Link
                href="/servicos/viagens-para-shows-e-eventos"
                className="hover:text-[#BD9472] transition"
              >
                Passagens para Shows e Festivais
              </Link>
            </li>
            <li>
              <Link
                href="/servicos/passagens-aereas-inteligentes"
                className="hover:text-[#BD9472] transition"
              >
                Voos Nacionais e Internacionais
              </Link>
            </li>
            <li>
              <Link
                href="/servicos/hospedagens-e-pacotes-vip"
                className="hover:text-[#BD9472] transition"
              >
                Passagens em Classe Executiva
              </Link>
            </li>
            <li>
              <Link
                href="/servicos/viagens-corporativas-e-grupos"
                className="hover:text-[#BD9472] transition"
              >
                Passagens para Grupos e Equipes
              </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Atendimento & Institucional */}
        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white mb-4">
            Atendimento & Suporte
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/sobre" className="hover:text-[#BD9472] transition">
                Sobre a Sing Turismo
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-[#BD9472] transition">
                Falar com Consultor / Cotação
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-[#BD9472] transition">
                Checkout & Emissão Online
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-[#BD9472] transition">
                Perguntas Frequentes (FAQ)
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[#BD9472] transition">
                Dicas de Viagem e Shows (Blog)
              </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 4: Área do Cliente & Legal */}
        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white mb-4">
            Minha Conta & Legal
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/conta" className="hover:text-[#BD9472] transition">
                Login e Histórico de Buscas
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-[#BD9472] transition">
                Política de Privacidade (LGPD)
              </Link>
            </li>
            <li>
              <Link href="/termos" className="hover:text-[#BD9472] transition">
                Termos de Uso e Regras de Cancelamento
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Rodapé Legal */}
      <div className="border-t border-white/10 py-6 px-4 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#BD9472]" />
            <span>
              © {new Date().getFullYear()} Sing Viagens e Turismo. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#BD9472]" />
            <span>Ambiente Seguro • Emissão Oficial com Código Localizador</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
