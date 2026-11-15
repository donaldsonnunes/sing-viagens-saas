"use client";

import React from "react";
import { SingCompactSymbol } from "@/components/Navbar";
import {
  Plane,
  CheckCircle2,
  Printer,
  X,
  ShieldCheck,
  UserCheck,
  Calendar,
} from "lucide-react";

interface TicketVoucherModalProps {
  order: any;
  onClose: () => void;
}

export function TicketVoucherModal({ order, onClose }: TicketVoucherModalProps) {
  if (!order) return null;

  const formatBRL = (val: number) =>
    Number(val || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const passengersList =
    Array.isArray(order.passengersDetails) && order.passengersDetails.length > 0
      ? order.passengersDetails
      : [
          {
            typeLabel: "Passageiro Principal",
            fullName: order.customerName || "Passageiro Sing",
            documentCpfOrPassport: order.payerCpf || "Confirmado na emissão",
            birthDate: "Registrado",
          },
        ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-200 my-8 animate-fade-up">
        {/* Cabeçalho Oficial Sing do E-Ticket */}
        <div className="bg-[#0E1B24] text-white p-6 sm:p-7 border-b-4 border-[#BD9472] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SingCompactSymbol className="w-11 h-11" />
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#BD9472] font-bold">
                E-Ticket & Voucher Oficial de Emissão
              </div>
              <div className="text-xl font-extrabold text-white">
                Sing Viagens e Turismo
              </div>
              <div className="text-xs text-[#E8E2D9]/70">
                O Elo entre Pessoas e Eventos
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-[#172C3B] px-4 py-2.5 rounded-2xl border border-[#BD9472]/50">
            <div className="text-[10px] font-mono uppercase text-[#E8E2D9]/75">
              Código Localizador (PNR)
            </div>
            <div className="font-mono text-2xl font-black text-[#BD9472] tracking-wider">
              {order.pnr}
            </div>
          </div>
        </div>

        {/* Corpo do Bilhete */}
        <div className="p-6 sm:p-7 space-y-6 text-[#09090B]">
          {/* Barra de Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>STATUS DA RESERVA: {order.status || "CONFIRMADO"}</span>
            </div>
            <span className="font-mono text-zinc-500">
              Pedido #{order.id} • Emitido em{" "}
              {new Date(order.createdAt || Date.now()).toLocaleDateString("pt-BR")}
            </span>
          </div>

          {/* Dados do Voo */}
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#BD9472]/40 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#BD9472]" />
                <span className="font-bold text-sm text-[#172C3B]">
                  {order.airline} — Voo {order.flightCode}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-zinc-600">
                {order.passengersSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-[11px] uppercase font-bold text-zinc-400">
                  Origem
                </div>
                <div className="font-mono text-2xl font-black text-[#172C3B]">
                  {order.origin}
                </div>
                <div className="text-xs text-zinc-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#BD9472]" />
                  <span>Ida: {order.departureDate}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-full h-[2px] bg-[#BD9472]/50 relative flex items-center justify-center">
                  <Plane className="w-4 h-4 text-[#172C3B] bg-[#FAF8F5] px-0.5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-[#BD9472] mt-1.5">
                  Passagem Aérea Emitida
                </span>
              </div>

              <div className="sm:text-right">
                <div className="text-[11px] uppercase font-bold text-zinc-400">
                  Destino do Show / Viagem
                </div>
                <div className="font-mono text-2xl font-black text-[#172C3B]">
                  {order.destination}
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  {order.returnDate ? `Volta: ${order.returnDate}` : "Somente Ida"}
                </div>
              </div>
            </div>
          </div>

          {/* Lista Nominal de Passageiros (ANAC / Cia Aérea) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#172C3B]">
              <UserCheck className="w-4 h-4 text-[#BD9472]" />
              <span>Passageiros Identificados no Bilhete</span>
            </div>

            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-600 border-b border-zinc-200">
                    <th className="py-2 px-3">Categoria</th>
                    <th className="py-2 px-3">Nome Completo (Conforme Documento)</th>
                    <th className="py-2 px-3">CPF / Passaporte</th>
                    <th className="py-2 px-3">Data Nasc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {passengersList.map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-[#172C3B]">
                        {p.typeLabel}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#09090B]">
                        {p.fullName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">
                        {p.documentCpfOrPassport}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-600">
                        {p.birthDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo Financeiro e Economia */}
          <div className="rounded-2xl bg-[#172C3B] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-[#BD9472] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Recibo de Pagamento ({order.paymentMethod || "PIX"})</span>
              </div>
              <div className="text-xs text-[#E8E2D9]/80">
                Responsável: {order.customerName} ({order.userEmail})
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold">
                Valor na Cia Aérea:{" "}
                <span className="line-through">
                  {formatBRL(order.airlineDirectReferencePrice)}
                </span>{" "}
                • Economia gerada: {formatBRL(order.savingsAmount)}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-[11px] uppercase text-[#E8E2D9]/70">
                Valor Total Pago na Sing
              </div>
              <div className="font-mono text-2xl font-black text-[#BD9472]">
                {formatBRL(order.singTotalPrice)}
              </div>
            </div>
          </div>

          {/* Botões de Ação (Imprimir / Fechar) */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-xs hover:bg-zinc-100 transition"
            >
              <X className="w-4 h-4" />
              <span>Fechar</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BD9472] text-[#0E1B24] font-extrabold text-xs hover:bg-[#D4AF8E] transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar Voucher em PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
