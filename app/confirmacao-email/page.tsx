// app/confirmacao-email/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function ConfirmacaoEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [timer, setTimer] = useState(60)
  
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])
  
  const handleReenviar = () => {
    // Lógica para reenviar email
    setTimer(60)
    alert('Email reenviado! Verifique sua caixa de entrada.')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Confirme seu email</h1>
          <p className="text-gray-600 mt-2">
            Enviamos um link de confirmação para:
          </p>
          <p className="font-medium text-gray-900 mt-1">{email}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Verifique sua caixa de entrada</p>
              <p className="text-blue-700 text-sm mt-1">
                Clique no link do email para ativar sua conta. Se não encontrar, verifique a pasta de spam.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Fazer login após confirmar
          </button>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Não recebeu o email?{' '}
              <button
                onClick={handleReenviar}
                disabled={timer > 0}
                className={`font-medium ${timer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
              >
                Reenviar {timer > 0 ? `(${timer}s)` : ''}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}