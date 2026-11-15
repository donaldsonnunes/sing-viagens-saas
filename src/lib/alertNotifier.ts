/**
 * Despachante automático de notificações quando um alerta de tarifa detecta queda.
 *
 * Variáveis opcionais de ambiente (Vercel):
 * - RESEND_API_KEY + ALERT_FROM_EMAIL (default: contato@singviagens.com.br): envia e-mail via Resend.
 * - WHATSAPP_WEBHOOK_URL + WHATSAPP_WEBHOOK_TOKEN (opcional): envia payload JSON para Evolution API / Z-API / n8n / Make.
 */

export interface TriggeredAlertNotification {
  id: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  originIata: string;
  destinationIata: string;
  previousLowestPrice: number | null;
  newLowestPrice: number;
}

export async function dispatchAlertNotifications(
  alerts: TriggeredAlertNotification[]
): Promise<{ emailed: number; whatsappSent: number }> {
  if (!alerts.length) return { emailed: 0, whatsappSent: 0 };

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.ALERT_FROM_EMAIL?.trim() || "Sing Viagens <contato@singviagens.com.br>";
  const whatsappWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL?.trim();
  const whatsappToken = process.env.WHATSAPP_WEBHOOK_TOKEN?.trim();

  let emailed = 0;
  let whatsappSent = 0;

  for (const alert of alerts) {
    const formattedPrice = `R$ ${Number(alert.newLowestPrice).toLocaleString("pt-BR")}`;
    const prevText = alert.previousLowestPrice
      ? ` (antes R$ ${Number(alert.previousLowestPrice).toLocaleString("pt-BR")})`
      : "";
    const message = `Olá, ${alert.customerName}! Boa notícia da Sing Viagens: o trecho ${alert.originIata} → ${alert.destinationIata} baixou para ${formattedPrice}${prevText}. Acesse https://www.singviagens.com.br/pesquisa ou responda aqui para garantirmos a emissão.`;

    if (resendKey && alert.customerEmail) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [alert.customerEmail],
            subject: `⚡ Tarifa Baixou: ${alert.originIata} → ${alert.destinationIata} por ${formattedPrice}`,
            text: message,
          }),
        });
        if (res.ok) emailed += 1;
      } catch (err) {
        console.warn("[AlertNotifier] Falha ao enviar e-mail:", err);
      }
    }

    if (whatsappWebhookUrl && alert.customerWhatsapp) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (whatsappToken) {
          headers.Authorization = `Bearer ${whatsappToken}`;
        }
        const res = await fetch(whatsappWebhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            alertId: alert.id,
            phone: alert.customerWhatsapp.replace(/\D/g, ""),
            customerName: alert.customerName,
            originIata: alert.originIata,
            destinationIata: alert.destinationIata,
            previousLowestPrice: alert.previousLowestPrice,
            newLowestPrice: alert.newLowestPrice,
            message,
          }),
        });
        if (res.ok) whatsappSent += 1;
      } catch (err) {
        console.warn("[AlertNotifier] Falha ao enviar WhatsApp webhook:", err);
      }
    }
  }

  return { emailed, whatsappSent };
}
