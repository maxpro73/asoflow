import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface StatusCardProps {
  title: string
  value: number | string
  percentage?: number
  change?: number
  icon: ReactNode
  trend?: "up" | "down" | "neutral"
  bgColor: string
  textColor: string
}

export function StatusCard({
  title,
  value,
  percentage,
  change,
  icon,
  trend = "neutral",
  bgColor,
  textColor,
}: StatusCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${textColor} mb-2`}>{title}</p> {/* ← CORRIGIDO: text-muted-foreground para textColor */}
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
              {percentage !== undefined && <span className={`text-sm ${textColor}`}>({percentage}%)</span>} {/* ← CORRIGIDO: text-muted-foreground para textColor */}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-3">
                {trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
                {trend === "down" && <TrendingDown className="w-4 h-4 text-danger" />}
                {trend === "neutral" && <AlertTriangle className="w-4 h-4 text-warning" />}
                <span className={`text-xs font-medium ${textColor}`}> {/* ← CORRIGIDO: text-muted-foreground para textColor */}
                  {change > 0 ? "+" : ""}
                  {change} vs mês anterior
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}