const N8N_WEBHOOK_URL = "";

export async function sendAppointmentToN8n(appointment) {
  if (!N8N_WEBHOOK_URL) {
    return {
      skipped: true,
      reason: "Webhook do n8n não configurado.",
      appointment,
    };
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origem: "barbearia-futurista",
      tipo: "novo-agendamento",
      agendamento: appointment,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao enviar agendamento para o n8n.");
  }

  return response;
}