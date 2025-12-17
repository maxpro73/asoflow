import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  
  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenStart: token?.substring(0, 15) || 'não encontrado',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('MERCADO') || k.includes('SUPABASE'))
  })
}