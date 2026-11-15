"use client";

import React, { useState } from "react";
import { Phone, Mail, MessageSquare, Clock, CheckCircle2, Sparkles } from "lucide-react";

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F5F5F7] text-[#1D1D1F] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>Atendimento Humano & Atendente Virtual</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Contato e Solicitação de Orçamento Personalizado
          </h1>
          <p className="text-base text-[#E8E2D9]/85 max-w-3xl">
            Precisa de um roteiro sob medida para um show internacional, bloqueio de grupo ou viagem corporativa? Fale agora pelo WhatsApp ou envie seu pedido abaixo.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Canais Diretos */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-7 border border-[#BD9472]/40 space-y-5">
            <h2 className="text-xl font-bold text-white">Canais Diretos Sing Viagens</h2>
            <p className="text-xs sm:text-sm text-[#E8E2D9]/80">
              Nosso tempo médio de resposta pelo WhatsApp e e-mail no horário comercial é de menos de 5 minutos.
            </p>

            <a
              href="https://wa.me/5511998007464?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Sing%20Viagens%20e%20gostaria%20de%20um%20or%C3%A7amento."
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#BD9472] text-[#0E1B24] font-bold text-sm hover:bg-[#D4AF8E] transition shadow"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chamar Direto no WhatsApp</span>
            </a>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#BD9472]" />
                <span>contato@singviagens.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#BD9472]" />
                <span>Seg a Sex 08h às 20h • Sáb 09h às 15h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Orçamento */}
        <div className="lg:col-span-7">
          <div className="rounded-[24px] macos-card p-8">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-extrabold text-[#172C3B]">
                  Solicitação Recebida com Sucesso!
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Um especialista da Sing Viagens já recebeu seu briefing e entrará em contato pelo seu WhatsApp e e-mail com o comparativo completo.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#172C3B] text-white text-xs font-bold"
                >
                  Enviar Outra Solicitação
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#172C3B]">
                  Formulário Rápido de Cotação Personalizada
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="voce@email.com"
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172C3B] mb-1">
                      Modalidade Desejada
                    </label>
                    <select className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm">
                      <option>Viagem para Show / Festival</option>
                      <option>Passagens Aéreas (Nacional / Internacional)</option>
                      <option>Hospedagem VIP + Pacote Completo</option>
                      <option>Viagem Corporativa / Grupo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172C3B] mb-1">
                    Detalhes da Viagem (Origem, Destino, Datas, Quantidade de Adultos e Idade dos Menores)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ex: Gostaria de ir de São Paulo (GRU) para Lisboa (LIS) em Maio/2027 com 2 adultos e 1 criança de 7 anos..."
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-sm hover:bg-[#BD9472] hover:text-[#0E1B24] transition"
                >
                  Solicitar Orçamento Personalizado
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
