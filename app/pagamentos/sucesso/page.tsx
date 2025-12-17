'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ArrowRight, Home, FileText, 
  Calendar, Shield, Sparkles, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface PaymentData {
  nome?: string;
  empresa?: string;
  email?: string;
  paymentId?: string | null;
  status?: string | null;
  preferenceId?: string | null;
  paymentDate?: string;
}

export default function PagamentoSucessoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Verificar parâmetros do Mercado Pago
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');
    
    console.log('📥 Parâmetros recebidos do Mercado Pago:', {
      paymentId,
      status,
      preferenceId
    });

    // Buscar dados do localStorage
    const cadastroData = localStorage.getItem('cadastroData');
    
    if (cadastroData) {
      try {
        const data = JSON.parse(cadastroData);
        const paymentDataObj: PaymentData = {
          ...data,
          paymentId,
          status,
          preferenceId,
          paymentDate: new Date().toISOString()
        };
        setPaymentData(paymentDataObj);

        // Salvar confirmação de compra
        localStorage.setItem('purchaseConfirmed', JSON.stringify({
          ...data,
          paymentId,
          status,
          confirmedAt: new Date().toISOString()
        }));

        console.log('✅ Dados do pagamento salvos');
      } catch (error) {
        console.error('❌ Erro ao processar dados:', error);
      }
    }

    setIsLoading(false);
  }, [searchParams]);

  // Countdown para redirecionamento automático
  useEffect(() => {
    if (!isLoading && paymentData) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            redirectToDashboard();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, paymentData]);

  const redirectToDashboard = () => {
    // Limpar dados temporários
    localStorage.removeItem('cadastroData');
    
    // Redirecionar para o dashboard ou login
    router.push('/dashboard');
  };

  // Passos com cores fixas (sem templates dinâmicos do Tailwind)
  const steps = [
    {
      icon: Home,
      title: 'Acesse seu Dashboard',
      description: 'Comece a gerenciar seus ASOs imediatamente',
      color: 'blue',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FileText,
      title: 'Cadastre Funcionários',
      description: 'Adicione sua equipe ao sistema',
      color: 'purple',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Calendar,
      title: 'Agende ASOs',
      description: 'Configure os exames e lembretes automáticos',
      color: 'green',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Shield,
      title: 'Garanta Conformidade',
      description: 'Mantenha-se em dia com a NR-7',
      color: 'orange',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
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
              <p className="text-xs text-green-600">Pagamento Confirmado</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Card de Sucesso */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Animação de Sucesso */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-lg animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Pagamento Confirmado!
                </h1>
                <p className="text-xl text-green-50">
                  Bem-vindo ao ASOflow, {paymentData?.nome?.split(' ')[0] || 'Cliente'}! 🎉
                </p>
              </div>
              
              {/* Confetes decorativos */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <Sparkles className="absolute top-4 left-1/4 w-6 h-6 text-yellow-300 animate-pulse" />
                <Sparkles className="absolute top-8 right-1/4 w-4 h-4 text-blue-300 animate-pulse delay-100" />
                <Sparkles className="absolute bottom-8 left-1/3 w-5 h-5 text-purple-300 animate-pulse delay-200" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-8 md:p-12">
              {/* Informações do Pagamento */}
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Detalhes da Assinatura
                </h2>
                <div className="space-y-3">
                  {paymentData?.paymentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ID do Pagamento:</span>
                      <span className="font-mono text-sm text-gray-900">{paymentData.paymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plano:</span>
                    <span className="font-semibold text-gray-900">Premium Mensal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-bold text-green-600">R$ 197,00/mês</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Ativa
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Empresa:</span>
                    <span className="font-medium text-gray-900">{paymentData?.empresa}</span>
                  </div>
                </div>
              </div>

              {/* Próximos Passos */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Próximos Passos
                </h2>
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-lg ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-6 h-6 ${step.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefícios Desbloqueados */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  ✨ Benefícios Desbloqueados
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {[
                    'ASOs ilimitados',
                    'Até 100 funcionários',
                    'Laudos automáticos',
                    'Suporte prioritário',
                    'Backup em nuvem',
                    'Relatórios mensais',
                    'Conformidade NR-7',
                    'Integrações corporativas'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Email de Confirmação */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Confirmação Enviada
                    </p>
                    <p className="text-sm text-blue-700">
                      Enviamos um email para <strong>{paymentData?.email}</strong> com todos os detalhes da sua assinatura e credenciais de acesso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-4">
                <button
                  onClick={redirectToDashboard}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3"
                >
                  <span>Acessar Dashboard</span>
                  <ArrowRight className="w-6 h-6" />
                </button>

                {countdown > 0 && (
                  <p className="text-center text-sm text-gray-600">
                    Você será redirecionado automaticamente em <strong>{countdown}s</strong>
                  </p>
                )}

                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Imprimir Comprovante</span>
                </button>
              </div>

              {/* Suporte */}
              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-600 mb-2">
                  Precisa de ajuda? Entre em contato conosco:
                </p>
                <a 
                  href="mailto:suporte@asoflow.com.br"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  suporte@asoflow.com.br
                </a>
                <p className="text-sm text-gray-500 mt-4">
                  Horário de atendimento: Segunda a Sexta, 9h às 18h
                </p>
              </div>
            </div>
          </div>

          {/* Garantia */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-200">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">
                Garantia de <strong className="text-green-600">7 dias</strong> - Satisfação garantida ou seu dinheiro de volta
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 pt-8 pb-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-briefcase.png" 
                alt="ASOflow Logo" 
                width={32}
                height={32}
                className="object-contain"
              />
              <div>
                <span className="text-lg font-bold text-gray-900">ASOflow</span>
                <p className="text-xs text-gray-500">Gestão Inteligente de ASOs</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 ASOflow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-900 text-lg font-medium">Processando seu pagamento...</p>
        <p className="text-gray-600 text-sm mt-2">Por favor, aguarde</p>
      </div>
    </div>
  );
}