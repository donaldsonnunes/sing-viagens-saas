"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  History,
  ShoppingBag,
  RotateCcw,
  Plane,
  CheckCircle2,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function ContaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState("cliente@singviagens.com.br");
  const [password, setPassword] = useState("123456");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState("");

  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const loadAccountData = async (targetEmail: string) => {
    const res = await fetch(`/api/account?email=${encodeURIComponent(targetEmail)}`);
    const data = await res.json();
    if (data.searchHistory) setSearchHistory(data.searchHistory);
    if (data.orders) setOrders(data.orders);
  };

  useEffect(() => {
    const saved = localStorage.getItem("sing_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        loadAccountData(parsed.email);
      } catch {
        setUser(null);
      }
    } else {
      loadAccountData("cliente@singviagens.com.br");
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: authMode,
        email,
        password,
        name,
        phone,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setAuthError(data.error || "Falha na autenticação.");
      return;
    }
    localStorage.setItem("sing_user", JSON.stringify(data.user));
    setUser(data.user);
    loadAccountData(data.user.email);
  };

  const handleLogout = () => {
    localStorage.removeItem("sing_user");
    setUser(null);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-12 border-b border-[#BD9472]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Sparkles className="w-4 h-4" />
              <span>Portal do Viajante Sing</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Login, Histórico de Pesquisas e Minhas Compras
            </h1>
          </div>
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition self-start"
            >
              <LogOut className="w-4 h-4 text-[#BD9472]" />
              <span>Sair da Conta ({user.name})</span>
            </button>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Card de Login / Status do Usuário */}
        <div className="lg:col-span-4">
          {user ? (
            <div className="rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-6 border border-[#BD9472]/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#BD9472] text-[#0E1B24] flex items-center justify-center font-black text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs text-[#BD9472] font-bold uppercase">
                    Conta Conectada
                  </div>
                  <div className="text-lg font-extrabold text-white">{user.name}</div>
                  <div className="text-xs text-[#E8E2D9]/75">{user.email}</div>
                </div>
              </div>
              <p className="text-xs text-[#E8E2D9]/80 leading-relaxed pt-2 border-t border-white/10">
                Todas as suas pesquisas de passagens e cotações com menores de idade ficam salvas abaixo para você retomar com apenas 1 clique.
              </p>
              <Link
                href="/pesquisa"
                className="w-full block text-center py-3 rounded-xl bg-[#BD9472] text-[#0E1B24] font-bold text-xs hover:bg-[#D4AF8E] transition"
              >
                Nova Pesquisa de Passagens
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-5">
              <div className="flex gap-2 p-1 rounded-xl bg-gray-100">
                <button
                  type="button"
                  onClick={() => setAuthMode("LOGIN")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    authMode === "LOGIN"
                      ? "bg-[#172C3B] text-white"
                      : "text-gray-600"
                  }`}
                >
                  Entrar (Login)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("REGISTER")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    authMode === "REGISTER"
                      ? "bg-[#172C3B] text-white"
                      : "text-gray-600"
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === "REGISTER" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#172C3B] mb-1">
                        Seu Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Rodrigo Almeida"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172C3B] mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#172C3B] mb-1">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172C3B] mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-xs sm:text-sm hover:bg-[#BD9472] hover:text-[#0E1B24] transition"
                >
                  {authMode === "LOGIN"
                    ? "Acessar Meu Histórico e Compras"
                    : "Cadastrar e Acessar Conta"}
                </button>

                <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <strong>Acesso Rápido Demo já preenchido:</strong>
                  <br />
                  Cliente: <code>cliente@singviagens.com.br</code> / Senha: <code>123456</code>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Coluna Direita: Histórico de Pesquisas Recentes + Histórico de Compras */}
        <div className="lg:col-span-8 space-y-8">
          {/* Histórico de Pesquisas para Retornar com 1 Clique */}
          <div className="rounded-2xl bg-white border border-gray-200 p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#172C3B] flex items-center gap-2">
                <History className="w-5 h-5 text-[#BD9472]" />
                <span>Histórico de Pesquisas Recentes (Retome com 1 Clique)</span>
              </h2>
              <span className="text-xs text-gray-500">
                {searchHistory.length} buscas salvas
              </span>
            </div>

            <div className="space-y-3">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-[#172C3B] text-[#BD9472]">
                        {item.origin} → {item.destination}
                      </span>
                      <span className="text-xs font-semibold text-[#172C3B]">
                        Ida: {item.departureDate}
                        {item.returnDate ? ` • Volta: ${item.returnDate}` : ""}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Viajantes: {item.adults} Adulto(s)
                      {item.childrenAges?.length > 0
                        ? `, ${item.childrenAges.length} Menor(es) [Idades: ${item.childrenAges.join(
                            ", "
                          )} anos]`
                        : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Menor Preço Sing</div>
                      <div className="text-sm font-extrabold text-[#172C3B]">
                        R$ {Number(item.lowestSingPrice).toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-gray-400 line-through">
                        Cia: R$ {Number(item.lowestAirlineDirectPrice).toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/pesquisa?origin=${item.origin}&destination=${item.destination}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#BD9472] text-[#0E1B24] font-bold text-xs hover:bg-[#D4AF8E] transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Repetir Busca</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Compras e Reservas Emitidas */}
          <div className="rounded-2xl bg-white border border-gray-200 p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-[#172C3B] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#BD9472]" />
              <span>Histórico de Compras e Bilhetes Emitidos (PNR)</span>
            </h2>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-[#172C3B] text-[#E8E2D9] border border-[#BD9472]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#BD9472] text-[#0E1B24] font-mono font-bold text-xs">
                        Localizador PNR: {ord.pnr}
                      </span>
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {ord.origin} → {ord.destination} • {ord.airline} ({ord.flightCode})
                    </div>
                    <div className="text-xs text-[#E8E2D9]/75">
                      Embarque: {ord.departureDate} • {ord.passengersSummary} • Pagamento:{" "}
                      {ord.paymentMethod}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-lg font-black text-[#BD9472]">
                      R$ {Number(ord.singTotalPrice).toLocaleString("pt-BR")}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-semibold">
                      Economia gerada: R$ {Number(ord.savingsAmount).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
