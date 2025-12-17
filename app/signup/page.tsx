"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Adicione aqui a lógica de cadastro
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="relative flex min-h-screen w-full">
      <div className="flex w-full">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gray-50 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-green-500/5 to-transparent"></div>
          <div className="z-10 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/logo-briefcase.png" 
                alt="ASOflow Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
              <h1 className="text-4xl font-extrabold text-gray-900">ASOflow</h1>
            </div>
            <p className="max-w-md text-lg text-gray-600">
              Simplificando a Conformidade em Saúde Ocupacional.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black leading-tight tracking-tight text-gray-900">
                Crie sua conta
              </h2>
              <p className="text-base font-normal leading-normal text-gray-600 mt-2">
                Comece a gerenciar os ASOs da sua empresa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div>
                <Label htmlFor="name" className="text-base font-medium text-gray-900 pb-2">
                  Nome completo
                </Label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-14 pl-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-medium text-gray-900 pb-2">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu melhor email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-14 pl-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="password" className="text-base font-medium text-gray-900 pb-2">
                  Senha
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha forte"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-14 pl-12 pr-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-900 pb-2">
                  Confirmar Senha
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-14 pl-12 pr-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-base font-bold"
                >
                  Cadastrar
                </Button>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-base text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="font-bold text-blue-500 hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}