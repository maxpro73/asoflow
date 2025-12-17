import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Verificar se a API key existe
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não está configurado no .env.local');
      return NextResponse.json(
        { 
          error: 'Configuração do servidor incompleta',
          details: 'Token do Mercado Pago não configurado. Verifique o .env.local'
        },
        { status: 500 }
      );
    }

    // 2. Pegar os dados do corpo da requisição
    const body = await request.json();
    console.log('📥 Dados recebidos:', body);

    const { planId, planName, price, email, name, isAnnual, back_urls } = body;

    // 3. Validar dados obrigatórios
    if (!planId || !planName || !price || !email) {
      return NextResponse.json(
        { 
          error: 'Dados incompletos',
          details: 'planId, planName, price e email são obrigatórios'
        },
        { status: 400 }
      );
    }

    // 4. Preparar URLs de retorno (SEMPRE com todas as três URLs)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    
    const backUrls = {
      success: back_urls?.success || `${baseUrl}/pagamentos/sucesso`,
      failure: back_urls?.failure || `${baseUrl}/pagamentos/falha`,
      pending: back_urls?.pending || `${baseUrl}/pagamentos/pendente`
    };

    // 5. Criar a preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          id: planId,
          title: planName,
          description: `Assinatura ${isAnnual ? 'anual' : 'mensal'} - ${planName}`,
          quantity: 1,
          unit_price: parseFloat(price),
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: email,
        name: name || 'Cliente ASOflow'
      },
      back_urls: backUrls,
      // auto_return só funciona com URLs públicas (HTTPS)
      // Em localhost, o Mercado Pago não aceita auto_return
      ...(isLocalhost ? {} : { auto_return: 'approved' }),
      statement_descriptor: 'ASOFLOW',
      external_reference: `${planId}_${Date.now()}`,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      metadata: {
        plan_id: planId,
        is_annual: isAnnual,
        user_email: email
      }
    };

    console.log('📤 Enviando para Mercado Pago:', JSON.stringify(preferenceData, null, 2));

    // 6. Fazer requisição para API do Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preferenceData)
    });

    const mpData = await mpResponse.json();
    console.log('📥 Resposta do Mercado Pago:', mpData);

    // 7. Verificar se houve erro na API do Mercado Pago
    if (!mpResponse.ok) {
      console.error('❌ Erro do Mercado Pago:', mpData);
      return NextResponse.json(
        { 
          error: 'Erro ao criar preferência de pagamento',
          details: mpData.message || mpData.error || 'Erro desconhecido do Mercado Pago',
          mercadopago_error: mpData
        },
        { status: mpResponse.status }
      );
    }

    // 8. Verificar se a resposta tem os dados necessários
    if (!mpData.id || !mpData.init_point) {
      console.error('❌ Resposta do Mercado Pago inválida:', mpData);
      return NextResponse.json(
        { 
          error: 'Resposta inválida do Mercado Pago',
          details: 'URL de pagamento não foi gerada'
        },
        { status: 500 }
      );
    }

    // 9. Retornar sucesso
    console.log('✅ Preferência criada com sucesso!');
    console.log('✅ ID:', mpData.id);
    console.log('✅ URL:', mpData.init_point);

    return NextResponse.json({
      status: 'success',
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
    });

  } catch (error) {
    console.error('💥 Erro fatal no servidor:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}