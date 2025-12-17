import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export function LandingPricing() {
  const plans = [
    {
      name: "Early Bird",
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
      name: "Essencial",
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
      name: "Profissional",
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

  return (
    <section className="py-16 sm:py-24 bg-gray-50" id="pricing">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            Escolha o Plano Ideal para Sua Empresa
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Planos flexíveis que crescem com você. Todos incluem alertas automáticos, dashboard e suporte dedicado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative flex flex-col rounded-xl bg-white p-6 border-2 ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                  : 'border-gray-200 shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-gray-900 text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-500 text-xs mt-1 mb-4">{plan.subtitle}</p>
                <div className="mb-1">
                  <span className="text-gray-900 text-4xl font-extrabold">R$ {plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </div>
                {plan.priceAnnual && (
                  <p className="text-xs text-green-600 font-semibold">
                    Anual: R$ {plan.priceAnnual}/mês (economize R$ {plan.savings})
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  {plan.employees}
                </p>
              </div>

              <div className="mb-6 flex-grow">
                <div className="space-y-2.5">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-xs leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (plan.price === "197") {
                    window.location.href = '/cadastro/planoum';
                  }
                }}
                className={`w-full h-11 text-base font-bold ${
                  plan.popular 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                }`}
              >
                {index === 0 ? 'Garantir Oferta' : 'Começar Agora'}
              </Button>
              
              {index === 0 && (
                <p className="text-center text-xs text-red-600 font-semibold mt-3">
                  ⚡ Restam poucas vagas
                </p>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Teste grátis por 14 dias • Não precisa de cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  )
}