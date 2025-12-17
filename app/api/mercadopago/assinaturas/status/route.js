// app/api/assinatura/status/route.js
import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fduejxlmdjslonpyvuaw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Obter usuário do token (adaptar para sua autenticação)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const assinatura = await PaymentService.verificarAssinatura(user.id);

    return NextResponse.json(assinatura);

  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}