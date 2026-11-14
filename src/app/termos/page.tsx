import React from "react";
import { FileText } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-14 border-b border-[#BD9472]/30">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <FileText className="w-4 h-4" />
            <span>Regras Claras de Prestação de Serviço</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Termos de Uso, Reembolso e Cancelamento
          </h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-white border border-gray-200 p-8 space-y-5 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-bold text-[#172C3B]">
            1. Transparência Tarifária e Comparativo com Cias Aéreas
          </h2>
          <p>
            Os valores apresentados na coluna Sing Viagens contemplam a tarifa aérea negociada, as taxas de embarque oficiais e a remuneração de intermediação parametrizada. Os valores exibidos na coluna lateral das companhias aéreas refletem a cotação pública de referência do mesmo voo no momento da consulta.
          </p>

          <h2 className="text-lg font-bold text-[#172C3B]">
            2. Direito de Arrependimento 24h (Resolução ANAC nº 400)
          </h2>
          <p>
            O passageiro poderá desistir da passagem aérea adquirida, sem qualquer ônus, desde que o faça no prazo de até 24 (vinte e quatro) horas a contar do recebimento do comprovante de emissão, aplicando-se às compras realizadas com antecedência igual ou superior a 7 (sete) dias em relação à data de embarque.
          </p>

          <h2 className="text-lg font-bold text-[#172C3B]">
            3. Remarcações e Cancelamentos Pós-24h
          </h2>
          <p>
            Após o prazo de 24 horas, eventuais solicitações de alteração de data, horário ou reembolso seguem o perfil tarifário (Light, Standard, Plus ou Executiva) do bilhete emitido junto à companhia aérea operadora, contando sempre com a assistência integral do suporte Sing Viagens.
          </p>
        </div>
      </section>
    </div>
  );
}
