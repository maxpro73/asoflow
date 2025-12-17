// app/api/mercadopago/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface PaymentRequest {
  planId: string
  planName: string
  amount: number
  email: string
  billingCycle: 'monthly' | 'annual'
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()
    const { amount, email, planName, billingCycle } = body

    // Validações
    if (!amount || !email || !billingCycle) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: amount, email, billingCycle' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não encontrado')
      return NextResponse.json(
        { 
          error: 'Configuração incompleta',
          details: 'Token do Mercado Pago não configurado. Configure MERCADO_PAGO_ACCESS_TOKEN no arquivo .env.local'
        },
        { status: 500 }
      )
    }

    console.log('🔄 Criando preferência no Mercado Pago...')
    console.log('📧 Email:', email)
    console.log('💰 Valor:', amount)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          title: planName,
          description: `Assinatura ${billingCycle === 'monthly' ? 'Mensal' : 'Anual'} - ASOflow`,
          category_id: 'services',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(amount)
        }
      ],
      payer: {
        email: email,
        name: email.split('@')[0],
        surname: 'Cliente',
        phone: {
          area_code: '14',
          number: '999999999'
        },
        address: {
          zip_code: '17012-000',
          street_name: 'Rua Batista de Carvalho',
          street_number: 100
        }
      },
      back_urls: {
        success: `${appUrl}/sucesso`,
        failure: `${appUrl}/pagamentos/um?error=true`,
        pending: `${appUrl}/pagamentos/um?pending=true`
      },
      auto_return: 'approved',
      external_reference: `asoflow_${billingCycle}_${Date.now()}`,
      statement_descriptor: 'ASOFLOW',
      notification_url: `${appUrl}/api/webhook`,
      payment_methods: {
        installments: billingCycle === 'monthly' ? 1 : 12,
        default_installments: 1
      }
    }

    console.log('📤 Enviando para Mercado Pago...')

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    })

    const responseText = await response.text()
    console.log('📥 Status:', response.status)

    if (!response.ok) {
      console.error('❌ Erro do Mercado Pago:', responseText)
      return NextResponse.json(
        { 
          error: 'Erro ao criar preferência no Mercado Pago',
          details: `Status ${response.status}`,
          message: 'Verifique se o token do Mercado Pago está correto e tem as permissões necessárias'
        },
        { status: 500 }
      )
    }

    const data = JSON.parse(responseText)
    console.log('✅ Preferência criada:', data.id)

    // URLs disponíveis
    const initPoint = data.init_point
    const sandboxInitPoint = data.sandbox_init_point
    
    // Usar sandbox em desenvolvimento, produção em produção
    const isDevelopment = process.env.NODE_ENV === 'development'
    const checkoutUrl = isDevelopment ? (sandboxInitPoint || initPoint) : initPoint

    if (!checkoutUrl) {
      console.error('❌ Nenhuma URL de checkout foi retornada')
      return NextResponse.json(
        { 
          error: 'URL de checkout não disponível',
          details: 'Mercado Pago não retornou URL válida'
        },
        { status: 500 }
      )
    }

    console.log('🔗 URL de checkout:', checkoutUrl)

    return NextResponse.json({
      success: true,
      preference_id: data.id,
      checkout_url: checkoutUrl,
      init_point: initPoint,
      sandbox_init_point: sandboxInitPoint,
      amount: amount,
      email: email,
      billing_cycle: billingCycle,
      environment: isDevelopment ? 'sandbox' : 'production'
    })

  } catch (error: any) {
    console.error('💥 Erro geral:', error)
    
    return NextResponse.json(
      {
        error: 'Erro interno no servidor',
        message: error.message,
        details: 'Verifique os logs do servidor para mais informações'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const hasToken = !!process.env.MERCADO_PAGO_ACCESS_TOKEN
  const tokenPrefix = process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 10)
  
  return NextResponse.json({
    service: 'ASOflow Payment API',
    status: 'online',
    path: '/api/mercadopago/create-order',
    environment: process.env.NODE_ENV,
    mercadopago_configured: hasToken,
    token_prefix: hasToken ? `${tokenPrefix}...` : 'não configurado',
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    timestamp: new Date().toISOString(),
    required_env: [
      'MERCADO_PAGO_ACCESS_TOKEN',
      'NEXT_PUBLIC_APP_URL'
    ],
    instructions: {
      setup: 'Configure as variáveis de ambiente no arquivo .env.local',
      test: 'Envie um POST para /api/mercadopago/create-order com os dados do pagamento'
    },
    example_request: {
      method: 'POST',
      url: '/api/mercadopago/create-order',
      body: {
        planId: 'asoflow_monthly',
        planName: 'ASOflow Pro',
        amount: 79.90,
        email: 'teste@exemplo.com',
        billingCycle: 'monthly'
      }
    }
  })
}