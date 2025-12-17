'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, Shield, CreditCard, Loader2, Sparkles, QrCode, 
  Barcode, Banknote, ExternalLink, CheckCircle, XCircle,
  Zap, Users, BarChart3, Globe, Cloud, Award,
  Calendar, CalendarDays, FileText, Bell, Clock,
  Smartphone, Headphones, TrendingUp, Server
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 relative">
        <Image 
          src="/logo-briefcase.png" 
          alt="ASOflow Logo" 
          width={64}
          height={64}
          className="object-contain animate-pulse"
          priority
        />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Carregando informações do plano
      </h2>
      <p className="text-gray-600 mb-8">
        Preparando tudo para sua assinatura Premium
      </p>
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-sm text-gray-500">Aguarde um momento...</span>
      </div>
    </div>
  </div>
);

export default function PagamentosDoisPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cadastroData, setCadastroData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [retryCount, setRetryCount] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [planType, setPlanType] = useState('monthly');

  useEffect(() => {
    const data = localStorage.getItem('pending_account') || localStorage.getItem('cadastroData');
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setCadastroData(parsedData);
        console.log('✅ Dados carregados para plano Premium:', parsedData.email);
      } catch (error) {
        console.error('❌ Erro ao parsear dados:', error);
        setErrorMessage('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    } else {
      console.log('⚠️ Nenhum dado encontrado para plano Premium');
      setErrorMessage('Nenhum dado de cadastro encontrado.');
    }
  }, []);

  const planoInfo = {
    id: planType === 'monthly' ? 'premium_mensal' : 'premium_anual',
    name: 'Premium',
    monthlyValue: 197.00,
    annualValue: 167.00 * 12,
    descricao: 'Plano Premium - Solução avançada para empresas em crescimento',
    beneficios: [
      'Até 100 funcionários',
      '5 usuários RH',
      '3 unidades/empresas',
      'Alertas Email + Whatsapp + SMS',
      'Dashboard Avançado',
      'Histórico de alertas (24 meses)',
      'Upload ilimitado de ASOs',
      'Relatórios avançados',
      'Suporte prioritário (12h)',
      'API de integração',
      'Treinamento personalizado',
      'Backup em nuvem diário',
      'SLA 99.5% de disponibilidade',
      'Certificado de conformidade avançado',
      'Atualizações prioritárias'
    ]
  };

  const getCurrentPlanValue = () => {
    return planType === 'monthly' ? planoInfo.monthlyValue : planoInfo.annualValue;
  };

  const createMercadoPagoPreference = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      setErrorMessage('');

      if (!cadastroData) {
        throw new Error('Dados do cadastro não encontrados.');
      }

      const userEmail = cadastroData.email;
      const userName = cadastroData.nome;
      const currentValue = getCurrentPlanValue();

      console.log('🔄 Preparando dados para Mercado Pago (Premium):');
      console.log('- Plano:', planoInfo.name);
      console.log('- Tipo:', planType);
      console.log('- Valor:', currentValue);

      const orderData = {
        planId: planoInfo.id,
        planName: `ASOflow - Plano ${planoInfo.name} (${planType === 'monthly' ? 'Mensal' : 'Anual'})`,
        price: currentValue.toFixed(2),
        email: userEmail,
        name: userName,
        isAnnual: planType === 'annual',
        back_urls: {
          success: `${window.location.origin}/pagamentos/sucesso`,
          failure: `${window.location.origin}/pagamentos/falha`,
          pending: `${window.location.origin}/pagamentos/pendente`
        }
      };

      console.log('📤 Dados enviados:', JSON.stringify(orderData, null, 2));

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('📥 Status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Resposta:', responseText);

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          console.error('❌ Erro:', errorData);
          errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Resposta não-JSON:', responseText.substring(0, 200));
          errorMessage = responseText.substring(0, 100) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Dados parseados:', data);
      } catch (parseError) {
        console.error('❌ Erro ao parsear:', parseError);
        throw new Error('Resposta inválida do servidor');
      }

      if (data.status && data.status !== "success") {
        throw new Error(data.error || data.message || 'Erro ao criar preferência');
      }

      const checkoutUrl = data.init_point || data.sandbox_init_point;

      if (!checkoutUrl) {
        console.error('❌ URL não encontrada:', data);
        throw new Error('URL de pagamento não foi gerada');
      }

      console.log('✅ Sucesso! ID:', data.id);
      console.log('✅ URL:', checkoutUrl);
      
      window.location.href = checkoutUrl;
        
    } catch (error) {
      console.error('💥 Erro:', error);
      
      const errorMsg = error.message || 'Erro ao processar pagamento';
      setPaymentError(errorMsg);
      setErrorMessage(errorMsg);
      
      if (retryCount < 2) {
        console.log(`🔄 Retry ${retryCount + 1}/3...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          createMercadoPagoPreference();
        }, 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    await createMercadoPagoPreference();
  };

  if (!cadastroData && !errorMessage) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image 
                src="/logo-briefcase.png" 
                alt="ASOflow Logo" 
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">ASOflow</span>
              <p className="text-xs text-blue-600">Solução Avançada para Empresas em Crescimento</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Plano Premium
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Selecione o período da sua assinatura
            </p>

            {/* Seletor de Período */}
            <div className="max-w-md mx-auto mb-12">
              <div className="grid grid-cols-2 gap-6">
                {/* Mensal */}
                <button
                  onClick={() => setPlanType('monthly')}
                  className={`p-6 border rounded-2xl transition-all text-left ${
                    planType === 'monthly' 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      planType === 'monthly' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Calendar className={`w-5 h-5 ${
                        planType === 'monthly' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Mensal</h3>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {planoInfo.monthlyValue.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-gray-600">Flexibilidade total</p>
                </button>

                {/* Anual */}
                <button
                  onClick={() => setPlanType('annual')}
                  className={`p-6 border rounded-2xl transition-all text-left ${
                    planType === 'annual' 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      planType === 'annual' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <CalendarDays className={`w-5 h-5 ${
                        planType === 'annual' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Anual</h3>
                      <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded inline-block mt-1">
                        Economize 15%
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">R$ 167,00</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="line-through text-gray-400">R$ {planoInfo.monthlyValue.toFixed(2)}</span>
                    {' '}
                    <span className="text-green-600 font-medium">R$ 167,00</span>
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Erro Global */}
          {errorMessage && !cadastroData && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-lg font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Conteúdo Principal */}
          {cadastroData && (
            <>
              {/* Erro de Pagamento */}
              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 text-sm">{paymentError}</p>
                      {retryCount > 0 && (
                        <p className="text-red-600 text-xs mt-1">
                          Tentativa {retryCount + 1} de 3
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Sidebar - Resumo */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-200 rounded-2xl p-8 shadow-sm sticky top-8">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                        MAIS VENDIDO
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Plano Premium
                    </h3>
                    
                    {/* Cliente */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Cliente</h4>
                      <div className="space-y-2">
                        <p className="text-gray-900 font-medium">{cadastroData.nome}</p>
                        <p className="text-gray-600 text-sm">{cadastroData.email}</p>
                        {cadastroData.telefone && (
                          <p className="text-gray-500 text-sm">{cadastroData.telefone}</p>
                        )}
                        {cadastroData.empresa && (
                          <p className="text-gray-500 text-sm">{cadastroData.empresa}</p>
                        )}
                      </div>
                    </div>

                    {/* Benefícios Destaque */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Principais benefícios</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {planoInfo.beneficios.slice(0, 8).map((beneficio, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                        <div className="text-xs text-blue-600 font-medium">
                          + mais {planoInfo.beneficios.length - 8} benefícios
                        </div>
                      </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">
                          {planType === 'monthly' ? 'Valor mensal' : 'Valor total anual'}
                        </span>
                        <span className="text-gray-900 font-medium">
                          R$ {getCurrentPlanValue().toFixed(2)}
                        </span>
                      </div>
                      
                      {planType === 'annual' && (
                        <>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Desconto anual</span>
                            <span className="text-green-600 font-medium">-15%</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Mensal equivalente</span>
                            <span className="text-gray-900">R$ 167,00</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Economia total</span>
                            <span className="text-green-600 font-medium">R$ 360,00</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Taxas</span>
                        <span className="text-green-600 font-medium">Grátis</span>
                      </div>
                      
                      <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                        <span>Total</span>
                        <span>R$ {getCurrentPlanValue().toFixed(2)}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        * Cancelamento a qualquer momento
                      </div>
                    </div>

                    {/* Garantia */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-semibold">SLA 99.5%</h4>
                          <p className="text-sm text-gray-600">Alta disponibilidade</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="lg:col-span-2">
                  {/* Métodos de Pagamento */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Forma de pagamento
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {/* Cartão */}
                      <button
                        onClick={() => {
                          setPaymentMethod('card');
                          setErrorMessage('');
                          setPaymentError(null);
                        }}
                        className={`group p-6 border rounded-xl transition-all text-left ${
                          paymentMethod === 'card' 
                            ? 'border-blue-500 ring-2 ring-blue-500/20' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentMethod === 'card' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <CreditCard className={`w-6 h-6 ${
                              paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Cartão</h4>
                        <p className="text-sm text-gray-600">
                          {planType === 'monthly' ? 'Até 12x' : 'Parcele no cartão'}
                        </p>
                      </button>

                      {/* PIX */}
                      <button
                        onClick={() => {
                          setPaymentMethod('pix');
                          setErrorMessage('');
                          setPaymentError(null);
                        }}
                        className={`group p-6 border rounded-xl transition-all text-left ${
                          paymentMethod === 'pix' 
                            ? 'border-blue-500 ring-2 ring-blue-500/20' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentMethod === 'pix' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <QrCode className={`w-6 h-6 ${
                              paymentMethod === 'pix' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">PIX</h4>
                        <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                      </button>

                      {/* Boleto */}
                      <button
                        onClick={() => {
                          setPaymentMethod('boleto');
                          setErrorMessage('');
                          setPaymentError(null);
                        }}
                        className={`group p-6 border rounded-xl transition-all text-left ${
                          paymentMethod === 'boleto' 
                            ? 'border-blue-500 ring-2 ring-blue-500/20' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentMethod === 'boleto' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Barcode className={`w-6 h-6 ${
                              paymentMethod === 'boleto' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Boleto</h4>
                        <p className="text-sm text-gray-600">Para departamento financeiro</p>
                      </button>

                      {/* Outros */}
                      <button
                        onClick={() => {
                          setPaymentMethod('all');
                          setErrorMessage('');
                          setPaymentError(null);
                        }}
                        className={`group p-6 border rounded-xl transition-all text-left ${
                          paymentMethod === 'all' 
                            ? 'border-blue-500 ring-2 ring-blue-500/20' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentMethod === 'all' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Banknote className={`w-6 h-6 ${
                              paymentMethod === 'all' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Outras formas</h4>
                        <p className="text-sm text-gray-600">Ver todas as opções</p>
                      </button>
                    </div>

                    {/* Botão de Pagamento */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Processando...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-6 h-6" />
                            <span>Contratar - R$ {getCurrentPlanValue().toFixed(2)}</span>
                            <ExternalLink className="w-6 h-6" />
                          </>
                        )}
                      </button>

                      <div className="text-center mt-6">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="w-4 h-4" />
                          <span>Seguro via Mercado Pago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefícios Visuais */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Recursos Avançados
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { icon: Zap, title: 'Alta Performance', desc: 'Processamento rápido' },
                        { icon: Users, title: 'Multi-usuários', desc: '5 usuários RH' },
                        { icon: BarChart3, title: 'Dashboard Avançado', desc: 'Métricas detalhadas' },
                        { icon: Globe, title: 'Multi-unidades', desc: '3 empresas' },
                        { icon: Cloud, title: 'Backup Diário', desc: 'Nuvem segura' },
                        { icon: Award, title: 'Certificação', desc: 'Conformidade ASO' },
                        { icon: Headphones, title: 'Suporte 12h', desc: 'Atendimento rápido' },
                        { icon: Server, title: 'API Integração', desc: 'Conecte seus sistemas' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-gray-900 font-semibold">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lista Completa */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Tudo incluído no plano Premium:</h3>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {planoInfo.beneficios.map((beneficio, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comparativo */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Economia com plano anual:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Plano mensal (12 meses)</p>
                        <p className="text-lg font-bold text-gray-900">
                          R$ {(planoInfo.monthlyValue * 12).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">Plano anual com desconto</p>
                        <p className="text-lg font-bold text-green-700">
                          R$ {planoInfo.annualValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        💡 <strong>Você economiza R$ 360,00</strong> escolhendo o plano anual!
                      </p>
                    </div>
                  </div>

                  {/* CTA Final */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <Sparkles className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">Solução Completa</h4>
                        <p className="text-blue-100 text-sm">
                          Plano desenvolvido para empresas em crescimento. Após o pagamento, 
                          sua conta será criada automaticamente com todos os recursos do plano Premium.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/logo-briefcase.png" 
                    alt="ASOflow Logo" 
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">ASOflow</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sistema de Gestão de ASO Premium
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} ASOflow. Todos os direitos reservados.
              </p>
              <div className="flex justify-center md:justify-end gap-6 mt-3">
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  Termos de Uso
                </a>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  Política de Privacidade
                </a>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  Suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}