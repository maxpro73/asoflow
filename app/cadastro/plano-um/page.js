// MESMA ESTRUTURA, mas mudando:
// - planoId: 'essencial_mensal'
// - planoNome: 'Essencial'
// - valor: 197.00
// - router.push('/app/pagamentos/dois')
// - Textos do plano Essencial

'use client';

import React, { useState } from 'react';
import { CheckCircle, Lock, Shield, ArrowRight, Loader2, AlertCircle, Check, Calendar, Bell, FileText, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CadastroEssencialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', empresa: '', senha: '', confirmarSenha: ''
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
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
    validateField(e.target.name, e.target.value);
  };

  const formatPhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length <= 10 
      ? numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      : numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
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
      case 'nome': if (!value.trim()) error = 'Nome obrigatório'; break;
      case 'email': if (!value.trim()) error = 'Email obrigatório'; else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email inválido'; break;
      case 'telefone': if (value.replace(/\D/g, '').length < 10) error = 'Telefone inválido'; break;
      case 'empresa': if (!value.trim()) error = 'Empresa obrigatória'; break;
      case 'senha': if (value.length < 6) error = 'Mínimo 6 caracteres'; break;
      case 'confirmarSenha': if (value !== formData.senha) error = 'Senhas não conferem'; break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) isValid = false;
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
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const cadastroData = {
        email: formData.email.trim().toLowerCase(),
        nome: formData.nome.trim(),
        empresa: formData.empresa.trim(),
        telefone: formData.telefone.replace(/\D/g, ''),
        senha: formData.senha,
        planoId: 'essencial_mensal',
        planoNome: 'Essencial',
        valor: 197.00,
        timestamp: Date.now()
      };
      
      localStorage.setItem('pending_account', JSON.stringify(cadastroData));
      console.log('✅ Dados salvos! Redirecionando para /app/pagamentos/dois');
      router.push('/app/pagamentos/dois');
      
    } catch (error) {
      console.error('❌ Erro:', error);
      setErrors({ submit: 'Erro ao processar. Tente novamente.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo-briefcase.png" alt="ASOflow" width={32} height={32} />
              <div>
                <span className="text-lg font-bold text-gray-900">ASOflow</span>
                <p className="text-xs text-gray-500">Plano Essencial</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plano Essencial - Ideal para Pequenas Empresas
            </h1>
            <p className="text-lg text-gray-600">10-50 funcionários</p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500 inline mr-2" />
              {errors.submit}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white border rounded-xl p-8">
              <h3 className="text-lg font-bold mb-4">Incluso no Plano Essencial:</h3>
              <ul className="space-y-3">
                {[
                  'Tudo do Early Bird +',
                  '5 usuários RH (+2)',
                  '2.000 alertas/mês garantidos',
                  'Dashboard com filtros avançados',
                  'Tags personalizadas',
                  'Suporte email + WhatsApp (12h)',
                  'Onboarding ao vivo (30min)'
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t">
                <div className="text-2xl font-bold">R$ 197<span className="text-gray-600 text-base">/mês</span></div>
                <p className="text-sm text-green-600">ou R$ 167/mês no plano anual</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-8">
              <h2 className="text-xl font-bold mb-6">Cadastro Plano Essencial</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {['nome', 'email', 'telefone', 'empresa', 'senha', 'confirmarSenha'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {field === 'confirmarSenha' ? 'Confirmar Senha' : field} *
                      </label>
                      <input
                        type={field.includes('senha') ? 'password' : field === 'email' ? 'email' : field === 'telefone' ? 'tel' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={field === 'telefone' ? handlePhoneChange : handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${errors[field] && touched[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                        disabled={isLoading}
                      />
                      {errors[field] && touched[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                  ) : (
                    <><span>Continuar para Pagamento</span><ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}