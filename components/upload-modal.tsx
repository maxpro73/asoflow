"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const isValidType = ["text/csv", "application/vnd.ms-excel"].includes(selectedFile.type)
      if (!isValidType) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo CSV ou Excel",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate file upload
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Sucesso!",
      description: `${file.name} foi importado com sucesso. 15 funcionários adicionados.`,
    })

    setFile(null)
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload em Lote</DialogTitle>
          <DialogDescription>Importe múltiplos funcionários usando um arquivo CSV ou Excel</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Drop Zone */}
          <div
            className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const droppedFile = e.dataTransfer.files?.[0]
              if (droppedFile) {
                handleFileChange({
                  target: { files: [droppedFile] },
                } as any)
              }
            }}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <File className="w-8 h-8 text-primary" />
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-foreground">Arraste um arquivo aqui ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground">Formatos aceitos: CSV, Excel</p>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".csv,.xlsx,.xls"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block mt-4">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Selecionar Arquivo
              </Button>
            </label>
          </div>

          {/* Template Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Formato esperado:</p>
            <p className="text-xs text-muted-foreground font-mono">
              Nome | CPF | Cargo | Departamento | Último ASO | Periodicidade
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFile(null)
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading || !file}>
              {isLoading ? "Enviando..." : "Importar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
