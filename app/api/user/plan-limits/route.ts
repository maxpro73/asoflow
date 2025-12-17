// app/api/user/plan-limits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Pegar todos os cookies do Supabase (formato padrão: sb-<project-ref>-auth-token)
    const allCookies = cookieStore.getAll()
    const supabaseAuthCookie = allCookies.find(cookie => 
      cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    )
    
    console.log('🍪 Cookies disponíveis:', allCookies.map(c => c.name))
    console.log('🔐 Cookie de auth encontrado:', supabaseAuthCookie?.name)
    
    if (!supabaseAuthCookie) {
      return NextResponse.json({
        error: 'Não autenticado',
        details: 'Você precisa fazer login primeiro. Nenhum cookie de autenticação do Supabase foi encontrado.',
        availableCookies: allCookies.map(c => c.name),
        help: 'Faça login na aplicação em /login e tente novamente'
      }, { status: 401 })
    }
    
    // Parse o cookie (formato: base64.base64.base64)
    let accessToken: string | undefined
    try {
      const cookieValue = supabaseAuthCookie.value
      // O cookie do Supabase é um JSON base64 encoded
      const decoded = JSON.parse(
        Buffer.from(cookieValue.split('.')[1], 'base64').toString()
      )
      accessToken = decoded.access_token
    } catch (e) {
      // Se não conseguir fazer parse, tenta usar o cookie direto
      accessToken = supabaseAuthCookie.value
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )
    
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Sessão inválida',
        details: authError?.message || 'Token de autenticação inválido',
        help: 'Faça login novamente'
      }, { status: 401 })
    }

    console.log('✅ Usuário autenticado:', user.id)

    // 2. Buscar dados do perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Erro ao buscar profile:', profileError)
    }

    // 3. Buscar assinatura
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError) {
      console.error('❌ Erro ao buscar subscription:', subError)
    }

    // 4. Contar funcionários
    const { count: funcionariosCount, error: funcError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (funcError) {
      console.error('❌ Erro ao contar funcionários:', funcError)
    }

    // 5. Contar ASOs
    const { count: asosCount, error: asoError } = await supabase
      .from('asos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (asoError) {
      console.error('❌ Erro ao contar ASOs:', asoError)
    }

    // 6. Mapear plano
    const planMap: any = {
      'essencial': { id: 1, name: 'Starter', limitEmployees: 100, limitASOs: 500 },
      'premium': { id: 2, name: 'Premium', limitEmployees: 50, limitASOs: 80 },
      'business': { id: 3, name: 'Business', limitEmployees: 200, limitASOs: 5000 }
    }

    const currentPlanKey = subscription?.plan_name?.toLowerCase() || 'essencial'
    const currentPlan = planMap[currentPlanKey] || planMap['essencial']

    // 7. Montar resposta
    const response = {
      userId: user.id,
      userEmail: user.email,
      userName: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
      currentPlanId: currentPlan.id,
      currentPlan: currentPlan,
      totalFuncionarios: funcionariosCount || 0,
      totalASOs: asosCount || 0,
      isSubscriptionActive: subscription?.status === 'active',
      subscriptionStatus: subscription?.status || 'inactive',
      rawSubscription: subscription,
      rawProfile: profile,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('💥 Erro crítico:', error)
    return NextResponse.json({
      error: 'Erro ao buscar dados',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}