import { FileEdit, CloudUpload, Bell } from "lucide-react"

export function LandingHowItWorks() {
  const steps = [
    {
      icon: FileEdit,
      number: "1",
      title: "Cadastre",
      description: "Adicione seus colaboradores e faça o upload dos ASOs existentes na plataforma."
    },
    {
      icon: CloudUpload,
      number: "2",
      title: "Organize",
      description: "Nosso sistema centraliza e organiza todos os documentos de forma automática."
    },
    {
      icon: Bell,
      number: "3",
      title: "Monitore",
      description: "Receba alertas automáticos sobre os vencimentos e mantenha tudo em dia, sem esforço."
    }
  ]

  return (
    <section className="py-16 sm:py-24 bg-gray-50" id="how-it-works">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            Como funciona?
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Em 3 passos simples, você transforma a gestão de ASOs da sua empresa.
          </p>
        </div>
        <div className="relative">
          {/* Linha conectora - desktop */}
          <div className="hidden md:block absolute top-12 left-1/2 w-full h-px -translate-x-1/2 bg-gray-200"></div>
          <div className="hidden md:block absolute top-12 left-0 w-full h-px">
            <div className="absolute top-1/2 left-1/2 w-1/3 h-px -translate-y-1/2 -translate-x-1/2 bg-blue-500"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center justify-center size-24 rounded-full bg-white border-2 border-blue-500 text-blue-500 font-bold text-4xl z-10">
                    <Icon className="w-12 h-12" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-gray-900 text-lg font-bold leading-tight">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-normal leading-normal mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}