import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-14 border-b border-[#BD9472]/30">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <ShieldCheck className="w-4 h-4" />
            <span>Adequação Integral à LGPD (Lei nº 13.709/2018)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Política de Privacidade e Proteção de Dados
          </h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-white border border-gray-200 p-8 space-y-5 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-bold text-[#172C3B]">
            1. Coleta e Finalidade dos Dados Pessoais
          </h2>
          <p>
            A <strong>Sing Viagens e Turismo</strong> coleta apenas os dados estritamente necessários para cotação, emissão de bilhetes aéreos junto às companhias (IATA/ANAC), reservas hoteleiras e manutenção do histórico de pesquisas e compras na Área do Cliente.
          </p>

          <h2 className="text-lg font-bold text-[#172C3B]">
            2. Dados de Menores de Idade em Emissões Aéreas
          </h2>
          <p>
            O tratamento de dados de crianças e adolescentes (como idade na data do voo e documento de identificação para embarque) é realizado exclusivamente mediante consentimento expresso dos pais ou responsáveis legais durante a pesquisa e checkout, em conformidade com o Art. 14 da LGPD e normas do CNJ/ANAC.
          </p>

          <h2 className="text-lg font-bold text-[#172C3B]">
            3. Direitos do Titular e Canal do Encarregado (DPO)
          </h2>
          <p>
            Você pode consultar, exportar ou solicitar a exclusão do seu histórico de pesquisas a qualquer momento em sua conta ou pelo e-mail <strong>privacidade@singviagens.com.br</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}
