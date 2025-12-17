import { Quote } from "lucide-react"
import Image from "next/image"

export function LandingTestimonials() {
  const testimonials = [
    {
      quote: "O ASOflow transformou nossa gestão de saúde ocupacional. Os lembretes automáticos são fantásticos e nos pouparam de muitas dores de cabeça e possíveis multas.",
      author: "Ana Souza",
      role: "Gerente de RH, Tech Solutions",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtJi2cr9lMbU_fOiDy7C0uPa7K-ywaJvcf9VdANJfoM8hlPIx-wpmbz8RCgbCSVrLFwQ6aESDghd6FsfzjSOJ7qKo0McW6uu1kEqWwqsQP6aLvrM3IwlfrI_nAdzVWpCic6lC94nkWvK3sLsbZWZyixx44Gt15ok9iuaUDMPdWp6lCsNP4XUWF2ahYk4wOE__UK3X4hiUttiuD9Z_8_pE-jc2sUgO_-ptA3hTia606Z_sntr6Zi8EUYh58lqEy27AcrUxiLFIm_H0"
    },
    {
      quote: "Finalmente uma plataforma que centraliza tudo! Agora tenho acesso rápido a todos os ASOs, e o dashboard de colaboradores é extremamente útil para ter uma visão geral.",
      author: "Carlos Lima",
      role: "Diretor, Construtora Inova",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvXJklywEV7_34xp0KVdy39zG1ZfH1plLlUI5hdYHSgLij_ItxicJiOFU4lkKxwKO9TjI1SdI9r61G9bscAF4JVeu6kKPExXf-Gsobs6xf37c_3ewdy3vfT8G5uXuzvVoRv8mZITOoyzmU4cWdjX86JLcsC7hDa3zuWID--h91FTP1dqduAx57zCqzgyS7BdA7dx_WfsFTEZRusbCzD71rSIGfQrYo9otj6ezwRaVa9NE8wnszOw7gMfSNu5s6M-nrMQ7JXnMUpF8"
    },
    {
      quote: "A implementação foi super simples e a equipe de suporte é muito atenciosa. Recomendo o ASOflow para qualquer empresa que queira se livrar das planilhas.",
      author: "Mariana Ferreira",
      role: "Sócia, Varejo Mais",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDp6J9hz6LFga4grGVFDdOHfvL1ZpfCDtVBrsBT_Huph7PO_LYTvmvvX0hNbY2ax-9KVviv_8sqJV7scm7srJiqexWskeizu3Y5BT4nCZtElGiNOGT6bZB18g7BzZ2SZfBAW73pw8hrkUG3jtXmDL-h6oniY-2X-mhGtnlZep0W3y8rq0D7ZoqVq16rjqInE-3hQYxHpeDEy7DYwyaqbpPwTcTMIBtnTnxyCnSuf_9UIiKyBrYkHCSbrFLzH-M2Ho2ejNJpHJDtjfE"
    }
  ]

  return (
    <section className="py-16 sm:py-24" id="testimonials">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight md:text-4xl">
            O que nossos clientes dizem
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal max-w-3xl mx-auto">
            Veja como o ASOflow está ajudando empresas a manter a conformidade e a eficiência.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-8 transition-all duration-300 hover:bg-gray-100 hover:border-gray-300"
            >
              <div className="text-blue-500">
                <Quote className="h-8 w-8 fill-current" />
              </div>
              <div className="flex-grow">
                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <img 
                  className="size-14 rounded-full object-cover" 
                  alt={`Foto de ${testimonial.author}`}
                  src={testimonial.image}
                />
                <div>
                  <p className="font-bold text-gray-900 text-lg">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}