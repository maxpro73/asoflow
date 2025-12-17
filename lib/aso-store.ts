// lib/aso-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ASOData {
  id: string
  employeeName: string
  employeeId: string
  examDate: string
  expirationDate: string
  status: 'active' | 'expiring' | 'pending'
  examType: string
}

export interface Funcionario {
  id: string
  name: string
  email: string
  department: string
  position: string
  admissionDate: string
  status: 'active' | 'inactive'
}

interface AsoState {
  asos: ASOData[]
  funcionarios: Funcionario[]
  // Ações
  addASO: (aso: ASOData) => void
  updateASO: (id: string, aso: Partial<ASOData>) => void
  removeASO: (id: string) => void
  addFuncionario: (funcionario: Funcionario) => void
  updateFuncionario: (id: string, funcionario: Partial<Funcionario>) => void
  removeFuncionario: (id: string) => void
  // Estatísticas
  getStats: () => {
    totalASOs: number
    activeASOs: number
    expiringASOs: number
    pendingASOs: number
    totalFuncionarios: number
  }
}

// Dados iniciais para teste
const initialASOs: ASOData[] = [
  {
    id: '1',
    employeeName: 'João Silva',
    employeeId: 'FUNC-001',
    examDate: '2024-01-15',
    expirationDate: '2024-07-15',
    status: 'active',
    examType: 'Admissional'
  },
  {
    id: '2', 
    employeeName: 'Maria Santos',
    employeeId: 'FUNC-002',
    examDate: '2024-01-20',
    expirationDate: '2024-02-20',
    status: 'expiring',
    examType: 'Periódico'
  }
]

const initialFuncionarios: Funcionario[] = [
  {
    id: 'FUNC-001',
    name: 'João Silva',
    email: 'joao@empresa.com',
    department: 'TI',
    position: 'Desenvolvedor',
    admissionDate: '2024-01-10',
    status: 'active'
  },
  {
    id: 'FUNC-002',
    name: 'Maria Santos', 
    email: 'maria@empresa.com',
    department: 'RH',
    position: 'Analista',
    admissionDate: '2024-01-15',
    status: 'active'
  }
]

export const useAsoStore = create<AsoState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      asos: initialASOs,
      funcionarios: initialFuncionarios,

      // Ações para ASOs
      addASO: (aso) => {
        console.log('✅ Adicionando ASO:', aso)
        set((state) => {
          const newASOs = [...state.asos, aso]
          console.log('📊 Total ASOs após adicionar:', newASOs.length)
          return { asos: newASOs }
        })
      },

      updateASO: (id, updatedData) => {
        console.log('📝 Atualizando ASO:', id, updatedData)
        set((state) => ({
          asos: state.asos.map(aso => 
            aso.id === id ? { ...aso, ...updatedData } : aso
          )
        }))
      },

      removeASO: (id) => {
        console.log('🗑️ Removendo ASO:', id)
        set((state) => {
          const newASOs = state.asos.filter(aso => aso.id !== id)
          console.log('📊 Total ASOs após remover:', newASOs.length)
          return { asos: newASOs }
        })
      },

      // Ações para Funcionários
      addFuncionario: (funcionario) => {
        console.log('✅ Adicionando Funcionário:', funcionario)
        set((state) => {
          const newFuncionarios = [...state.funcionarios, funcionario]
          console.log('👥 Total Funcionários após adicionar:', newFuncionarios.length)
          return { funcionarios: newFuncionarios }
        })
      },

      updateFuncionario: (id, updatedData) => {
        console.log('📝 Atualizando Funcionário:', id, updatedData)
        set((state) => ({
          funcionarios: state.funcionarios.map(func => 
            func.id === id ? { ...func, ...updatedData } : func
          )
        }))
      },

      removeFuncionario: (id) => {
        console.log('🗑️ Removendo Funcionário:', id)
        set((state) => {
          const newFuncionarios = state.funcionarios.filter(func => func.id !== id)
          console.log('👥 Total Funcionários após remover:', newFuncionarios.length)
          return { funcionarios: newFuncionarios }
        })
      },

      // Estatísticas (corrigidas)
      getStats: () => {
        const state = get()
        
        const activeASOs = state.asos.filter(aso => aso.status === 'active').length
        const expiringASOs = state.asos.filter(aso => aso.status === 'expiring').length
        const pendingASOs = state.asos.filter(aso => aso.status === 'pending').length
        
        // CORRIGIDO: Contar funcionários ativos da lista de funcionários
        const totalFuncionarios = state.funcionarios.filter(f => f.status === 'active').length

        const stats = {
          totalASOs: state.asos.length,
          activeASOs,
          expiringASOs,
          pendingASOs,
          totalFuncionarios
        }

        console.log('📊 Estatísticas calculadas:', stats)
        return stats
      }
    }),
    {
      name: 'aso-storage',
      version: 2, // Incrementei a versão para forçar atualização
      // Migração para limpar dados antigos se necessário
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // Se tiver dados da versão 1, mantém eles
          return persistedState
        }
        return persistedState
      }
    }
  )
)