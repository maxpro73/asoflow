// lib/whatsapp-service.ts

interface WhatsAppMessage {
  to: string; // número do telefone no formato 5511999999999
  message: string;
}

export async function sendWhatsAppAlert({ to, message }: WhatsAppMessage): Promise<void> {
  // Obtenha essas variáveis de ambiente
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: message,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
    }

    console.log('Mensagem de WhatsApp enviada com sucesso para:', to);
  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp:', error);
    throw error;
  }
}