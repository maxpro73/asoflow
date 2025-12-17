// app/api/mercadopago/route.ts (rota única)
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleVerifyPayment(request);
}

export async function POST(request: NextRequest) {
  return handleWebhook(request);
}

async function handleVerifyPayment(request: NextRequest) {
  try {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store, max-age=0');

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');

    console.log('🔍 Verificando pagamento:', { paymentId, preferenceId });

    if (!paymentId && !preferenceId) {
      return NextResponse.json({
        error: 'Missing payment_id or preference_id',
        status: 'error',
        message: 'É necessário fornecer payment_id ou preference_id'
      }, { 
        status: 400,
        headers 
      });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json({
        error: 'Server configuration error',
        status: 'error',
        message: 'Token do Mercado Pago não configurado'
      }, { 
        status: 500,
        headers 
      });
    }

    if (paymentId) {
      console.log('📞 Buscando pagamento:', paymentId);
      
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('❌ Erro na API do Mercado Pago:', response.status);
        return NextResponse.json({
          error: 'Payment not found',
          status: 'error',
          message: 'Pagamento não encontrado'
        }, { 
          status: 404,
          headers 
        });
      }

      const payment = await response.json();
      console.log('✅ Pagamento encontrado:', payment.id);

      const statusMap: { [key: string]: string } = {
        'approved': 'success',
        'pending': 'pending',
        'in_process': 'pending',
        'rejected': 'rejected',
        'cancelled': 'rejected',
        'refunded': 'rejected',
        'charged_back': 'rejected'
      };

      const mappedStatus = statusMap[payment.status] || 'error';

      return NextResponse.json({
        status: mappedStatus,
        message: getStatusMessage(payment.status),
        paymentData: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          payer: payment.payer?.email,
          payment_method: payment.payment_method_id,
          date_created: payment.date_created,
          date_approved: payment.date_approved,
          external_reference: payment.external_reference
        }
      }, { headers });
    }

    // Se chegou aqui, é preference_id
    console.log('📞 Buscando preferência:', preferenceId);
    
    const response = await fetch(
      `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Erro ao buscar preferência:', response.status);
      return NextResponse.json({
        error: 'Preference not found',
        status: 'error',
        message: 'Preferência não encontrada'
      }, { 
        status: 404,
        headers 
      });
    }

    const preference = await response.json();
    console.log('✅ Preferência encontrada:', preference.id);

    return NextResponse.json({
      status: 'pending',
      message: 'Aguardando confirmação do pagamento',
      preferenceData: {
        id: preference.id,
        external_reference: preference.external_reference,
        items: preference.items
      }
    }, { headers });

  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    return NextResponse.json({
      error: 'Failed to verify payment',
      status: 'error',
      message: 'Erro ao verificar pagamento'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

async function handleWebhook(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('📥 Webhook recebido:', body);
    
    // Processar webhook do Mercado Pago
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  const messages: { [key: string]: string } = {
    'approved': 'Pagamento aprovado com sucesso!',
    'pending': 'Pagamento pendente de confirmação',
    'in_process': 'Pagamento em processamento',
    'rejected': 'Pagamento rejeitado',
    'cancelled': 'Pagamento cancelado',
    'refunded': 'Pagamento reembolsado',
    'charged_back': 'Pagamento estornado'
  };

  return messages[status] || 'Status desconhecido';
}