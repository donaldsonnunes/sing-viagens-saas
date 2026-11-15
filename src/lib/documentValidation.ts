/**
 * Utilitários compartilhados de validação de documentos (CPF e Passaporte).
 *
 * ATENÇÃO (Pré-lançamento):
 * Enquanto `ALLOW_REPEATED_CPF_FOR_TESTING` estiver `true`, CPFs com todos os
 * 11 dígitos iguais (ex.: 111.111.111-11, 000.000.000-00) são aceitos para
 * facilitar testes internos. Ao liberar publicamente, altere para `false`.
 */
export const ALLOW_REPEATED_CPF_FOR_TESTING = true;

export function normalizeCpfDigits(cpf: string): string {
  return String(cpf || "").replace(/\D/g, "");
}

export function formatCpfInput(value: string): string {
  const digits = normalizeCpfDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCpf(
  cpf: string,
  allowRepeatedTestDigits: boolean = ALLOW_REPEATED_CPF_FOR_TESTING
): boolean {
  const digits = normalizeCpfDigits(cpf);
  if (digits.length !== 11) return false;

  const allSameDigits = /^(\d)\1{10}$/.test(digits);
  if (allSameDigits) {
    return allowRepeatedTestDigits;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let firstVerifier = (sum * 10) % 11;
  if (firstVerifier === 10) firstVerifier = 0;
  if (firstVerifier !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  let secondVerifier = (sum * 10) % 11;
  if (secondVerifier === 10) secondVerifier = 0;
  return secondVerifier === Number(digits[10]);
}

export function validatePassportWithExpiry(
  passport?: string,
  passportExpiry?: string
): { valid: boolean; error?: string } {
  const cleanPassport = String(passport || "").trim();
  if (!cleanPassport) {
    return { valid: true };
  }

  const cleanExpiry = String(passportExpiry || "").trim();
  if (!cleanExpiry) {
    return {
      valid: false,
      error: "Informe a data de vencimento do passaporte.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanExpiry)) {
    return {
      valid: false,
      error: "Data de vencimento do passaporte inválida.",
    };
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  if (cleanExpiry < todayIso) {
    return {
      valid: false,
      error: "O passaporte informado está vencido. Informe um passaporte válido.",
    };
  }

  return { valid: true };
}
