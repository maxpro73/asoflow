import { Bell, Folder, MoreHorizontal, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

export function LandingFeatures() {
  return (
    <section className="py-16 sm:py-24" id="features">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            Funcionalidades Chave
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Tudo o que você precisa para uma gestão de ASOs eficiente e sem complicações.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Lembretes Automáticos */}
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-100 rounded-xl p-6 flex items-center justify-center aspect-video">
              <div className="w-full bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                <div className="bg-blue-100 text-blue-500 p-3 rounded-full">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">ASO Vencendo</p>
                  <p className="text-xs text-gray-500">Exame de João Silva vence em 5 dias.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 text-lg font-bold leading-normal">Lembretes Automáticos</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">
                Configure notificações automáticas por e-mail para os próximos vencimentos de ASOs.
              </p>
            </div>
          </div>

          {/* Feature 2: Nuvem de Documentos */}
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-100 rounded-xl p-6 flex items-center justify-center aspect-video">
              <div className="w-full bg-white rounded-lg shadow-md p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-500 p-2 rounded-lg">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">ASOs 2024</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-70">
                  <div className="bg-gray-100 text-gray-500 p-2 rounded-lg">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-600">Exames 2024</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 text-lg font-bold leading-normal">Nuvem de Documentos</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">
                Armazene e acesse com segurança todos os certificados de saúde ocupacional online.
              </p>
            </div>
          </div>

          {/* Feature 3: Dashboard */}
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-100 rounded-xl p-6 flex items-center justify-center aspect-video">
              <div className="w-full bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-gray-900">Status Geral</h4>
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-gray-600 flex-1">Em dia</p>
                    <div className="w-2/5 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <p className="text-xs text-gray-600 flex-1">A vencer</p>
                    <div className="w-2/5 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <p className="text-xs text-gray-600 flex-1">Vencido</p>
                    <div className="w-2/5 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 text-lg font-bold leading-normal">Dashboard de Colaboradores</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">
                Visualize o status de saúde de toda a sua equipe em um painel intuitivo e fácil de usar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}