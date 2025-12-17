import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48" id="hero">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center">
            {/* Título */}
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900 mb-6">
              Simplifique a Gestão de ASOs da sua Empresa
            </h1>
            
            {/* Imagem visível apenas no mobile, entre o título e o texto */}
            <div className="flex items-center justify-center lg:hidden mb-6">
              <div className="rounded-full bg-blue-100 p-12">
                <img
                  src="/logo-briefcase.png"
                  alt="Gestão de ASOs"
                  className="h-32 w-32 object-contain"
                />
              </div>
            </div>
            
            {/* Texto descritivo */}
            <p className="max-w-[600px] text-gray-500 md:text-xl mb-6">
              ASOflow automatiza, organiza e garante a conformidade dos Certificados de Saúde Ocupacional, economizando seu tempo e evitando multas.
            </p>
            
            {/* Botão */}
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Começar Agora
              </Button>
            </div>
          </div>
          
          {/* Imagem visível apenas no desktop, à direita */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="rounded-full bg-blue-100 p-8 md:p-12">
              <img
                src="/logo-briefcase.png"
                alt="Gestão de ASOs"
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}