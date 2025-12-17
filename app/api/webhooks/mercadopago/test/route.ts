// app/api/webhooks/mercadopago/test/route.ts
import { NextResponse } from 'next/server';

/**
 * Endpoint para testar o webhook localmente
 * Simula uma notificação do Mercado Pago
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Dados de teste padrão
    const testPayment = {
      id: body.paymentId || 'test_payment_123',
      status: body.status || 'approved',
      metadata: {
        user_id: body.userId || 'test_user_id',
        plan_type: body.planType || 'pro'
      },
      transaction_amount: body.amount || 79.90,
      payment_method_id: 'credit_card',
      payer: {
        email: body.email || 'test@example.com'
      }
    };

    console.log('🧪 Teste de webhook iniciado');
    console.log('Dados do pagamento:', testPayment);

    // Importar o PaymentService do caminho correto
    // Caminho: app/api/webhooks/mercadopago/test/ -> services/
    // Precisamos subir 6 níveis: test -> mercadopago -> webhooks -> api -> app -> raiz
    const { PaymentService } = await import('@/.next/dev/services/paymentService');
    
    const result = await PaymentService.processarWebhook({
      id: testPayment.id.toString(),
      status: testPayment.status,
      userId: testPayment.metadata.user_id,
      planType: testPayment.metadata.plan_type,
      amount: testPayment.transaction_amount,
      paymentMethod: testPayment.payment_method_id,
      metadata: testPayment.metadata
    });

    console.log('✅ Teste concluído:', result);

    return NextResponse.json({
      success: true,
      message: 'Webhook de teste processado com sucesso',
      result
    });

  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET para ver exemplos de payloads de teste
 */
export async function GET() {
  return NextResponse.json({
    message: 'Webhook de teste do Mercado Pago',
    status: 'Server is running ✅',
    usage: 'Envie um POST para este endpoint com os dados do pagamento',
    examples: {
      minimal: {
        userId: 'seu_user_id',
        planType: 'pro',
        amount: 79.90
      },
      complete: {
        paymentId: 'test_123',
        userId: 'user_abc',
        planType: 'pro',
        amount: 79.90,
        status: 'approved',
        email: 'user@example.com'
      }
    },
    testCommands: {
      powershell: `Invoke-WebRequest -Uri http://localhost:3000/api/webhooks/mercadopago/test -Method POST -ContentType "application/json" -Body '{"userId":"test_user","planType":"pro","amount":79.90}'`,
      curl: `curl -X POST http://localhost:3000/api/webhooks/mercadopago/test -H "Content-Type: application/json" -d "{\"userId\":\"test_user\",\"planType\":\"pro\",\"amount\":79.90}"`
    }
  });
}