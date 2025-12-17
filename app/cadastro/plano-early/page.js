'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Lock, Shield, ArrowRight, 
  Loader2, AlertCircle, Check,
  Calendar, Bell, FileText, User
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CadastroEarlyBirdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const formatPhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
    setTouched(prev => ({ ...prev, telefone: true }));
    validateField('telefone', formatted);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nome':
        if (!value.trim()) error = 'Nome é obrigatório';
        else if (value.trim().length < 3) error = 'Nome muito curto';
        break;
      case 'email':
        if (!value.trim()) error = 'Email é obrigatório';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email inválido';
        break;
      case 'telefone':
        const phoneNumbers = value.replace(/\D/g, '');
        if (!value.trim()) error = 'Telefone é obrigatório';
        else if (phoneNumbers.length < 10) error = 'Telefone inválido';
        break;
      case 'empresa':
        if (!value.trim()) error = 'Empresa é obrigatória';
        else if (value.trim().length < 2) error = 'Nome da empresa muito curto';
        break;
      case 'senha':
        if (!value) error = 'Senha é obrigatória';
        else if (value.length < 6) error = 'Mínimo 6 caracteres';
        break;
      case 'confirmarSenha':
        if (value !== formData.senha) error = 'As senhas não conferem';
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    Object.keys(formData).forEach(key => {
      const fieldValid = validateField(key, formData[key]);
      if (!fieldValid) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    const allTouched = {};
    Object.keys(formData).forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);
    
    const isValid = validateForm();
    
    if (!isValid) {
      setIsLoading(false);
      return;
    }
    
    try {
      const email = formData.email.trim().toLowerCase();
      const nome = formData.nome.trim();
      const empresa = formData.empresa.trim();
      const telefone = formData.telefone.replace(/\D/g, '');
      
      console.log('📝 Salvando dados para pagamento Early Bird...');
      
      // Salvar dados temporários para uso na página de pagamento
      const cadastroData = {
        email: email,
        nome: nome,
        empresa: empresa,
        telefone: telefone,
        senha: formData.senha,
        planoId: 'early_bird_mensal',
        planoNome: 'Early Bird',
        valor: 79.90,
        timestamp: Date.now()
      };
      
      // Salvar no localStorage para a página de pagamento usar
      localStorage.setItem('pending_account', JSON.stringify(cadastroData));
      
      console.log('✅ Dados salvos! Redirecionando para /app/pagamentos/um');
      
      // Redirecionar para página de pagamento Early Bird
      router.push('/app/pagamentos/um');
      
    } catch (error) {
      console.error('❌ Erro:', error);
      setErrors({ submit: 'Erro ao processar. Tente novamente.' });
      setIsLoading(false);
    }
  };

  const beneficios = [
    { icon: CheckCircle, text: 'Gestão completa de ASOs' },
    { icon: User, text: 'Controle de funcionários' },
    { icon: Calendar, text: 'Agendamento automatizado' },
    { icon: Bell, text: 'Lembretes e notificações' },
    { icon: FileText, text: 'Laudos automáticos' },
    { icon: Shield, text: 'Segurança de dados' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image src="/logo-briefcase.png" alt="ASOflow" width={32} height={32} className="object-contain" priority />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">ASOflow</span>
                <p className="text-xs text-gray-500">Plano Early Bird</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Já tem conta? <a href="/login" className="text-blue-600 hover:underline font-medium">Entre aqui</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-full mb-4">
              OFERTA LIMITADA - EARLY BIRD
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Primeiros 50 Clientes - Preço Travado pra Sempre
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Garanta R$ 79,90/mês para sempre. Sem aumento de preço, nunca!
            </p>
          </div>

          {errors.submit && (
            <div className="mb-6 max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <p className="text-red-700 font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Benefícios Early Bird</h2>
                <div className="space-y-4">
                  {beneficios.map((beneficio, index) => {
                    const IconComponent = beneficio.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                          <IconComponent className="w-4 h-4 text-gray-700" />
                        </div>
                        <h3 className="text-gray-900 text-sm font-medium">{beneficio.text}</h3>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Incluso no Plano:</h3>
                <ul className="space-y-3">
                  {[
                    'Até 100 funcionários',
                    '3 usuários RH',
                    '1 unidade/empresa',
                    'Alertas Email + WhatsApp ilimitados',
                    'Dashboard básico',
                    'Histórico de alertas (12 meses)',
                    'Upload de ASOs (PDF)',
                    'Relatório simples (PDF)',
                    'Suporte por email (24h)',
                    'Onboarding automático'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">R$ 79,90</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-orange-600 font-bold mt-1">
                    ⚡ Preço travado para sempre!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Garantir Oferta Early Bird
                </h2>
                <p className="text-sm text-gray-600">
                  Preencha seus dados e garanta seu preço especial
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-white border ${errors.nome && touched.nome ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      placeholder="Seu nome"
                      disabled={isLoading}
                    />
                    {errors.nome && touched.nome && (
                      <p className="text-red-600 text-sm mt-1">{errors.nome}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-white border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      placeholder="seu@email.com"
                      disabled={isLoading}
                    />
                    {errors.email && touched.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-white border ${errors.telefone && touched.telefone ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      placeholder="(11) 99999-9999"
                      disabled={isLoading}
                    />
                    {errors.telefone && touched.telefone && (
                      <p className="text-red-600 text-sm mt-1">{errors.telefone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-white border ${errors.empresa && touched.empresa ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      placeholder="Sua empresa"
                      disabled={isLoading}
                    />
                    {errors.empresa && touched.empresa && (
                      <p className="text-red-600 text-sm mt-1">{errors.empresa}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
                    <input
                      type="password"
                      name="senha"
                      value={formData.senha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-white border ${errors.senha && touched.senha ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      placeholder="Mínimo 6 caracteres"
                      disabled={isLoading}
                    />
                    {errors.senha && touched.senha && (
                      <p className="text-red-600 text-sm mt-1">{errors.senha}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha *</label>
                    <input
                      type="password"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-white border ${errors.confirmarSenha && touched.confirmarSenha ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      placeholder="Confirme a senha"
                      disabled={isLoading}
                    />
                    {errors.confirmarSenha && touched.confirmarSenha && (
                      <p className="text-red-600 text-sm mt-1">{errors.confirmarSenha}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>Garantir Oferta Early Bird</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Após preencher, você será direcionado para o pagamento seguro
                  </p>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-900 font-medium">100% Seguro</p>
                      <p className="text-xs text-gray-500">Dados protegidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-500">SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}