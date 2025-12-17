// @/lib/mercado-pago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN! 
})

export async function createMercadoPagoSubscription(planId: string) {
  try {
    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: planId,
            title: `Assinatura ASOflow - ${planId}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: 100, // Este valor deve vir do seu backend
          },
        ],
        back_urls: {
          success: `${window.location.origin}/dashboard?subscription=success`,
          failure: `${window.location.origin}/dashboard?subscription=failure`,
          pending: `${window.location.origin}/dashboard?subscription=pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      },
    })

    return preference.init_point!
  } catch (error) {
    console.error('Erro ao criar preferência do Mercado Pago:', error)
    throw error
  }
}