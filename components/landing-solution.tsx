"use client"

export function LandingSolution() {
  const steps = [
    {
      number: "1️⃣",
      title: "CADASTRA",
      description: "Upload de planilha em 5 minutos",
    },
    {
      number: "2️⃣",
      title: "AUTOMATIZA",
      description: "Alertas automáticos WhatsApp + Email",
    },
    {
      number: "3️⃣",
      title: "DORME TRANQUILO",
      description: "98% de compliance zero preocupação",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground">Automação Completa em 3 Passos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-4">
              <div className="text-5xl">{step.number}</div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 transform translate-x-full">
                  <div className="text-3xl text-primary/30">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
