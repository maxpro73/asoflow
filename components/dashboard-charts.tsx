"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDepartmentStatistics } from "@/lib/mock-data"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function DepartmentChart() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const deptStats = getDepartmentStatistics()
  const data = Object.entries(deptStats).map(([dept, stats]) => ({
    department: dept,
    "Em Dia": stats.ok,
    "Próximos 30d": stats.warning,
    Vencidos: stats.expired,
  }))

  const isDark = mounted && theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "#444444" : "#eeeeee"
  const tooltipBg = isDark ? "#1f2937" : "#ffffff"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">ASOs por Departamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="department" 
              stroke={textColor}
              fontSize={12}
              tick={{ fill: textColor }}
            />
            <YAxis 
              stroke={textColor}
              fontSize={12}
              tick={{ fill: textColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${gridColor}`,
                color: textColor,
              }}
              itemStyle={{ color: textColor }}
              labelStyle={{ color: textColor }}
            />
            <Legend 
              wrapperStyle={{ color: textColor }}
              formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
            />
            <Bar dataKey="Em Dia" fill="#22c55e" /> {/* Verde */}
            <Bar dataKey="Próximos 30d" fill="#eab308" /> {/* Amarelo */}
            <Bar dataKey="Vencidos" fill="#ef4444" /> {/* Vermelho */}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ComplianceTimeline() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    { date: "Nov", compliance: 82 },
    { date: "Dez", compliance: 78 },
    { date: "Jan", compliance: 85 },
    { date: "Fev", compliance: 88 },
    { date: "Mar", compliance: 92 },
    { date: "Abr", compliance: 89 },
  ]

  const isDark = mounted && theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "#444444" : "#eeeeee"
  const tooltipBg = isDark ? "#1f2937" : "#ffffff"
  const lineColor = "#3b82f6" // Azul

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Evolução de Compliance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              stroke={textColor}
              fontSize={12}
              tick={{ fill: textColor }}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke={textColor}
              fontSize={12}
              tick={{ fill: textColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${gridColor}`,
                color: textColor,
              }}
              itemStyle={{ color: textColor }}
              labelStyle={{ color: textColor }}
              formatter={(value) => [`${value}%`, "Compliance"]}
            />
            <Legend 
              wrapperStyle={{ color: textColor }}
              formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="compliance"
              stroke={lineColor}
              strokeWidth={2}
              name="Taxa de Compliance (%)"
              dot={{ fill: lineColor, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
