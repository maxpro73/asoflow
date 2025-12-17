"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "A plataforma é segura para armazenar os dados dos meus colaboradores?",
      answer: "Sim. Utilizamos criptografia de ponta a ponta e servidores seguros para garantir a total confidencialidade e segurança dos seus dados, em conformidade com a LGPD."
    },
    {
      question: "Como funciona o processo de implementação?",
      answer: "O processo é rápido e intuitivo. Basta criar sua conta, cadastrar seus colaboradores e fazer o upload dos ASOs existentes. Nossa equipe de suporte está à disposição para ajudar em qualquer etapa."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura quando quiser, sem burocracia ou taxas de cancelamento. Seu acesso permanecerá ativo até o final do período já pago."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 sm:py-24" id="faq">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Tire suas dúvidas sobre o ASOflow. Se não encontrar o que procura, entre em contato conosco.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="rounded-lg bg-gray-50 p-6"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full cursor-pointer items-center justify-between gap-1.5 text-left"
              >
                <h2 className="text-lg font-medium text-gray-900">{faq.question}</h2>
                <ChevronDown 
                  className={`text-gray-900 transition-transform duration-200 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <p className="mt-4 leading-relaxed text-gray-600">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}