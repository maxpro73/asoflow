import { useState } from 'react'
import { Menu, X, Home, Users, FileText, Bell, Settings, LogOut, Briefcase, Calendar, BarChart3, Download, Eye, CheckCircle, AlertTriangle, Clock, ChevronRight, Filter, Search, UserPlus, FileUp, Printer } from 'lucide-react'

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'funcionarios', label: 'Funcionários', icon: Users },
    { id: 'certificados', label: 'Certificados ASO', icon: FileText },
    { id: 'planos', label: 'Planos de Ação', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ]

  const handleMenuClick = (sectionId: string) => {
    console.log('Navegando para:', sectionId)
    setActiveSection(sectionId)
    setIsOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Mobile */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg">ASOflow</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {menuItems.find(item => item.id === activeSection)?.label}
              </p>
            </div>
          </div>

          {/* Menu Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            )}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header do Menu */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">ASOflow</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestão de ASO</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="text-left">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-slate-200 dark:border-slate-700" />

        {/* Seção de Configurações e Logout */}
        <div className="px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>

        {/* Footer do Menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">U</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Usuário Demo</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">usuario@empresa.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="p-4 pb-32">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Atualizado há 5 min</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total ASOs</p>
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">24</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Válidos</p>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">18</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">75% do total</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">A Vencer</p>
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">4</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">30 dias</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Vencidos</p>
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">2</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Precisa atenção</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Atividades Recentes</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Novo funcionário</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">João Silva cadastrado</p>
                    </div>
                    <span className="text-xs text-slate-400">2h atrás</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <FileUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">ASO atualizado</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Maria Santos - Periódico</p>
                    </div>
                    <span className="text-xs text-slate-400">1 dia atrás</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Funcionários */}
        {activeSection === 'funcionarios' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Funcionários</h2>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar funcionário..."
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    + Novo
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'João Silva', role: 'Produção', status: 'ativo', aso: 'válido', expiry: '15/03/2025' },
                  { name: 'Maria Santos', role: 'Administrativo', status: 'ativo', aso: 'a vencer', expiry: '10/01/2025' },
                  { name: 'Pedro Costa', role: 'Manutenção', status: 'ativo', aso: 'válido', expiry: '20/04/2025' },
                  { name: 'Ana Oliveira', role: 'Produção', status: 'inativo', aso: 'vencido', expiry: '05/11/2024' },
                  { name: 'Carlos Lima', role: 'Qualidade', status: 'ativo', aso: 'válido', expiry: '30/06/2025' },
                ].map((employee, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-semibold">{employee.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{employee.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{employee.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          employee.aso === 'válido' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : employee.aso === 'a vencer'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          ASO {employee.aso}
                        </span>
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Certificados ASO */}
        {activeSection === 'certificados' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Certificados ASO</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filtrar</span>
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    + Novo ASO
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { type: 'Admissional', employee: 'João Silva', status: 'válido', expiry: '15/03/2025', color: 'green' },
                  { type: 'Periódico', employee: 'Maria Santos', status: 'a vencer', expiry: '10/01/2025', color: 'orange' },
                  { type: 'Mudança de Função', employee: 'Pedro Costa', status: 'válido', expiry: '20/04/2025', color: 'green' },
                  { type: 'Retorno ao Trabalho', employee: 'Ana Oliveira', status: 'vencido', expiry: '05/11/2024', color: 'red' },
                  { type: 'Demissional', employee: 'Carlos Lima', status: 'válido', expiry: '30/06/2025', color: 'green' },
                ].map((cert, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          cert.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                          cert.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            cert.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            cert.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-900 dark:text-white">{cert.type}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cert.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              cert.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {cert.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{cert.employee}</p>
                          <p className="text-xs text-slate-400">Válido até {cert.expiry}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Planos de Ação */}
        {activeSection === 'planos' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Planos de Ação</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  + Novo Plano
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    title: 'Renovação ASOs - Setor Produção', 
                    status: 'em-andamento', 
                    progress: 60,
                    description: 'Agendar exames para 5 funcionários até 20/12/2024',
                    deadline: '20/12/2024',
                    responsible: 'João Silva',
                    color: 'orange'
                  },
                  { 
                    title: 'Integração Novos Funcionários', 
                    status: 'planejado', 
                    progress: 20,
                    description: 'Exames admissionais para 3 novos contratados',
                    deadline: '15/12/2024',
                    responsible: 'Maria Santos',
                    color: 'blue'
                  },
                  { 
                    title: 'Exames Periódicos Q4 2024', 
                    status: 'concluído', 
                    progress: 100,
                    description: 'Todos os exames periódicos do trimestre foram realizados',
                    deadline: '30/11/2024',
                    responsible: 'Pedro Costa',
                    color: 'green'
                  },
                ].map((plano, index) => (
                  <div key={index} className={`rounded-lg p-4 border ${
                    plano.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                    plano.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Calendar className={`w-5 h-5 ${
                          plano.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          plano.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          'text-green-600 dark:text-green-400'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-900 dark:text-white">{plano.title}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              plano.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                              plano.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                              {plano.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{plano.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Responsável</p>
                            <p className="font-medium text-slate-900 dark:text-white">{plano.responsible}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Prazo</p>
                            <p className="font-medium text-slate-900 dark:text-white">{plano.deadline}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 dark:text-slate-400">Progresso</p>
                          <p className={`font-bold ${
                            plano.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            plano.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>{plano.progress}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${
                            plano.color === 'orange' ? 'bg-orange-600 dark:bg-orange-500' :
                            plano.color === 'blue' ? 'bg-blue-600 dark:bg-blue-500' :
                            'bg-green-600 dark:bg-green-500'
                          }`} style={{ width: `${plano.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Relatórios */}
        {activeSection === 'relatorios' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Relatórios</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Período</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Resumo Estatístico */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Resumo do Período (Últimos 30 dias)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">+12%</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Exames Realizados</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">+5%</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">95%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Taxa de Aptidão</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">-3%</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">6</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pendências</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">0%</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Setores Ativos</p>
                    </div>
                  </div>
                </div>

                {/* Relatórios Disponíveis */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Relatórios Disponíveis
                  </h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Relatório Mensal', period: 'Novembro 2024', type: 'pdf', color: 'blue' },
                      { title: 'Relatório por Setor', period: 'Produção - Q4 2024', type: 'excel', color: 'green' },
                      { title: 'Análise de Conformidade', period: 'Ano 2024', type: 'view', color: 'purple' },
                      { title: 'Auditoria ASO', period: 'Trimestre 2024.4', type: 'pdf', color: 'orange' },
                    ].map((report, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              report.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              report.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                              report.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                              'bg-orange-100 dark:bg-orange-900/30'
                            }`}>
                              <FileText className={`w-5 h-5 ${
                                report.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                report.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                report.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                'text-orange-600 dark:text-orange-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{report.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{report.period}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                              <Download className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                              <Printer className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico Simplificado */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Tendência de Exames (Últimos 6 meses)
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-end justify-between h-40 gap-2 mb-4">
                      {[
                        { month: 'Jul', value: 45, color: 'from-blue-200 to-blue-300' },
                        { month: 'Ago', value: 60, color: 'from-blue-300 to-blue-400' },
                        { month: 'Set', value: 75, color: 'from-blue-400 to-blue-500' },
                        { month: 'Out', value: 85, color: 'from-blue-500 to-blue-600' },
                        { month: 'Nov', value: 100, color: 'from-blue-600 to-blue-700' },
                        { month: 'Dez', value: 70, color: 'from-blue-400 to-blue-500' },
                      ].map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full bg-gradient-to-b ${item.color} dark:bg-blue-800 rounded-t-lg`} 
                               style={{ height: `${item.value}%` }}>
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">{item.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Julho 2024</span>
                      <span>Dezembro 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notificações */}
        {activeSection === 'notificacoes' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notificações</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  Marcar todas como lidas
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    type: 'alerta', 
                    title: 'ASO próximo do vencimento', 
                    message: '3 funcionários com ASO vencendo nos próximos 30 dias', 
                    time: 'Hoje, 09:30',
                    color: 'orange'
                  },
                  { 
                    type: 'informacao', 
                    title: 'Novo funcionário cadastrado', 
                    message: 'Carlos Lima foi cadastrado no sistema', 
                    time: 'Ontem, 14:20',
                    color: 'blue'
                  },
                  { 
                    type: 'sucesso', 
                    title: 'Exame concluído', 
                    message: 'ASO periódico de Maria Santos foi registrado', 
                    time: 'Ontem, 11:45',
                    color: 'green'
                  },
                  { 
                    type: 'alerta', 
                    title: 'Plano de ação atrasado', 
                    message: 'Renovação ASOs - Setor Produção está atrasado', 
                    time: '2 dias atrás',
                    color: 'red'
                  },
                ].map((notification, index) => (
                  <div key={index} className={`rounded-lg p-4 border ${
                    notification.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                    notification.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                    notification.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        notification.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        notification.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <Bell className={`w-4 h-4 ${
                          notification.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          notification.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          notification.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-slate-900 dark:text-white">{notification.title}</p>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{notification.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            Ver detalhes
                          </button>
                          <span className="text-slate-300">•</span>
                          <button className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            Marcar como lida
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 lg:hidden z-30">
        <div className="flex justify-around items-center">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  console.log('Clicou no mobile:', item.id)
                  setActiveSection(item.id)
                }}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[60px] ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}