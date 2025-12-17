"use client"

import { Card, CardContent } from "@/components/ui/card"

export function LandingProblems() {
  const problems = [
    {
      icon: "📊",
      title: "PLANILHAS DESATUALIZADAS",
      description: "Controle manual em Excel gera desorganização e erros",
    },
    {
      icon: "⏰",
      title: "ESQUECIMENTOS CONSTANTES",
      description: "Avisos perdidos, funcionários não comparecem",
    },
    {
      icon: "💸",
      title: "MULTAS CARAS",
      description: "R$ 2.000 a R$ 6.000 por funcionário irregular",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">O Caos do Controle Manual</h2>
          <p className="text-lg text-muted-foreground">
            87% das multas trabalhistas poderiam ser evitadas com gestão automatizada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <Card key={idx} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-5xl">{problem.icon}</div>
                <h3 className="font-bold text-lg text-foreground">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
