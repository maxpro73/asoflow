"use client"

import { LandingBenefits } from "@/components/landing-benefits"
import { LandingFeatures } from "@/components/landing-features"
import { LandingHowItWorks } from "@/components/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing-testimonials"
import { LandingPricing } from "@/components/landing-pricing"
import { LandingFAQ } from "@/components/landing-faq"
import { LandingFooter } from "@/components/landing-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LandingPage() {
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const pricingSection = document.getElementById('pricing')
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3 text-gray-900">
              <div className="flex items-center justify-center">
                <Image 
                  src="/logo-briefcase.png"
                  alt="ASOflow Logo" 
                  width={28} 
                  height={28}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-bold tracking-tight">ASOflow</h2>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#benefits" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                Benefícios
              </a>
              <a href="#features" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" onClick={scrollToPricing} className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                Preços
              </a>
            </nav>
            
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm transition-all hover:shadow-md">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48" id="hero">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                    Simplifique a Gestão de ASOs da sua Empresa
                  </h1>
                  <br>
                  </br>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    ASOflow automatiza, organiza e garante a conformidade dos Certificados de Saúde Ocupacional, economizando seu tempo e evitando multas.
                  </p>
                  <br></br>
                </div>
                <div className="flex flex-col gap-2 min-[900px]:flex-row">
                  <a href="#pricing" onClick={scrollToPricing}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Começar Agora
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-blue-100 p-8 md:p-12">
                  <Image
                    src="/logo-briefcase.png"
                    alt="Gestão de ASOs"
                    width={128}
                    height={128}
                    className="h-24 w-24 md:h-32 md:w-32 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingBenefits />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <div id="pricing">
          <LandingPricing />
        </div>
        <LandingFAQ />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}