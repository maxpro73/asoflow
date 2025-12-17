'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, User, LogOut, Building2, CreditCard,
  Bell, Shield, ChevronDown, Check
} from 'lucide-react';

export default function MenuConfiguracoes() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Função de logout
  const handleLogout = () => {
    setIsLoggingOut(true);

    // Limpar dados do usuário
    try {
      // Limpar localStorage
      localStorage.removeItem('asoflow_user');
      localStorage.removeItem('asoflow_token');
      localStorage.removeItem('asoflow_payment');
      
      // Limpar sessionStorage
      sessionStorage.clear();

      // Se você estiver usando cookies, limpe aqui também:
      // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Aqui você pode fazer uma chamada para a API de logout:
      // await fetch('/api/auth/logout', { method: 'POST' });

    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }

    // Redirecionar para página de login
    setTimeout(() => {
      router.push('/login');
      // Ou router.push('/') se quiser ir para home
    }, 500);
  };

  const menuItems = [
    {
      icon: Building2,
      label: 'Perfil da Empresa',
      action: () => {
        setIsOpen(false);
        router.push('/perfil');
      },
      color: 'text-blue-600'
    },
    {
      icon: User,
      label: 'Minha Conta',
      action: () => {
        setIsOpen(false);
        router.push('/conta');
      },
      color: 'text-gray-600'
    },
    {
      icon: CreditCard,
      label: 'Assinatura',
      action: () => {
        setIsOpen(false);
        router.push('/assinatura');
      },
      color: 'text-gray-600'
    },
    {
      icon: Bell,
      label: 'Notificações',
      action: () => {
        setIsOpen(false);
        router.push('/notificacoes');
      },
      color: 'text-gray-600'
    },
    {
      icon: Shield,
      label: 'Segurança',
      action: () => {
        setIsOpen(false);
        router.push('/seguranca');
      },
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* BOTÃO DE CONFIGURAÇÕES */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all ${
          isOpen
            ? 'bg-blue-50 text-blue-600'
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Configurações"
      >
        <Settings className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
          
          {/* HEADER DO MENU */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Configurações</h3>
            <p className="text-xs text-gray-500 mt-0.5">Gerencie sua conta e preferências</p>
          </div>

          {/* ITENS DO MENU */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors`}>
                  <item.icon className={`w-5 h-5 ${item.color} group-hover:text-blue-600 transition-colors`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
              </button>
            ))}
          </div>

          {/* LOGOUT */}
          <div className="border-t border-gray-200 pt-2 pb-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-600 text-sm">
                  {isLoggingOut ? 'Saindo...' : 'Sair do Sistema'}
                </p>
                {!isLoggingOut && (
                  <p className="text-xs text-red-500">Desconectar da sua conta</p>
                )}
              </div>
            </button>
          </div>

          {/* VERSÃO */}
          <div className="px-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              ASOflow v1.0.0
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY (opcional, para mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}