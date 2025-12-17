// @/components/UserManagement.tsx
"use client"

import { useResourceManagement } from '@/lib/hooks/useResourceManagement'
import UpgradeModal from './UpgradeModal'

export default function UserManagement() {
  const {
    addUser,
    showUpgradeModal,
    setShowUpgradeModal,
    requiredFeature,
    currentUsage,
    currentLimits,
    remaining
  } = useResourceManagement()

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Gerenciar Usuários</h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Limite: {currentUsage.users}/{currentLimits.users} usuários
            {remaining.users > 0 && (
              <span className="text-green-600 ml-2">
                ({remaining.users} restantes)
              </span>
            )}
          </p>
        </div>

        <button
          onClick={addUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Adicionar Usuário
        </button>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredFeature={requiredFeature}
        currentUsage={currentUsage.users}
        currentLimit={currentLimits.users}
      />
    </div>
  )
}