import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type PlanType = "Early Bird" | "Essencial" | "Profissional"

export function LandingPricing() {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanType | null>(null)
  
  const plans = [
    {
      name: "Early Bird" as PlanType,
      badge: "OFERTA LIMITADA",
      subtitle: "Primeiros 50 clientes - preço travado pra sempre",
      price: "79,90",
      employees: "Até 100 funcionários",
      popular: false,
      features: [
        "Até 100 funcionários",
        "3 usuários RH",
        "1 unidade/empresa",
        "Alertas Email + WhatsApp ilimitados",
        "Dashboard básico",
        "Histórico de alertas (12 meses)",
        "Upload de ASOs (PDF)",
        "Relatório simples (PDF)",
        "Suporte por email (24h)",
        "Onboarding automático"
      ]
    },
    {
      name: "Essencial" as PlanType,
      subtitle: "Para pequenas empresas (10-50 funcionários)",
      price: "197",
      priceAnnual: "167",
      savings: "360",
      employees: "Até 50 funcionários",
      popular: false,
      features: [
        "Tudo do Early Bird +",
        "5 usuários RH (+2)",
        "2.000 alertas/mês garantidos",
        "Dashboard com filtros avançados",
        "Tags personalizadas",
        "Suporte email + WhatsApp (12h)",
        "Onboarding ao vivo (30min)"
      ]
    },
    {
      name: "Profissional" as PlanType,
      badge: "MAIS POPULAR",
      subtitle: "Para médias empresas (51-200 funcionários)",
      price: "397",
      priceAnnual: "337",
      savings: "720",
      employees: "Até 200 funcionários",
      popular: true,
      features: [
        "Tudo do Essencial +",
        "10 usuários RH (+5)",
        "5.000 alertas/mês",
        "Dashboard gerencial avançado",
        "Relatórios customizados",
        "Relatório de compliance por departamento",
        "Relatório de auditoria (assinatura digital)",
        "Exportação de gráficos (PNG/PDF)",
        "Filtro por período (30/90/180/365 dias)",
        "Suporte prioritário (4h)",
        "Treinamento de equipe (1 sessão 1h)"
      ]
    }
  ]

  const handlePlanSelection = async (planName: PlanType) => {
    setLoading(planName)
    
    // Mapeamento correto para as páginas de CADASTRO
    const routes = {
      "Early Bird": '/app/cadastro/plano-early',
      "Essencial": '/app/cadastro/plano-um',
      "Profissional": '/app/cadastro/plano-tres'
    }
    
    // Adiciona pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Log para debug no console
    console.log(`🔗 Redirecionando para: ${routes[planName]}`)
    
    // Redireciona para a página de cadastro
    router.push(routes[planName])
    
    // Remove o estado de loading após navegação
    setLoading(null)
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white" id="pricing">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            Escolha o Plano Ideal para Sua Empresa
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Planos flexíveis que crescem com você. Todos incluem alertas automáticos, dashboard e suporte dedicado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-white p-6 lg:p-8 border-2 transition-all duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                  : 'border-gray-200 shadow-xl hover:shadow-2xl'
              }`}
            >
              {plan.badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${
                  plan.badge === "OFERTA LIMITADA" 
                    ? 'bg-orange-500 text-white animate-pulse' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1 mb-4">{plan.subtitle}</p>
                <div className="mb-1">
                  <span className="text-gray-900 text-5xl font-extrabold">R$ {plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </div>
                {plan.priceAnnual && (
                  <p className="text-xs text-green-600 font-semibold mt-2">
                    Anual: R$ {plan.priceAnnual}/mês (economize R$ {plan.savings}/ano)
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-3 font-medium">
                  {plan.employees}
                </p>
              </div>

              <div className="mb-6 flex-grow">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => handlePlanSelection(plan.name)}
                disabled={loading === plan.name}
                className={`w-full h-12 text-base font-bold transition-all duration-200 ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-900 hover:bg-black text-white border border-gray-900'
                } ${loading === plan.name ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  index === 0 ? 'Aproveitar Oferta 🚀' : 'Começar Agora'
                )}
              </Button>

              {index === 0 && (
                <p className="text-center text-xs text-red-600 font-semibold mt-3 animate-pulse">
                  ⚡ Restam poucas vagas - Aproveite agora!
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="inline-flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Suporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>7 dias de garantia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cancele a qualquer momento</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}