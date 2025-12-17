// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Ler o corpo da requisição
    const body = await request.json();
    
    console.log('📩 Webhook recebido:', {
      type: body.type,
      id: body.data?.id,
      timestamp: new Date().toISOString()
    });

    // Validar estrutura básica
    if (!body.type || !body.data?.id) {
      console.warn('⚠️ Webhook inválido - dados faltando');
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Processar apenas eventos de pagamento
    if (body.type === 'payment') {
      try {
        // Buscar detalhes do pagamento na API do Mercado Pago
        const paymentDetails = await getPaymentDetails(body.data.id);
        
        console.log('💳 Pagamento obtido:', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          amount: paymentDetails.transaction_amount
        });

        // Processar o pagamento
        const result = await processPayment(paymentDetails);
        
        return NextResponse.json({
          success: true,
          message: 'Pagamento processado',
          paymentId: paymentDetails.id,
          status: paymentDetails.status
        });

      } catch (paymentError: any) {
        console.error('❌ Erro ao processar pagamento:', paymentError);
        
        return NextResponse.json(
          {
            error: 'Erro ao processar pagamento',
            details: paymentError.message
          },
          { status: 500 }
        );
      }
    }

    // Outros tipos de notificação (opcional)
    console.log('ℹ️ Tipo de notificação ignorado:', body.type);
    return NextResponse.json({ 
      received: true, 
      type: body.type,
      message: 'Notificação recebida mas não processada' 
    });

  } catch (error: any) {
    console.error('❌ Erro geral no webhook:', error);
    
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Busca os detalhes do pagamento na API do Mercado Pago
 */
async function getPaymentDetails(paymentId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao buscar pagamento: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return await response.json();
}

/**
 * Processa o pagamento aprovado e atualiza o banco de dados
 */
async function processPayment(payment: any) {
  // Verificar se o pagamento foi aprovado
  if (payment.status !== 'approved') {
    console.log('⏳ Pagamento não aprovado ainda:', payment.status);
    return {
      processed: false,
      reason: 'Pagamento não aprovado',
      status: payment.status
    };
  }

  // Extrair dados importantes
  const userId = payment.metadata?.user_id;
  const planType = payment.metadata?.plan_type;

  if (!userId || !planType) {
    throw new Error('Metadata incompleto: user_id ou plan_type não encontrado');
  }

  console.log('✅ Processando pagamento aprovado:', {
    userId,
    planType,
    amount: payment.transaction_amount
  });

  // Importar e usar o PaymentService
  const { PaymentService } = await import('@/.next/dev/services/paymentService');
  
  const result = await PaymentService.processarWebhook({
    id: payment.id,
    status: payment.status,
    userId,
    planType,
    amount: payment.transaction_amount,
    paymentMethod: payment.payment_method_id,
    metadata: payment.metadata
  });

  return result;
}

/**
 * Endpoint GET para verificar se o webhook está funcionando
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'Webhook Mercado Pago funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}