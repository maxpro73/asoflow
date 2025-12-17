"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"  // ← ATUALIZE O PATH!
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { loginWithSupabase } = useAuthStore()  // ← CORRIGIDO!

  const handleSubmit = async (e: React.FormEvent) => {  // ← async agora
    e.preventDefault()
    setError("")

    // Validation
    if (!email || !password) {
      setError("Preencha todos os campos")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Email inválido")
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres")
      return
    }

    try {
      setIsLoading(true)
      
      // 🔐 LOGIN REAL COM SUPABASE
      const result = await loginWithSupabase(email, password)
      
      if (result.success) {
        console.log("✅ Login bem-sucedido:", email)
        router.push("/dashboard")
      } else {
        setError(result.error || "Erro ao fazer login")
      }
    } catch (error) {
      console.error("💥 Erro no login:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[#f6f6f8] dark:bg-[#101622]">
      <div className="flex w-full">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#212529]/40 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 via-[#28A745]/5 to-transparent dark:from-[#007BFF]/10 dark:via-[#28A745]/10"></div>
          
          <div className="z-10 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/logo-briefcase.png" 
                alt="ASOflow Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
              <h1 className="text-4xl font-extrabold text-[#212529] dark:text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>ASOflow</h1>
            </div>
            <p className="max-w-md text-lg text-[#6C757D] dark:text-white/70" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Simplificando a Conformidade em Saúde Ocupacional.
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black leading-tight text-[#212529] dark:text-white" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.033em' }}>
                Bem-vindo de volta
              </h2>
              <p className="text-base font-normal text-[#6C757D] mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Acesse sua conta ASOflow
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label className="flex flex-col">
                  <p className="text-base font-medium leading-normal pb-2 text-[#212529] dark:text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Email / Nome de usuário
                  </p>
                  <div className="relative flex w-full flex-1 items-center">
                    <span className="absolute left-4 text-[#6C757D]" style={{ fontFamily: 'Material Symbols Outlined' }}>person</span>
                    <input
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white dark:bg-[#212529]/50 dark:text-white border border-gray-300 dark:border-[#6C757D]/30 focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] h-14 placeholder:text-[#6C757D] p-[15px] pl-12 text-base font-normal leading-normal outline-none"
                      placeholder="Digite seu email ou nome de usuário"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    />
                  </div>
                </label>
              </div>

              {/* Password Field */}
              <div>
                <label className="flex flex-col">
                  <div className="flex justify-between items-baseline pb-2">
                    <p className="text-base font-medium leading-normal text-[#212529] dark:text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>Senha</p>
                    <a 
                      className="text-sm font-medium text-[#007BFF] hover:underline cursor-pointer"
                      onClick={() => router.push("/forgot-password")}  // ← Crie esta página
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative flex w-full flex-1 items-center">
                    <span className="absolute left-4 text-[#6C757D]" style={{ fontFamily: 'Material Symbols Outlined' }}>lock</span>
                    <input
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white dark:bg-[#212529]/50 dark:text-white border border-gray-300 dark:border-[#6C757D]/30 focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] h-14 placeholder:text-[#6C757D] p-[15px] pl-12 pr-12 text-base font-normal leading-normal outline-none"
                      placeholder="Digite sua senha"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    />
                    <button
                      className="absolute right-4 text-[#6C757D] hover:text-[#212529] dark:hover:text-white transition-colors"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <span style={{ fontFamily: 'Material Symbols Outlined' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 flex items-center gap-2">
                  <span style={{ fontFamily: 'Material Symbols Outlined' }}>error</span>
                  <span style={{ fontFamily: 'Manrope, sans-serif' }}>{error}</span>
                </div>
              )}

              {/* Remember Me */}
              <div>
                <label className="flex items-center gap-x-3 cursor-pointer">
                  <input
                    className="h-5 w-5 rounded border-gray-300 dark:border-[#6C757D]/50 bg-transparent text-[#007BFF] focus:ring-0 focus:ring-offset-0 focus:border-[#007BFF] cursor-pointer"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    style={{ accentColor: '#007BFF' }}
                  />
                  <p className="text-base font-normal leading-normal text-[#212529] dark:text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Mantenha-me conectado
                  </p>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#007BFF] text-white text-base font-bold leading-normal hover:bg-[#007BFF]/90 focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2 dark:focus:ring-offset-[#101622] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                  style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '0.015em' }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <span className="truncate">Entrar</span>
                  )}
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-base text-[#6C757D]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Não tem uma conta?{" "}
                <a 
                  className="font-bold text-[#007BFF] hover:underline cursor-pointer"
                  onClick={() => router.push("/signup")}
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Cadastre-se
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Fonts Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block');
      `}</style>
    </div>
  )
}