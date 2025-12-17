// MESMA ESTRUTURA, mas mudando:
// - planoId: 'profissional_mensal'
// - planoNome: 'Profissional'
// - valor: 397.00  
// - router.push('/app/pagamentos/tres')
// - Textos do plano Profissional

'use client';

import React, { useState } from 'react';
import { CheckCircle, Lock, Shield, ArrowRight, Loader2, AlertCircle, Check, Award, Zap, Users, BarChart3, Globe, Cloud } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CadastroProfissionalPage() {
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
        planoId: 'profissional_mensal',
        planoNome: 'Profissional',
        valor: 397.00,
        timestamp: Date.now()
      };
      
      localStorage.setItem('pending_account', JSON.stringify(cadastroData));
      console.log('✅ Dados salvos! Redirecionando para /app/pagamentos/tres');
      router.push('/app/pagamentos/tres');
      
    } catch (error) {
      console.error('❌ Erro:', error);
      setErrors({ submit: 'Erro ao processar. Tente novamente.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo-briefcase.png" alt="ASOflow" width={32} height={32} />
              <div>
                <span className="text-lg font-bold text-gray-900">ASOflow</span>
                <p className="text-xs text-blue-600">Solução Corporativa Profissional</p>
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
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-800 to-indigo-800 text-white text-sm font-bold rounded-full mb-4">
              SOLUÇÃO CORPORATIVA
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Plano Profissional
            </h1>
            <p className="text-xl text-gray-600">
              Para empresas que exigem excelência: <span className="font-bold text-blue-600">R$ 397/mês</span>
            </p>
            <p className="text-gray-600 mt-2">
              + <span className="font-bold text-green-600">14 dias grátis</span> para avaliação completa
            </p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500 inline mr-2" />
              {errors.submit}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border rounded-xl p-8">
                <h3 className="text-lg font-bold mb-4">Solução Completa Corporativa:</h3>
                <ul className="space-y-3">
                  {[
                    'Tudo do Essencial +',
                    '10 usuários RH (+5)',
                    '5.000 alertas/mês',
                    'Dashboard gerencial avançado',
                    'Relatórios customizados',
                    'Relatório de compliance por departamento',
                    'Relatório de auditoria (assinatura digital)',
                    'Exportação de gráficos (PNG/PDF)',
                    'Filtro por período (30/90/180/365 dias)',
                    'Suporte prioritário (4h)',
                    'Treinamento de equipe (1 sessão 1h)'
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t">
                  <div className="text-3xl font-bold text-blue-600">R$ 397<span className="text-gray-600 text-base">/mês</span></div>
                  <p className="text-sm text-green-600">ou R$ 337/mês no plano anual (economize R$ 720)</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Até 200 funcionários</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold mb-4">Recursos Principais:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, text: '200 funcionários' },
                    { icon: BarChart3, text: 'Dashboard' },
                    { icon: Globe, text: '5 unidades' },
                    { icon: Cloud, text: 'Backup' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Cadastro Solução Profissional</h2>
                <p className="text-sm text-gray-600">Preencha para iniciar teste de 14 dias</p>
              </div>
              
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
                  className="w-full py-4 bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 text-white font-bold rounded-lg flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                  ) : (
                    <><span>Contratar Solução Profissional</span><ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    14 dias de teste gratuito • Sem compromisso
                  </p>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">SLA 99.9%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-500">SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}