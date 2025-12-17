"use client"

import { useState } from 'react'
import { MessageCircle, Send, Save, Clock, CheckCircle, XCircle, Users } from 'lucide-react'

interface Notification {
  id: number
  type: 'whatsapp'
  title: string
  date: string
  status: 'sent' | 'pending' | 'failed'
  recipients: number
}

export default function NotificacoesView() {
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    message: ''
  })

  const [history, setHistory] = useState<Notification[]>([
    {
      id: 1,
      type: 'whatsapp',
      title: 'Comunicado Importante: Feriado',
      date: '14/07/2024 às 17:02',
      status: 'sent',
      recipients: 32
    },
    {
      id: 2,
      type: 'whatsapp',
      title: 'Confirmação de Agendamento',
      date: '10/07/2024 às 14:20',
      status: 'failed',
      recipients: 12
    },
    {
      id: 3,
      type: 'whatsapp',
      title: 'Lembrete: Vencimento de ASO',
      date: '15/07/2024 às 10:30',
      status: 'sent',
      recipients: 45
    }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSend = () => {
    if (!formData.recipients || !formData.subject || !formData.message) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const newNotification: Notification = {
      id: history.length + 1,
      type: 'whatsapp',
      title: formData.subject,
      date: new Date().toLocaleString('pt-BR'),
      status: 'sent',
      recipients: Math.floor(Math.random() * 50) + 10
    }

    setHistory([newNotification, ...history])
    setFormData({ recipients: '', subject: '', message: '' })
    alert('Notificação enviada com sucesso!')
  }

  const handleSaveDraft = () => {
    alert('Rascunho salvo com sucesso!')
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'sent': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
      case 'pending': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'failed': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20'
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'sent': return 'Enviado'
      case 'pending': return 'Pendente'
      case 'failed': return 'Falhou'
      default: return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'sent': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notificações WhatsApp</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Envie notificações por WhatsApp para seus funcionários
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seção de Criação de Notificação */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Criar Nova Notificação
                </h2>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-6 space-y-6">
              {/* Destinatários */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Destinatários
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="recipients"
                    value={formData.recipients}
                    onChange={handleInputChange}
                    placeholder="Selecione clientes ou grupos..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Assunto */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Digite o assunto aqui..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Escreva sua mensagem..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none resize-none transition text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Dica: Mensagens curtas e diretas têm melhor taxa de leitura no WhatsApp
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <Save className="w-5 h-5" />
                  Salvar Rascunho
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium text-white rounded-lg transition bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-5 h-5" />
                  Enviar Notificação
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Envios */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Histórico de Envios
              </h2>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {item.date}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {getStatusText(item.status)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {item.recipients} destinatários
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}