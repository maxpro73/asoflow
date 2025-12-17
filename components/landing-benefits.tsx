import { Clock, ShieldCheck, FolderOpen } from "lucide-react"

export function LandingBenefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Economize Tempo",
      description: "Automatize lembretes e agendamentos, liberando sua equipe para focar em tarefas estratégicas."
    },
    {
      icon: ShieldCheck,
      title: "Evite Multas",
      description: "Mantenha todos os exames em dia com nosso sistema de alertas e nunca mais perca um prazo."
    },
    {
      icon: FolderOpen,
      title: "Centralize a Informação",
      description: "Acesse todos os certificados e o histórico dos colaboradores em um único lugar seguro e organizado."
    }
  ]

  return (
    <section className="py-16 sm:py-24 bg-gray-50" id="benefits">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            Benefícios para o seu Negócio
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Descubra como o ASOflow pode transformar a gestão de saúde ocupacional da sua empresa, trazendo eficiência e tranquilidade.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
                <div className="text-blue-500 size-10 flex items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-gray-900 text-lg font-bold leading-tight">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm font-normal leading-normal">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}