"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TicketVoucherModal } from "@/components/TicketVoucherModal";
import { MonthlyComparisonChart } from "@/components/MonthlyComparisonChart";
import {
  isValidCpf,
  validatePassportWithExpiry,
} from "@/lib/documentValidation";
import {
  History,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  LogOut,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  X,
  FileText,
  Users,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

const SUPABASE_PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lbbjgxvbjbsoaglsccun.supabase.co";

function GoogleLogoSvg() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

function AppleLogoSvg() {
  return (
    <svg
      className="w-4 h-4 shrink-0 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export default function ContaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regBirthDate, setRegBirthDate] = useState("");
  const [regCpf, setRegCpf] = useState("");
  const [regPassport, setRegPassport] = useState("");
  const [regPassportExpiry, setRegPassportExpiry] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Estado de Validação / Confirmação de E-mail no Cadastro
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [verificationCodeHint, setVerificationCodeHint] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  // Modal de Login Social (Google / Apple ID)
  const [socialModalProvider, setSocialModalProvider] = useState<
    "GOOGLE" | "APPLE" | null
  >(null);
  const [socialEmail, setSocialEmail] = useState("donaldson.nunes@gmail.com");
  const [socialFirstName, setSocialFirstName] = useState("Donaldson");
  const [socialLastName, setSocialLastName] = useState("Nunes");
  const [socialBirthDate, setSocialBirthDate] = useState("1985-04-12");
  const [socialCpf, setSocialCpf] = useState("284.910.378-02");
  const [socialPhone, setSocialPhone] = useState("(11) 99999-0000");
  const [socialPassport, setSocialPassport] = useState("FP892341");
  const [socialPassportExpiry, setSocialPassportExpiry] = useState("2032-06-15");

  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [frequentPassengers, setFrequentPassengers] = useState<any[]>([]);
  const [selectedVoucherOrder, setSelectedVoucherOrder] = useState<any>(null);

  // Estado do formulário de Passageiros Frequentes (Sem limites por conta)
  const [editingPaxId, setEditingPaxId] = useState<string | null>(null);
  const [paxFirstName, setPaxFirstName] = useState("");
  const [paxLastName, setPaxLastName] = useState("");
  const [paxBirthDate, setPaxBirthDate] = useState("");
  const [paxCpf, setPaxCpf] = useState("");
  const [paxEmail, setPaxEmail] = useState("");
  const [paxPhone, setPaxPhone] = useState("");
  const [paxPassport, setPaxPassport] = useState("");
  const [paxPassportExpiry, setPaxPassportExpiry] = useState("");
  const [savingPax, setSavingPax] = useState(false);
  const [paxSuccessMsg, setPaxSuccessMsg] = useState("");
  const [paxErrorMsg, setPaxErrorMsg] = useState("");
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  const saveSessionAndNotify = (loggedUser: any, explicitRedirect?: string | null) => {
    localStorage.setItem("sing_user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sing-auth-change"));
    }
    loadAccountData(loggedUser.email);
    const nextPath =
      explicitRedirect ??
      redirectTarget ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect")
        : null);
    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      router.push(nextPath);
    }
  };

  const loadAccountData = async (targetEmail: string) => {
    const res = await fetch(`/api/account?email=${encodeURIComponent(targetEmail)}`);
    const data = await res.json();
    if (data.searchHistory) setSearchHistory(data.searchHistory);
    if (data.orders) setOrders(data.orders);
    if (data.frequentPassengers) setFrequentPassengers(data.frequentPassengers);
  };

  const resetPaxForm = () => {
    setEditingPaxId(null);
    setPaxFirstName("");
    setPaxLastName("");
    setPaxBirthDate("");
    setPaxCpf("");
    setPaxEmail("");
    setPaxPhone("");
    setPaxPassport("");
    setPaxPassportExpiry("");
    setPaxErrorMsg("");
  };

  const handleSaveFrequentPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaxErrorMsg("");
    setPaxSuccessMsg("");
    if (!paxFirstName.trim() || !paxLastName.trim() || !paxBirthDate || !paxCpf.trim()) {
      setPaxErrorMsg("Preencha Nome, Sobrenome, Data de Nascimento e CPF.");
      return;
    }
    if (!isValidCpf(paxCpf)) {
      setPaxErrorMsg(
        "CPF inválido. Informe um CPF válido (para testes, dígitos repetidos como 111.111.111-11 são aceitos)."
      );
      return;
    }
    const passportCheck = validatePassportWithExpiry(paxPassport, paxPassportExpiry);
    if (!passportCheck.valid) {
      setPaxErrorMsg(passportCheck.error || "Data de vencimento do passaporte inválida.");
      return;
    }
    setSavingPax(true);
    try {
      const targetEmail = user?.email || "donaldson.nunes@gmail.com";
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_FREQUENT_PASSENGER",
          id: editingPaxId || undefined,
          userEmail: targetEmail,
          firstName: paxFirstName,
          lastName: paxLastName,
          birthDate: paxBirthDate,
          cpf: paxCpf,
          email: paxEmail,
          phone: paxPhone,
          passport: paxPassport,
          passportExpiry: paxPassport.trim() ? paxPassportExpiry : "",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPaxErrorMsg(data.error || "Não foi possível salvar o passageiro.");
        return;
      }
      if (data.frequentPassengers) {
        setFrequentPassengers(data.frequentPassengers);
        resetPaxForm();
        setPaxSuccessMsg(
          editingPaxId
            ? "Dados do passageiro frequente atualizados com sucesso!"
            : "Novo passageiro frequente salvo na sua conta!"
        );
        setTimeout(() => setPaxSuccessMsg(""), 3500);
      }
    } finally {
      setSavingPax(false);
    }
  };

  const handleEditPassenger = (pax: any) => {
    setEditingPaxId(pax.id);
    setPaxFirstName(pax.firstName || "");
    setPaxLastName(pax.lastName || "");
    setPaxBirthDate(pax.birthDate || "");
    setPaxCpf(pax.cpf || "");
    setPaxEmail(pax.email || "");
    setPaxPhone(pax.phone || "");
    setPaxPassport(pax.passport || "");
    setPaxPassportExpiry(pax.passportExpiry || "");
    setPaxErrorMsg("");
  };

  const handleDeletePassenger = async (passengerId: string) => {
    const targetEmail = user?.email || "donaldson.nunes@gmail.com";
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "DELETE_FREQUENT_PASSENGER",
        userEmail: targetEmail,
        passengerId,
      }),
    });
    const data = await res.json();
    if (data.frequentPassengers) {
      setFrequentPassengers(data.frequentPassengers);
      if (editingPaxId === passengerId) resetPaxForm();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const spInit = new URLSearchParams(window.location.search);
      const redir = spInit.get("redirect");
      const modeParam = spInit.get("mode");
      if (redir && redir.startsWith("/") && !redir.startsWith("//")) {
        setRedirectTarget(redir);
      }
      if (modeParam === "register") {
        setAuthMode("REGISTER");
      }
    }

    // 1A. Verifica se clicou no Link de Confirmação enviado por E-mail (?confirm_email=...&code=...)
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("confirm_email=")
    ) {
      const sp = new URLSearchParams(window.location.search);
      const confirmEmail = sp.get("confirm_email");
      const confirmCode = sp.get("code");
      if (confirmEmail && confirmCode) {
        fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "VERIFY_EMAIL",
            email: confirmEmail,
            code: confirmCode,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.verified && data.user) {
              setPendingVerificationEmail(null);
              saveSessionAndNotify(data.user);
              window.history.replaceState(null, "", window.location.pathname);
            }
          });
        return;
      }
    }

    // 1B. Verifica se retornou de um fluxo OAuth / Link de Confirmação do Supabase (#access_token=...)
    if (typeof window !== "undefined" && window.location.hash.includes("access_token=")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SUPABASE_TOKEN_SYNC",
            accessToken,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.user) {
              saveSessionAndNotify(data.user);
              window.history.replaceState(null, "", window.location.pathname);
            }
          });
        return;
      }
    }

    // 2. Verifica sessão salva localmente (só carrega dados se o usuário estiver logado)
    const saved = localStorage.getItem("sing_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          setUser(parsed);
          loadAccountData(parsed.email);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
      setSearchHistory([]);
      setOrders([]);
      setFrequentPassengers([]);
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setVerificationNotice("");
    if (authMode === "REGISTER") {
      if (!isValidCpf(regCpf)) {
        setAuthError(
          "CPF inválido. Informe um CPF válido (para testes internos, dígitos repetidos como 111.111.111-11 são aceitos)."
        );
        return;
      }
      const passportCheck = validatePassportWithExpiry(
        regPassport,
        regPassportExpiry
      );
      if (!passportCheck.valid) {
        setAuthError(
          passportCheck.error || "Informe a data de vencimento do passaporte."
        );
        return;
      }
    }
    setLoadingAuth(true);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode,
          email,
          password,
          name: `${regFirstName} ${regLastName}`.trim(),
          firstName: regFirstName,
          lastName: regLastName,
          birthDate: regBirthDate,
          cpf: regCpf,
          passport: regPassport,
          passportExpiry: regPassport.trim() ? regPassportExpiry : "",
          phone,
        }),
      });
      const data = await res.json();

      if (data.requiresEmailConfirmation) {
        setPendingVerificationEmail(data.email || email);
        setVerificationCodeHint(data.verificationCodeHint || "");
        setVerificationNotice(
          data.message ||
            data.error ||
            `Enviamos um link/código de confirmação para ${
              data.email || email
            }. Confirme seu e-mail para ativar sua conta.`
        );
        return;
      }

      if (!res.ok || data.error) {
        setAuthError(data.error || "Falha na autenticação.");
        return;
      }
      saveSessionAndNotify(data.user);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingVerificationEmail) return;
    setAuthError("");
    setLoadingAuth(true);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_EMAIL",
          email: pendingVerificationEmail,
          code: verificationCodeInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Código de confirmação inválido.");
        return;
      }
      if (data.verified && data.user) {
        setPendingVerificationEmail(null);
        setVerificationCodeInput("");
        setVerificationNotice("");
        saveSessionAndNotify(data.user);
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!pendingVerificationEmail) return;
    setResendingEmail(true);
    setAuthError("");
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESEND_VERIFICATION_EMAIL",
          email: pendingVerificationEmail,
        }),
      });
      const data = await res.json();
      if (data.verificationCodeHint) {
        setVerificationCodeHint(data.verificationCodeHint);
      }
      if (data.message) {
        setVerificationNotice(data.message);
      }
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSocialLoginConfirm = async (
    provider: "GOOGLE" | "APPLE",
    targetEmail: string,
    targetFirstName: string,
    targetLastName: string,
    targetBirthDate?: string,
    targetCpf?: string,
    targetPhone?: string,
    targetPassport?: string,
    targetPassportExpiry?: string
  ) => {
    setAuthError("");
    if (targetCpf && !isValidCpf(targetCpf)) {
      setAuthError(
        "CPF inválido. Informe um CPF válido (para testes internos, dígitos repetidos são aceitos)."
      );
      return;
    }
    const socialPassportCheck = validatePassportWithExpiry(
      targetPassport,
      targetPassportExpiry
    );
    if (!socialPassportCheck.valid) {
      setAuthError(
        socialPassportCheck.error || "Informe a data de vencimento do passaporte."
      );
      return;
    }
    setLoadingAuth(true);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SOCIAL_AUTH",
          provider,
          email: targetEmail,
          name: `${targetFirstName} ${targetLastName}`.trim(),
          firstName: targetFirstName,
          lastName: targetLastName,
          birthDate: targetBirthDate || "",
          cpf: targetCpf || "",
          phone: targetPhone || "",
          passport: targetPassport || "",
          passportExpiry: targetPassport?.trim() ? targetPassportExpiry || "" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Não foi possível autenticar.");
        return;
      }
      setSocialModalProvider(null);
      saveSessionAndNotify(data.user);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sing_user");
    setUser(null);
    setSearchHistory([]);
    setOrders([]);
    setFrequentPassengers([]);
    setSelectedVoucherOrder(null);
    resetPaxForm();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sing-auth-change"));
    }
  };

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.email?.toLowerCase() === "donaldson.nunes@gmail.com";

  // Cálculos do Dashboard do Usuário (Apenas Passagens Confirmadas para Economia Real)
  const confirmedOrders = orders.filter((o) => o.status !== "CANCELADO");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELADO");

  const totalSingSpent = confirmedOrders.reduce(
    (acc, o) => acc + Number(o.singTotalPrice || 0),
    0
  );
  const totalAirlineDirectCost = confirmedOrders.reduce((acc, o) => {
    const ref = Number(o.airlineDirectReferencePrice || 0);
    const paid = Number(o.singTotalPrice || 0);
    const sav = Number(o.savingsAmount || 0);
    return acc + (ref < paid && sav > 0 ? paid + sav : ref);
  }, 0);
  const totalSavedAmount = Math.max(0, totalAirlineDirectCost - totalSingSpent);
  const savingsPercentage =
    totalAirlineDirectCost > 0
      ? Math.round((totalSavedAmount / totalAirlineDirectCost) * 100)
      : 0;
  const singCostRatioPercent =
    totalAirlineDirectCost > 0
      ? Math.min(100, Math.round((totalSingSpent / totalAirlineDirectCost) * 100))
      : 80;

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleToggleOrderStatus = async (
    orderId: string,
    newStatus: "CONFIRMADO" | "CANCELADO"
  ) => {
    await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_ORDER_STATUS",
        orderId,
        status: newStatus,
      }),
    });
    loadAccountData(user?.email || "donaldson.nunes@gmail.com");
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-12 border-b border-[#BD9472]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
              <Sparkles className="w-4 h-4" />
              <span>Portal de Acesso Sing Viagens</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Minha Conta, Login Social e Histórico de Viagens
            </h1>
          </div>
          {user && (
            <div className="flex flex-wrap items-center gap-2.5">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BD9472] text-[#0E1B24] text-xs font-extrabold hover:bg-[#D4AF8E] transition shadow"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Painel do Administrador</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <LogOut className="w-4 h-4 text-[#BD9472]" />
                <span>Sair ({user.name.split(" ")[0]})</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Card de Login / Cadastro / Perfil */}
        <div className="lg:col-span-4">
          {user ? (
            <div className="rounded-2xl bg-[#172C3B] text-[#E8E2D9] p-6 border border-[#BD9472]/40 space-y-5 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#BD9472] text-[#0E1B24] flex items-center justify-center font-black text-xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#BD9472] font-bold uppercase tracking-wider">
                      {isAdmin ? "Administrador Master" : "Conta Verificada"}
                    </span>
                    {user.authProvider && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white">
                        via {user.authProvider}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-extrabold text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-[#E8E2D9]/75 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="rounded-xl bg-[#BD9472]/15 border border-[#BD9472]/45 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#BD9472]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Acesso de Administrador Ativo</span>
                  </div>
                  <p className="text-[11px] text-[#E8E2D9]/85 leading-relaxed">
                    Seu e-mail (<strong>{user.email}</strong>) possui permissão total para gerenciar o valor do milheiro por companhia aérea e a margem de lucro.
                  </p>
                  <Link
                    href="/admin"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#BD9472] text-[#0E1B24] font-extrabold text-xs hover:bg-[#D4AF8E] transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Abrir Painel Admin de Precificação</span>
                  </Link>
                </div>
              )}

              <p className="text-xs text-[#E8E2D9]/80 leading-relaxed pt-2 border-t border-white/10">
                Suas pesquisas de passagens e emissões ficam salvas no Supabase em tempo real para você retomar com 1 clique.
              </p>

              <Link
                href="/pesquisa"
                className="w-full block text-center py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition border border-white/15"
              >
                Buscar Passagens Aéreas
              </Link>
            </div>
          ) : pendingVerificationEmail ? (
            <div className="rounded-2xl bg-white border-2 border-[#BD9472] p-6 shadow-lg space-y-5 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#172C3B] text-[#BD9472] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#BD9472] font-bold">
                    Validação de Segurança
                  </span>
                  <h3 className="text-base font-extrabold text-[#172C3B]">
                    Confirme seu E-mail para Ativar a Conta
                  </h3>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200 text-xs text-gray-700 leading-relaxed space-y-2">
                <p>
                  {verificationNotice ||
                    `Enviamos um link e código de confirmação para ${pendingVerificationEmail}.`}
                </p>
                <p className="text-[11px] text-gray-500">
                  Verifique sua caixa de entrada (e a pasta Spam) e clique no link de confirmação enviado pelo Supabase ou informe o código de 6 dígitos abaixo.
                </p>
                {verificationCodeHint && (
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#172C3B]">
                      Código gerado para{" "}
                      <span className="font-mono">{pendingVerificationEmail}</span>:
                    </span>
                    <button
                      type="button"
                      onClick={() => setVerificationCodeInput(verificationCodeHint)}
                      className="px-2.5 py-1 rounded-lg bg-[#172C3B] text-[#BD9472] font-mono font-bold text-xs hover:opacity-90"
                      title="Preencher código de confirmação"
                    >
                      {verificationCodeHint} (Usar código)
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172C3B] mb-1">
                    Código de Confirmação (6 dígitos)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value)}
                    placeholder="000000"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-center font-mono text-base font-extrabold tracking-widest text-[#09090B]"
                  />
                </div>

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-3 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-extrabold text-xs sm:text-sm hover:bg-[#BD9472] hover:text-[#0E1B24] transition shadow-sm"
                >
                  {loadingAuth
                    ? "Validando E-mail..."
                    : "Confirmar E-mail e Acessar Minha Conta"}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  disabled={resendingEmail}
                  onClick={handleResendVerificationEmail}
                  className="font-bold text-[#172C3B] hover:text-[#BD9472] transition"
                >
                  {resendingEmail
                    ? "Reenviando e-mail..."
                    : "Reenviar E-mail de Confirmação"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingVerificationEmail(null);
                    setAuthError("");
                  }}
                  className="text-gray-500 hover:text-gray-800 font-semibold"
                >
                  Voltar ao Login
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-md space-y-5">
              {redirectTarget === "/checkout" && (
                <div className="p-3.5 rounded-xl bg-[#172C3B] text-[#E8E2D9] border border-[#BD9472]/50 text-xs space-y-1">
                  <div className="font-extrabold text-[#BD9472]">
                    Sua seleção de voos está salva!
                  </div>
                  <p>
                    Entre na sua conta ou crie seu cadastro abaixo para continuar para os dados dos passageiros sem perder sua pesquisa.
                  </p>
                </div>
              )}

              {/* Botões de Login Social: Google e Apple ID */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#172C3B] uppercase tracking-wider">
                  Acesso Rápido com 1 Clique
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSocialModalProvider("GOOGLE");
                    setAuthError("");
                    setSocialEmail("donaldson.nunes@gmail.com");
                    setSocialFirstName("Donaldson");
                    setSocialLastName("Nunes");
                    setSocialBirthDate("1985-04-12");
                    setSocialCpf("284.910.378-02");
                    setSocialPhone("(11) 99999-0000");
                    setSocialPassport("FP892341");
                    setSocialPassportExpiry("2032-06-15");
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-gray-300 hover:border-[#172C3B] hover:bg-gray-50 text-[#09090B] font-bold text-xs sm:text-sm transition shadow-2xs"
                >
                  <GoogleLogoSvg />
                  <span>Continuar com Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSocialModalProvider("APPLE");
                    setAuthError("");
                    setSocialEmail("donaldson.nunes@gmail.com");
                    setSocialFirstName("Donaldson");
                    setSocialLastName("Nunes");
                    setSocialBirthDate("1985-04-12");
                    setSocialCpf("284.910.378-02");
                    setSocialPhone("(11) 99999-0000");
                    setSocialPassport("FP892341");
                    setSocialPassportExpiry("2032-06-15");
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#09090B] hover:bg-[#172C3B] text-white font-bold text-xs sm:text-sm transition shadow-2xs"
                >
                  <AppleLogoSvg />
                  <span>Continuar com ID Apple</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-3 text-[11px] font-medium text-gray-400 uppercase">
                  ou use seu e-mail
                </span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* Abas Login / Criar Conta */}
              <div className="flex gap-2 p-1 rounded-xl bg-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("LOGIN");
                    setAuthError("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    authMode === "LOGIN"
                      ? "bg-[#172C3B] text-white shadow-xs"
                      : "text-gray-600"
                  }`}
                >
                  Entrar (Login)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("REGISTER");
                    setAuthError("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    authMode === "REGISTER"
                      ? "bg-[#172C3B] text-white shadow-xs"
                      : "text-gray-600"
                  }`}
                >
                  Criar Conta + Passageiro
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === "REGISTER" && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#BD9472]/40">
                    <div className="text-[11px] font-bold text-[#172C3B] leading-snug">
                      Seus dados abaixo já serão replicados automaticamente para o seu cadastro de{" "}
                      <span className="text-[#BD9472]">Passageiro Frequente</span>:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          required
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          placeholder="Ex: José"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                          Sobrenome *
                        </label>
                        <input
                          type="text"
                          required
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          placeholder="Ex: Silva"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                          Data de Nascimento *
                        </label>
                        <input
                          type="date"
                          required
                          value={regBirthDate}
                          onChange={(e) => setRegBirthDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-xs font-mono text-[#09090B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                          CPF *
                        </label>
                        <input
                          type="text"
                          required
                          value={regCpf}
                          onChange={(e) => setRegCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-[#09090B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Celular{" "}
                          <span className="font-normal text-gray-400">
                            (opcional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Passaporte{" "}
                          <span className="font-normal text-gray-400">
                            (opcional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={regPassport}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setRegPassport(val);
                            if (!val.trim()) setRegPassportExpiry("");
                          }}
                          placeholder="Ex: FP123456"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-[#09090B]"
                        />
                      </div>

                      {regPassport.trim() !== "" && (
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Data de Vencimento do Passaporte *
                          </label>
                          <input
                            type="date"
                            required
                            value={regPassportExpiry}
                            onChange={(e) => setRegPassportExpiry(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#172C3B] mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-sm text-[#09090B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172C3B] mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-sm text-[#09090B]"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-3 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-bold text-xs sm:text-sm hover:bg-[#BD9472] hover:text-[#0E1B24] transition shadow-sm"
                >
                  {loadingAuth
                    ? "Autenticando..."
                    : authMode === "LOGIN"
                    ? "Entrar na Minha Conta"
                    : "Criar Minha Conta"}
                </button>

                {/* Atalhos Rápidos de Teste (Admin Donaldson vs Cliente) */}
                <div className="text-[11px] text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-[#172C3B]">
                    Atalhos Rápidos de Acesso:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("LOGIN");
                        setEmail("donaldson.nunes@gmail.com");
                        setPassword("sing2026");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#172C3B] text-[#BD9472] font-bold text-[10px] hover:opacity-90"
                    >
                      Admin: donaldson.nunes@gmail.com
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("LOGIN");
                        setEmail("cliente@singviagens.com.br");
                        setPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-800 font-semibold text-[10px] hover:bg-gray-300"
                    >
                      Cliente Demo
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Coluna Direita: Visível EXCLUSIVAMENTE para o usuário logado */}
        <div className="lg:col-span-8 space-y-8">
          {user ? (
            <>
              {/* DASHBOARD DO USUÁRIO: Pesquisas, Passagens, Cia x Sing e Economia */}
              <div className="rounded-2xl bg-[#09090B] text-white p-6 sm:p-7 border border-[#BD9472]/35 shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#BD9472]">
                  Dashboard do Viajante Sing
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  Resumo das Suas Viagens e Economia Acumulada
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-xs font-bold">
                Economia média de {savingsPercentage}% nas emissões
              </span>
            </div>

            {/* 4 Cards de Indicadores do Usuário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="text-[11px] text-zinc-400 font-medium">
                  Pesquisas Realizadas
                </div>
                <div className="font-mono text-2xl font-extrabold text-white mt-1">
                  {searchHistory.length}
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  Cotações salvas na conta
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="text-[11px] text-zinc-400 font-medium">
                  Passagens Adquiridas
                </div>
                <div className="font-mono text-2xl font-extrabold text-[#BD9472] mt-1">
                  {confirmedOrders.length}
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  {cancelledOrders.length > 0
                    ? `${cancelledOrders.length} cancelada(s)`
                    : "100% ativas e confirmadas"}
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="text-[11px] text-zinc-400 font-medium">
                  Custo Cia Aérea vs. Sing
                </div>
                <div className="font-mono text-base font-extrabold text-white mt-1">
                  {formatBRL(totalSingSpent)}
                </div>
                <div className="font-mono text-[11px] text-zinc-400 line-through mt-0.5">
                  Cia: {formatBRL(totalAirlineDirectCost)}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-4">
                <div className="text-[11px] text-emerald-300 font-bold">
                  Valor Total Economizado
                </div>
                <div className="font-mono text-xl font-black text-emerald-300 mt-1">
                  {formatBRL(totalSavedAmount)}
                </div>
                <div className="text-[10px] text-emerald-200/80 mt-1">
                  Economia direta no seu bolso
                </div>
              </div>
            </div>

            {/* Barra Comparativa Visual: Custo via Cia Aérea vs. Custo via Sing */}
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-zinc-300">
                  Comparativo Acumulado: Compra Direta nas Cias vs. Emissão Inteligente Sing
                </span>
                <span className="font-mono text-emerald-300 font-bold">
                  Você pagou {singCostRatioPercent}% do valor cobrado pelas Cias
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Custo se comprasse direto nas Companhias Aéreas</span>
                    <span className="font-mono font-bold text-zinc-300">
                      {formatBRL(totalAirlineDirectCost)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-zinc-500 rounded-full w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#BD9472] mb-1">
                    <span className="font-bold">
                      Custo pago via Sing Viagens (Economia de {formatBRL(totalSavedAmount)})
                    </span>
                    <span className="font-mono font-bold text-[#BD9472]">
                      {formatBRL(totalSingSpent)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#BD9472] to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${singCostRatioPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <MonthlyComparisonChart orders={orders} />
            </div>
          </div>

          {/* CADASTRO DE PASSAGEIROS FREQUENTES (Sem limites por conta) */}
          <div className="rounded-2xl bg-white border border-gray-200 p-7 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#172C3B] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#BD9472]" />
                  <span>Cadastro de Passageiros Frequentes (Sem Limites por Conta)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deixe seus passageiros salvos para selecionar com 1 clique na hora da compra de passagens aéreas.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#172C3B] text-[#BD9472] font-mono text-xs font-bold">
                {frequentPassengers.length}{" "}
                {frequentPassengers.length === 1
                  ? "passageiro cadastrado"
                  : "passageiros cadastrados"}
              </span>
            </div>

            {/* Formulário de Adição / Edição de Passageiro Frequente */}
            <form
              onSubmit={handleSaveFrequentPassenger}
              className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#BD9472]/35 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold text-[#172C3B] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#BD9472]" />
                  <span>
                    {editingPaxId
                      ? "Editando Passageiro Frequente"
                      : "Adicionar Novo Passageiro Frequente"}
                  </span>
                </div>
                {editingPaxId && (
                  <button
                    type="button"
                    onClick={resetPaxForm}
                    className="text-xs font-bold text-gray-500 hover:text-[#172C3B]"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={paxFirstName}
                    onChange={(e) => setPaxFirstName(e.target.value)}
                    placeholder="Ex: José"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    required
                    value={paxLastName}
                    onChange={(e) => setPaxLastName(e.target.value)}
                    placeholder="Ex: Silva"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={paxBirthDate}
                    onChange={(e) => setPaxBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172C3B] mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={paxCpf}
                    onChange={(e) => setPaxCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    E-mail <span className="font-normal text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    value={paxEmail}
                    onChange={(e) => setPaxEmail(e.target.value)}
                    placeholder="passageiro@email.com"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Celular <span className="font-normal text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={paxPhone}
                    onChange={(e) => setPaxPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Passaporte <span className="font-normal text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={paxPassport}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setPaxPassport(val);
                      if (!val.trim()) setPaxPassportExpiry("");
                    }}
                    placeholder="Ex: FP123456"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-[#09090B]"
                  />
                </div>

                {paxPassport.trim() !== "" && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Vencimento do Passaporte *
                    </label>
                    <input
                      type="date"
                      required
                      value={paxPassportExpiry}
                      onChange={(e) => setPaxPassportExpiry(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-[#09090B]"
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={savingPax}
                    className="w-full py-2 px-4 rounded-xl bg-[#172C3B] text-[#E8E2D9] font-extrabold text-xs hover:bg-[#BD9472] hover:text-[#0E1B24] transition shadow-xs"
                  >
                    {savingPax
                      ? "Salvando..."
                      : editingPaxId
                      ? "Atualizar Passageiro"
                      : "+ Salvar Passageiro"}
                  </button>
                </div>
              </div>

              {paxErrorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {paxErrorMsg}
                </div>
              )}

              {paxSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{paxSuccessMsg}</span>
                </div>
              )}
            </form>

            {/* Lista de Passageiros Frequentes Salvos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {frequentPassengers.map((pax) => (
                <div
                  key={pax.id}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-200 flex items-start justify-between gap-3 hover:border-[#BD9472] transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-extrabold text-[#172C3B] truncate">
                      {pax.firstName} {pax.lastName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-600">
                      <span className="px-2 py-0.5 rounded bg-white border border-gray-200 font-bold text-[#09090B]">
                        CPF: {pax.cpf}
                      </span>
                      <span>Nasc: {pax.birthDate}</span>
                      {pax.passport && (
                        <span className="px-2 py-0.5 rounded bg-[#172C3B]/10 text-[#172C3B] font-bold">
                          Passaporte: {pax.passport}
                          {pax.passportExpiry ? ` (Venc: ${pax.passportExpiry})` : ""}
                        </span>
                      )}
                    </div>
                    {(pax.email || pax.phone) && (
                      <div className="text-[11px] text-gray-500 truncate">
                        {pax.email ? `${pax.email}` : ""}
                        {pax.email && pax.phone ? " • " : ""}
                        {pax.phone ? `${pax.phone}` : ""}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditPassenger(pax)}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-[#172C3B] hover:border-[#172C3B] transition"
                      title="Editar passageiro"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePassenger(pax.id)}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition"
                      title="Remover passageiro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#172C3B] flex items-center gap-2">
                <History className="w-5 h-5 text-[#BD9472]" />
                <span>Histórico de Pesquisas de Passagens (Retome com 1 Clique)</span>
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
                      Viajantes: {item.adults}{" "}
                      {item.adults === 1 ? "Adulto" : "Adultos"}
                      {item.childrenAges?.length > 0
                        ? `, ${item.childrenAges.length} ${
                            item.childrenAges.length === 1 ? "Criança" : "Crianças"
                          }`
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
                        Cia: R${" "}
                        {Number(item.lowestAirlineDirectPrice).toLocaleString("pt-BR")}
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

          <div className="rounded-2xl bg-white border border-gray-200 p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-[#172C3B] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#BD9472]" />
              <span>Histórico de Compras e Bilhetes Emitidos (PNR)</span>
            </h2>

            <div className="space-y-3">
              {orders.map((ord) => {
                const isCancelled = ord.status === "CANCELADO";
                return (
                  <div
                    key={ord.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCancelled
                        ? "bg-zinc-100 text-zinc-600 border-zinc-300"
                        : "bg-[#172C3B] text-[#E8E2D9] border-[#BD9472]/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                            isCancelled
                              ? "bg-zinc-300 text-zinc-800 line-through"
                              : "bg-[#BD9472] text-[#0E1B24]"
                          }`}
                        >
                          Localizador PNR: {ord.pnr}
                        </span>
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isCancelled ? "text-red-600" : "text-emerald-300"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ord.status}
                        </span>
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          isCancelled ? "text-zinc-700 line-through" : "text-white"
                        }`}
                      >
                        {ord.origin} → {ord.destination} • {ord.airline} ({ord.flightCode})
                      </div>
                      <div
                        className={`text-xs ${
                          isCancelled ? "text-zinc-500" : "text-[#E8E2D9]/75"
                        }`}
                      >
                        Embarque: {ord.departureDate} • {ord.passengersSummary} • Cia:{" "}
                        {formatBRL(Number(ord.airlineDirectReferencePrice))}
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1.5">
                      <div>
                        <div
                          className={`text-lg font-black ${
                            isCancelled ? "text-zinc-500 line-through" : "text-[#BD9472]"
                          }`}
                        >
                          {formatBRL(Number(ord.singTotalPrice))}
                        </div>
                        <div
                          className={`text-[11px] font-semibold ${
                            isCancelled ? "text-zinc-500" : "text-emerald-300"
                          }`}
                        >
                          Economia vs. Cia: {formatBRL(Number(ord.savingsAmount))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVoucherOrder(ord)}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#BD9472] text-[#0E1B24] hover:bg-[#D4AF8E] font-extrabold transition"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Voucher / PDF</span>
                        </button>
                        {!isCancelled ? (
                          <button
                            type="button"
                            onClick={() => handleToggleOrderStatus(ord.id, "CANCELADO")}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 font-semibold transition"
                          >
                            Cancelar Passagem
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleOrderStatus(ord.id, "CONFIRMADO")}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#172C3B] text-white hover:opacity-90 font-semibold transition"
                          >
                            Reativar Reserva
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-200 p-8 sm:p-10 shadow-sm text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#172C3B] text-[#BD9472] flex items-center justify-center mx-auto shadow">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#BD9472]">
                  Ambiente Privado e Protegido
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#172C3B]">
                  Faça Login para Acessar Seu Dashboard, Passageiros e Histórico
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Suas informações de <strong>Dashboard de Economia</strong>,{" "}
                  <strong>Passageiros Frequentes cadastrados</strong>,{" "}
                  <strong>Histórico de Pesquisas</strong> e{" "}
                  <strong>Bilhetes Emitidos (PNR)</strong> só ficam visíveis após a sua autenticação.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left max-w-2xl mx-auto">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200">
                  <div className="text-xs font-extrabold text-[#172C3B]">
                    1. Dashboard Pessoal
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Visualize sua economia acumulada comparando Cia Aérea vs. Sing.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200">
                  <div className="text-xs font-extrabold text-[#172C3B]">
                    2. Passageiros Frequentes
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Seus passageiros salvos sem limite por conta para compras em 1 clique.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200">
                  <div className="text-xs font-extrabold text-[#172C3B]">
                    3. Pesquisas & E-Tickets
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Retome pesquisas anteriores e baixe seus Vouchers oficiais em PDF.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Autenticação Google / ID Apple */}
      {socialModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-fade-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                {socialModalProvider === "GOOGLE" ? (
                  <GoogleLogoSvg />
                ) : (
                  <AppleLogoSvg />
                )}
                <h3 className="text-base font-extrabold text-[#09090B]">
                  {socialModalProvider === "GOOGLE"
                    ? "Entrar ou Cadastrar com Google"
                    : "Entrar ou Cadastrar com ID Apple"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSocialModalProvider(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opção 1: Seleção Rápida da Conta Google/Apple */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500">
                Escolha uma conta para prosseguir na Sing Viagens:
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSocialLoginConfirm(
                    socialModalProvider,
                    "donaldson.nunes@gmail.com",
                    "Donaldson",
                    "Nunes",
                    "1985-04-12",
                    "284.910.378-02",
                    "(11) 99999-0000",
                    "FP892341",
                    "2032-06-15"
                  )
                }
                className="w-full p-3 rounded-xl border border-[#BD9472] bg-[#FAF8F5] hover:bg-[#E8E2D9]/50 transition flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#172C3B] text-[#BD9472] font-bold flex items-center justify-center text-sm">
                    D
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#09090B] flex items-center gap-1.5">
                      <span>Donaldson Nunes</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#172C3B] text-[#BD9472] text-[10px]">
                        ADMIN
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      donaldson.nunes@gmail.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#172C3B]" />
              </button>
            </div>

            {/* Opção 2: Digitar outra conta Google ou Apple ID já replicando dados de passageiro */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSocialLoginConfirm(
                  socialModalProvider,
                  socialEmail,
                  socialFirstName,
                  socialLastName,
                  socialBirthDate,
                  socialCpf,
                  socialPhone,
                  socialPassport,
                  socialPassportExpiry
                );
              }}
              className="space-y-2.5 pt-2 border-t border-gray-100"
            >
              <div className="text-xs font-semibold text-gray-600">
                Ou cadastre/entre com sua conta{" "}
                {socialModalProvider === "GOOGLE" ? "Google" : "ID Apple"} (replicando automaticamente no seu perfil de passageiro):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={socialFirstName}
                  onChange={(e) => setSocialFirstName(e.target.value)}
                  placeholder="Nome *"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                />
                <input
                  type="text"
                  required
                  value={socialLastName}
                  onChange={(e) => setSocialLastName(e.target.value)}
                  placeholder="Sobrenome *"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                />
                <input
                  type="date"
                  required
                  value={socialBirthDate}
                  onChange={(e) => setSocialBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-2.5 py-2 text-xs font-mono text-[#09090B]"
                />
                <input
                  type="text"
                  required
                  value={socialCpf}
                  onChange={(e) => setSocialCpf(e.target.value)}
                  placeholder="CPF *"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-[#09090B]"
                />
                <input
                  type="text"
                  value={socialPhone}
                  onChange={(e) => setSocialPhone(e.target.value)}
                  placeholder="Celular (opcional)"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                />
                <input
                  type="text"
                  value={socialPassport}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setSocialPassport(val);
                    if (!val.trim()) setSocialPassportExpiry("");
                  }}
                  placeholder="Passaporte (opcional)"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-[#09090B]"
                />
              </div>
              {socialPassport.trim() !== "" && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Data de Vencimento do Passaporte *
                  </label>
                  <input
                    type="date"
                    required
                    value={socialPassportExpiry}
                    onChange={(e) => setSocialPassportExpiry(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>
              )}
              <input
                type="email"
                required
                value={socialEmail}
                onChange={(e) => setSocialEmail(e.target.value)}
                placeholder={
                  socialModalProvider === "GOOGLE"
                    ? "seuemail@gmail.com *"
                    : "seuemail@icloud.com *"
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[#09090B]"
              />

              {authError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {authError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="flex-1 py-2.5 rounded-xl bg-[#172C3B] text-white font-bold text-xs hover:bg-[#09090B] transition"
                >
                  {loadingAuth
                    ? "Conectando..."
                    : `Continuar com ${
                        socialModalProvider === "GOOGLE" ? "Google" : "ID Apple"
                      }`}
                </button>
                <a
                  href={`${SUPABASE_PROJECT_URL}/auth/v1/authorize?provider=${socialModalProvider.toLowerCase()}&redirect_to=${
                    typeof window !== "undefined"
                      ? encodeURIComponent(`${window.location.origin}/conta`)
                      : ""
                  }`}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-[#09090B] hover:border-gray-300 text-[11px] font-semibold flex items-center"
                  title="Redirecionamento OAuth Direto Supabase"
                >
                  OAuth Direto
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedVoucherOrder && (
        <TicketVoucherModal
          order={selectedVoucherOrder}
          onClose={() => setSelectedVoucherOrder(null)}
        />
      )}
    </div>
  );
}
