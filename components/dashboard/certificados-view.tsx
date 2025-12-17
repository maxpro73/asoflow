'use client'

import { supabase } from '@/lib/supabase/supabaseClient'
import { useState, useEffect } from "react"
import { Upload, Search, Filter, Download, ChevronLeft, ChevronRight, X, FileImage, Eye } from "lucide-react"
import { usePlanLimits } from '@/hooks/usePlanLimits'
import UpgradeModal from '@/components/UpgradeModal'

interface Certificate {
  id: string
  type: string
  employee_name: string
  employee_id?: string
  issue_date: string
  expiry_date: string
  status: string
  image_url?: string
  file_name?: string
  created_at: string
}

interface Employee {
  id: string
  name: string
}

export default function CertificadosView() {
  const [certificateSearchTerm, setCertificateSearchTerm] = useState("")
  const [currentCertificatePage, setCurrentCertificatePage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  
  // 🔥 NOVO: Modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const [formData, setFormData] = useState({
    type: "",
    employee_name: "",
    employee_id: "",
    imagem: null as File | null
  })

  const itemsPerPage = 6
  const [certificates, setCertificates] = useState<Certificate[]>([])

  // 🔥 NOVO: Hook de limites
  const limits = usePlanLimits(employees.length, certificates.length)

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao carregar funcionários:', error)
      return
    }
    setEmployees(data || [])
  }

  const loadCertificates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar certificados:', error)
      alert('Erro ao carregar certificados.')
    } else {
      setCertificates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCertificates()
    loadEmployees()

    // 🔥 ATUALIZAÇÃO EM TEMPO REAL - Supabase Realtime
    const certificatesChannel = supabase
      .channel('certificates-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'certificates' },
        (payload) => {
          console.log('🔄 Certificado atualizado:', payload)
          loadCertificates()
          window.dispatchEvent(new CustomEvent('certificatesUpdated'))
        }
      )
      .subscribe()

    return () => {
      certificatesChannel.unsubscribe()
    }
  }, [])

  const calculateDaysUntilExpiration = (expiryDate: string) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiration = new Date(expiryDate)
    const diffTime = expiration.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateStatus = (expiryDate: string) => {
    const days = calculateDaysUntilExpiration(expiryDate)
    if (!days || days < 0) return 'Vencido'
    if (days < 30) return 'A Vencer'
    return 'Válido'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Válido': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
      'A Vencer': 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
      'Vencido': 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
    }
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const [y, m, d] = dateString.split('-')
    return `${d}/${m}/${y}`
  }

  const filteredCertificates = certificates.filter(cert =>
    cert.employee_name.toLowerCase().includes(certificateSearchTerm.toLowerCase()) ||
    cert.type.toLowerCase().includes(certificateSearchTerm.toLowerCase())
  )

  const totalCertificatePages = Math.ceil(filteredCertificates.length / itemsPerPage)
  const startIdx = (currentCertificatePage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const currentCertificates = filteredCertificates.slice(startIdx, endIdx)

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setImagePreview(null)
    setFormData({ type: "", employee_name: "", employee_id: "", imagem: null })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande! Máximo 5MB.')
      e.target.value = ''
      return
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      alert('Formato não permitido! Use JPG, PNG, WebP ou PDF.')
      e.target.value = ''
      return
    }

    setFormData(prev => ({ ...prev, imagem: file }))

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview('PDF')
    }
  }

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    const emp = employees.find(x => x.id === id)
    setFormData(prev => ({
      ...prev,
      employee_id: id,
      employee_name: emp?.name || ""
    }))
  }

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      const { error } = await supabase.storage
        .from('certificates')
        .upload(fileName, file, { upsert: false })

      if (error) {
        alert(`Erro no upload: ${error.message}`)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      alert('Erro inesperado no upload do arquivo.')
      console.error(err)
      return null
    }
  }

  const handleSubmit = async () => {
    // 🔥 VALIDAÇÃO DE LIMITE
    if (!limits.canAddCertificate) {
      setShowUpgradeModal(true)
      return
    }

    if (!formData.type || !formData.employee_name || !formData.imagem) {
      alert('Preencha todos os campos!')
      return
    }

    setUploading(true)

    try {
      const imageUrl = await uploadImageToStorage(formData.imagem)
      if (!imageUrl) {
        setUploading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1)
      const expiryDate = expiry.toISOString().split('T')[0]
      const status = calculateStatus(expiryDate)

      const dataToInsert = {
        type: formData.type.trim(),
        employee_name: formData.employee_name.trim(),
        employee_id: formData.employee_id || null,
        issue_date: today,
        expiry_date: expiryDate,
        status,
        image_url: imageUrl,
        file_name: formData.imagem.name
      }

      if (dataToInsert.type.length > 50) {
        alert('Tipo de ASO muito longo! Máximo 50 caracteres.')
        setUploading(false)
        return
      }
      if (dataToInsert.employee_name.length > 100) {
        alert('Nome do funcionário muito longo! Máximo 100 caracteres.')
        setUploading(false)
        return
      }
      if (dataToInsert.image_url.length > 500) {
        alert('URL da imagem muito longa!')
        setUploading(false)
        return
      }
      if (dataToInsert.file_name.length > 100) {
        alert('Nome do arquivo muito longo! Máximo 100 caracteres.')
        setUploading(false)
        return
      }

      const { data, error } = await supabase
        .from('certificates')
        .insert([dataToInsert])
        .select()

      if (error) {
        alert(`Erro ao salvar: ${error.message}`)
        setUploading(false)
        return
      }

      alert('Certificado salvo com sucesso!')
      await loadCertificates()
      window.dispatchEvent(new CustomEvent('certificatesUpdated'))
      handleCloseModal()
      setUploading(false)
    } catch (err: any) {
      alert(`Erro inesperado: ${err?.message || 'Erro desconhecido'}`)
      setUploading(false)
    }
  }

  const handleViewCertificate = (url: string) => {
    setViewImageUrl(url)
    setImageZoom(1)
  }

  const handleDeleteCertificate = async (id: string, imageUrl?: string) => {
    if (!confirm('Excluir este certificado?')) return

    try {
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop()
        if (fileName) await supabase.storage.from('certificates').remove([fileName])
      }

      const { error } = await supabase.from('certificates').delete().eq('id', id)
      if (error) {
        alert('Erro ao excluir.')
        return
      }

      alert('Excluído com sucesso!')
      loadCertificates()
      window.dispatchEvent(new CustomEvent('certificatesUpdated'))
    } catch (err) {
      alert('Erro inesperado ao excluir.')
    }
  }

  const handleExportTXT = () => {
    if (!filteredCertificates.length) return alert('Nada para exportar')

    const removeAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[çÇ]/g, 'c').replace(/[ãÃ]/g, 'a').replace(/[õÕ]/g, 'o')

    const header = "Tipo de ASO;Nome do Funcionario;Data de Emissao;Data de Validade;Status\n"
    const lines = filteredCertificates.map(c =>
      `${removeAccents(c.type)};${removeAccents(c.employee_name)};${formatDate(c.issue_date)};${formatDate(c.expiry_date)};${removeAccents(c.status)}`
    ).join('\n')

    const blob = new Blob([header + lines], { type: 'text/plain;charset=iso-8859-1' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aso_certificados.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Certificados ASO</h1>
          <p className="text-slate-600 dark:text-slate-400">Gerencie os exames ocupacionais</p>
        </div>
        
        {/* 🔥 NOVO: Badge + Botão com validação */}
        <div className="flex items-center gap-4">
          <div className={`text-sm px-3 py-1 rounded-full ${
            limits.canAddCertificate 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {limits.currentCertificates} / {limits.maxCertificates} certificados
          </div>
          
          <button 
            onClick={() => {
              if (!limits.canAddCertificate) {
                setShowUpgradeModal(true)
              } else {
                setIsModalOpen(true)
              }
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition-colors ${
              limits.canAddCertificate
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Upload className="w-5 h-5" /> Upload
          </button>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-wrap gap-4 justify-between mb-6">
          <input
            type="text"
            placeholder="Buscar funcionário ou tipo..."
            value={certificateSearchTerm}
            onChange={e => setCertificateSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 w-full max-w-md"
          />
          <div className="flex gap-3">
            <button className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filtrar
            </button>
            <button onClick={handleExportTXT} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-2">
              <Download className="w-5 h-5" /> Exportar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-slate-500">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="pb-3 text-sm font-semibold text-slate-600">Tipo</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600">Funcionário</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600">Emissão</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600">Validade</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600">Status</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentCertificates.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500">Nenhum certificado encontrado</td></tr>
                ) : (
                  currentCertificates.map(cert => (
                    <tr key={cert.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4">{cert.type}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-400">{cert.employee_name}</td>
                      <td className="py-4 text-slate-600">{formatDate(cert.issue_date)}</td>
                      <td className="py-4 text-slate-600">{formatDate(cert.expiry_date)}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {cert.image_url && (
                          <button onClick={() => handleViewCertificate(cert.image_url!)} className="text-blue-600 mr-4">
                            <Eye className="w-5 h-5 inline" /> Ver
                          </button>
                        )}
                        <button onClick={() => handleDeleteCertificate(cert.id, cert.image_url)} className="text-red-600">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-slate-600">
            {startIdx + 1}–{Math.min(endIdx, filteredCertificates.length)} de {filteredCertificates.length}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentCertificatePage(p => Math.max(1, p - 1))} disabled={currentCertificatePage === 1}
              className="p-2 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentCertificatePage(p => Math.min(totalCertificatePages, p + 1))} disabled={currentCertificatePage === totalCertificatePages}
              className="p-2 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">Novo Certificado ASO</h2>
              <button onClick={handleCloseModal}><X className="w-6 h-6 text-slate-600 dark:text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-6">
              <select 
                value={formData.type} 
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="">Tipo de ASO</option>
                <option value="Admissional">Admissional</option>
                <option value="Periódico">Periódico</option>
                <option value="Mudança de Risco">Mudança de Risco</option>
                <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                <option value="Demissional">Demissional</option>
              </select>

              <select 
                value={formData.employee_id} 
                onChange={handleEmployeeChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="">Funcionário</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    {imagePreview === 'PDF' ? (
                      <div className="flex flex-col items-center">
                        <FileImage className="w-16 h-16 mx-auto text-blue-600" />
                        <p className="mt-2 text-sm text-slate-600">Arquivo PDF selecionado</p>
                      </div>
                    ) : (
                      <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded" />
                    )}
                    <button 
                      onClick={() => { 
                        setImagePreview(null); 
                        setFormData(prev => ({ ...prev, imagem: null })) 
                      }}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*,application/pdf" onChange={handleImageChange} className="hidden" />
                    <FileImage className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600">Clique para selecionar (máx. 5MB)</p>
                    <p className="text-xs text-slate-500 mt-1">Formatos: JPG, PNG, WebP, PDF</p>
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleCloseModal} 
                  disabled={uploading} 
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={uploading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {viewImageUrl && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={() => setViewImageUrl(null)}>
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 flex gap-3 z-10">
              <div className="flex gap-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <button 
                  onClick={(e) => { e.stopPropagation(); setImageZoom(z => Math.max(0.5, z - 0.25)) }}
                  className="px-3 py-2 hover:bg-white/20 rounded transition-all text-white font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-white font-mono">{Math.round(imageZoom * 100)}%</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setImageZoom(z => Math.min(3, z + 0.25)) }}
                  className="px-3 py-2 hover:bg-white/20 rounded transition-all text-white font-bold"
                >
                  +
                </button>
              </div>

              <a 
                href={viewImageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
                onClick={e => e.stopPropagation()}
                title="Abrir em nova aba"
              >
                <Download className="w-6 h-6 text-white" />
              </a>
              <button 
                onClick={() => setViewImageUrl(null)} 
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="relative w-full h-full overflow-auto flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img 
                src={viewImageUrl} 
                alt="Certificado" 
                className="rounded-lg shadow-2xl cursor-zoom-in"
                style={{ 
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease',
                  maxWidth: 'none',
                  maxHeight: 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setImageZoom(z => z === 1 ? 2 : 1)
                }}
              />
            </div>

            <p className="absolute bottom-4 text-white/60 text-sm text-center px-4">
              Clique na imagem para dar zoom • Use os botões +/- • Clique em <Download className="w-4 h-4 inline" /> para abrir em nova aba
            </p>
          </div>
        </div>
      )}

      {/* 🔥 NOVO: Modal de Upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredFeature="certificados ASO"
        currentUsage={limits.currentCertificates}
        currentLimit={limits.maxCertificates}
      />
    </>
  )
}