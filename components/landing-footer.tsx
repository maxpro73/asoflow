import Image from "next/image"
import Link from "next/link"

export function LandingFooter() {
  const links = [
    { href: "#benefits", label: "Benefícios" },
    { href: "#features", label: "Funcionalidades" },
    { href: "#pricing", label: "Preços" },
    { href: "#", label: "Termos de Serviço" },
    { href: "#", label: "Política de Privacidade" }
  ]

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-7 flex items-center justify-center">
              <Image 
                src="/logo-briefcase.png" 
                alt="ASOflow Logo" 
                width={28} 
                height={28}
                className="object-contain"
              />
            </div>
            <h2 className="text-gray-900 text-xl font-bold">ASOflow</h2>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {links.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 ASOflow. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}