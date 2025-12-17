'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Shield, CreditCard, Loader2, Sparkles, QrCode, Barcode, Banknote, ExternalLink, CheckCircle, Zap, Users, BarChart3, Globe, Cloud, Award, Calendar, CalendarDays, Mail, User, Phone, Building, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Toaster, toast } from 'react-hot-toast';

export default function PagamentosTresPage() {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cadastroData, setCadastroData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [retryCount, setRetryCount] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [planType, setPlanType] = useState('monthly');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', empresa: '', senha: '', confirmarSenha: '', aceiteTermos: false });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const data = localStorage.getItem('pending_account') || localStorage.getItem('cadastroData');
    if (data) {
      try {
        setCadastroData(JSON.parse(data));
      } catch (error) {
        console.error('Erro ao parsear dados:', error);
      }
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
    if (!formData.telefone.trim()) errors.telefone = 'Telefone é obrigatório';
    if (formData.senha.length < 6) errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.senha !== formData.confirmarSenha) errors.confirmarSenha = 'Senhas não coincidem';
    if (!formData.aceiteTermos) errors.aceiteTermos = 'Você deve aceitar os termos';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    setIsSigningUp(true);
    setErrorMessage('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: { data: { nome: formData.nome, telefone: formData.telefone, empresa: formData.empresa, plano: 'Profissional', plano_tipo: planType } }
      });
      if (authError) {
        if (authError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.senha });
          if (signInError) throw new Error('Email já cadastrado. Tente fazer login com a senha correta.');
        } else throw authError;
      }
      const { error: profileError } = await supabase.from('users').upsert({
        id: authData?.user?.id || 'temp-id-' + Date.now(),
        email: formData.email, nome: formData.nome, telefone: formData.telefone, empresa: formData.empresa,
        plano: 'Profissional', plano_tipo: planType, status: 'pending_payment',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });
      if (profileError && !profileError.message.includes('duplicate key')) console.error('Erro ao criar perfil:', profileError);
      const userData = { nome: formData.nome, email: formData.email, telefone: formData.telefone, empresa: formData.empresa, userId: authData?.user?.id || 'temp-' + Date.now() };
      localStorage.setItem('pending_account', JSON.stringify(userData));
      setCadastroData(userData);
      toast.success('Conta criada com sucesso! Agora escolha sua forma de pagamento.');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrorMessage(error.message || 'Erro ao criar conta. Tente novamente.');
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsSigningUp(false);
    }
  };

  const planoInfo = {
    id: planType === 'monthly' ? 'profissional_mensal' : 'profissional_anual',
    name: 'Profissional', monthlyValue: 397, annualValue: 337, totalAnnual: 4044, savings: 720,
    beneficios: ['Até 200 funcionários', '10 usuários RH', 'Dashboard gerencial avançado', 'Relatórios customizados', '5.000 alertas/mês']
  };

  const getCurrentPlanValue = () => planType === 'monthly' ? planoInfo.monthlyValue : planoInfo.totalAnnual;

  const createMercadoPagoPreference = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      setErrorMessage('');
      if (!cadastroData) throw new Error('Por favor, complete o cadastro primeiro.');
      const orderData = {
        planId: planoInfo.id,
        planName: `ASOflow - Plano ${planoInfo.name} (${planType === 'monthly' ? 'Mensal' : 'Anual'})`,
        price: getCurrentPlanValue(), email: cadastroData.email, name: cadastroData.nome,
        userId: cadastroData.userId, isAnnual: planType === 'annual',
        back_urls: {
          success: `${window.location.origin}/pagamentos/sucesso?user=${cadastroData.userId}&plan=${planoInfo.id}`,
          failure: `${window.location.origin}/pagamentos/falha`,
          pending: `${window.location.origin}/pagamentos/pendente`
        }
      };
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }
      const data = await response.json();
      if (data.status && data.status !== "success") throw new Error(data.error || 'Erro ao criar preferência');
      const checkoutUrl = data.init_point || data.sandbox_init_point;
      if (!checkoutUrl) throw new Error('URL de pagamento não foi gerada');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro no pagamento:', error);
      const errorMsg = error.message || 'Erro ao processar pagamento';
      setPaymentError(errorMsg);
      toast.error(errorMsg);
      if (retryCount < 2) {
        setTimeout(() => { setRetryCount(prev => prev + 1); createMercadoPagoPreference(); }, 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!cadastroData) { toast.error('Complete o cadastro primeiro'); return; }
    await createMercadoPagoPreference();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Toaster position="top-right" />
      
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo-briefcase.png" alt="ASOflow Logo" width={40} height={40} className="object-contain" priority />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">ASOflow</span>
                <p className="text-xs text-gray-500">Solução Profissional para Gestão de ASO</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className={`flex items-center ${!cadastroData ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!cadastroData ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                  {!cadastroData ? '1' : <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="ml-2 font-medium">Cadastro</span>
              </div>
              <div className={`w-16 md:w-24 h-1 mx-4 ${cadastroData ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${cadastroData ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cadastroData ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                <span className="ml-2 font-medium">Pagamento</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">PLANO PROFISSIONAL</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Transforme sua Gestão de ASO</h1>
            <p className="text-xl text-gray-600 mb-8">Tudo o que sua empresa precisa para compliance total</p>
          </div>

          {!cadastroData ? (
            // ETAPA 1: CADASTRO
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta</h2>
                <p className="text-gray-600 mb-6">Preencha os dados para começar</p>
                
                <div className="space-y-4">
                  {['nome', 'email', 'telefone', 'empresa'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          {field === 'nome' && <User className="w-4 h-4" />}
                          {field === 'email' && <Mail className="w-4 h-4" />}
                          {field === 'telefone' && <Phone className="w-4 h-4" />}
                          {field === 'empresa' && <Building className="w-4 h-4" />}
                          {field.charAt(0).toUpperCase() + field.slice(1)} {field !== 'empresa' && '*'}
                        </div>
                      </label>
                      <input
                        type={field === 'email' ? 'email' : field === 'telefone' ? 'tel' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${formErrors[field] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder={field === 'email' ? 'seu@email.com' : field === 'telefone' ? '(11) 99999-9999' : ''}
                      />
                      {formErrors[field] && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{formErrors[field]}</p>}
                    </div>
                  ))}

                  {['senha', 'confirmarSenha'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{field === 'senha' ? 'Senha' : 'Confirmar senha'} *</label>
                      <div className="relative">
                        <input
                          type={field === 'senha' ? (showPassword ? "text" : "password") : (showConfirmPassword ? "text" : "password")}
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${formErrors[field] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12`}
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button type="button" onClick={() => field === 'senha' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                          {(field === 'senha' ? showPassword : showConfirmPassword) ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors[field] && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{formErrors[field]}</p>}
                    </div>
                  ))}

                  <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" name="aceiteTermos" checked={formData.aceiteTermos} onChange={handleInputChange}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-600">Concordo com os <a href="#" className="text-blue-600 font-medium hover:underline">Termos de Uso</a> e <a href="#" className="text-blue-600 font-medium hover:underline">Política de Privacidade</a></span>
                    </label>
                    {formErrors.aceiteTermos && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{formErrors.aceiteTermos}</p>}
                  </div>

                  <button onClick={handleSignUp} disabled={isSigningUp}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-lg rounded-lg transition-all hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-6">
                    {isSigningUp ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Criando conta...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        <span>Criar conta e continuar</span>
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>

                  {errorMessage && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Plano Profissional</h3>
                  <div className="space-y-3 mb-6">
                    {planoInfo.beneficios.map((beneficio, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{beneficio}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-blue-200">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">R$ {planoInfo.monthlyValue}</span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    <p className="text-sm text-gray-600">ou R$ {planoInfo.annualValue}/mês no plano anual</p>
                  </div>
                </div>

                <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8" />
                    <h3 className="text-xl font-bold">Garantia de Segurança</h3>
                  </div>
                  <p className="text-blue-100">Seus dados estão protegidos com criptografia de ponta a ponta. Aceitamos todas as principais formas de pagamento.</p>
                </div>
              </div>
            </div>
          ) : (
            // ETAPA 2: PAGAMENTO
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-200 rounded-2xl p-6 shadow-xl sticky top-24">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-green-700">Conta criada!</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumo da compra</h3>
                  
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-900 font-medium">{cadastroData.nome}</p>
                      <p className="text-gray-600 text-sm">{cadastroData.email}</p>
                      {cadastroData.telefone && <p className="text-gray-600 text-sm">{cadastroData.telefone}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Plano Profissional</span>
                      <span className="font-medium">{planType === 'monthly' ? 'Mensal' : 'Anual'}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-medium">
                      <span>{planType === 'monthly' ? 'Valor mensal' : 'Valor total'}</span>
                      <span>R$ {getCurrentPlanValue().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-blue-600">R$ {getCurrentPlanValue().toFixed(2)}</span>
                    </div>
                    {planType === 'annual' && (
                      <p className="text-sm text-green-600 font-medium">✓ Você está economizando R$ {planoInfo.savings}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecione o período</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <button onClick={() => setPlanType('monthly')}
                      className={`p-6 border-2 rounded-2xl text-left transition-all ${planType === 'monthly' ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${planType === 'monthly' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <Calendar className={`w-5 h-5 ${planType === 'monthly' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <h3 className="text-lg font-semibold">Mensal</h3>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        R$ {planoInfo.monthlyValue.toFixed(2)}
                        <span className="text-gray-600 text-base font-normal">/mês</span>
                      </div>
                      <p className="text-sm text-gray-600">Renovação mensal automática</p>
                    </button>
                    
                    <button onClick={() => setPlanType('annual')}
                      className={`p-6 border-2 rounded-2xl text-left relative transition-all ${planType === 'annual' ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        ECONOMIZE 20%
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${planType === 'annual' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <CalendarDays className={`w-5 h-5 ${planType === 'annual' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <h3 className="text-lg font-semibold">Anual</h3>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        R$ {planoInfo.annualValue.toFixed(2)}
                        <span className="text-gray-600 text-base font-normal">/mês*</span>
                      </div>
                      <p className="text-sm text-gray-600">Total anual: R$ {planoInfo.totalAnnual.toFixed(2)}</p>
                      <p className="text-sm text-green-600 font-medium mt-2">↓ Economia de R$ {planoInfo.savings}</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Forma de pagamento</h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {[
                      { id: 'card', icon: CreditCard, title: 'Cartão de crédito', desc: 'Parcele em até 12x' },
                      { id: 'pix', icon: QrCode, title: 'PIX', desc: 'Pagamento instantâneo' },
                      { id: 'boleto', icon: Barcode, title: 'Boleto', desc: 'Até 3 dias úteis' },
                      { id: 'all', icon: Banknote, title: '+ Opções', desc: 'Débito e outras formas' }
                    ].map((method) => (
                      <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                        className={`p-5 border-2 rounded-xl text-left transition-all ${paymentMethod === method.id ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${paymentMethod === method.id ? 'bg-blue-600' : 'bg-gray-100'}`}>
                          <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <h4 className="text-lg font-semibold mb-1">{method.title}</h4>
                        <p className="text-sm text-gray-600">{method.desc}</p>
                      </button>
                    ))}
                  </div>
                  
                  {paymentError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {paymentError}
                      </p>
                    </div>
                  )}
                  
                  <button onClick={handlePayment} disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Processando pagamento...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        <span>Finalizar pagamento - R$ {getCurrentPlanValue().toFixed(2)}</span>
                        <ExternalLink className="w-6 h-6" />
                      </>
                    )}
                  </button>
                  
                  <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Pagamento 100% seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span>Dados criptografados</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>&copy; 2024 ASOflow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}