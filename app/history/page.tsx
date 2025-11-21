"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BarChart3, Calendar, Clock, Eye, Search, TrendingUp, LineChart } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { WorkoutSession } from "@/lib/models/WorkoutSession"

export default function HistoryPage() {
  const [sessions, setSessions] = useState<(WorkoutSession & { template_name: string })[]>([])
  const [filteredSessions, setFilteredSessions] = useState<(WorkoutSession & { template_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [sessions, searchTerm, selectedMonth])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterSessions = () => {
    let filtered = sessions

    if (searchTerm) {
      filtered = filtered.filter((session) => session.template_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.date)
        const sessionMonth = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, "0")}`
        return sessionMonth === selectedMonth
      })
    }

    setFilteredSessions(filtered)
  }

  const getUniqueMonths = () => {
    const months = sessions.map((session) => {
      const date = new Date(session.date)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    })
    return [...new Set(months)].sort().reverse()
  }

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("pt-BR", { year: "numeric", month: "long" })
  }

  const getStats = () => {
    const totalSessions = filteredSessions.length
    const totalMinutes = filteredSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0

    const workoutCounts: Record<string, number> = {}
    filteredSessions.forEach((session) => {
      workoutCounts[session.template_name] = (workoutCounts[session.template_name] || 0) + 1
    })

    const mostUsedWorkout = Object.entries(workoutCounts).sort(([, a], [, b]) => b - a)[0]

    return {
      totalSessions,
      totalMinutes,
      avgDuration,
      mostUsedWorkout: mostUsedWorkout ? mostUsedWorkout[0] : "N/A",
    }
  }

  const getChartData = () => {
    
    const weeklyData: Record<string, number> = {}

    filteredSessions.forEach((session) => {
      const date = new Date(session.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split("T")[0]
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1
    })

    return Object.entries(weeklyData)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        treinos: count,
      }))
      .sort(
        (a, b) =>
          new Date(a.date.split("/").reverse().join("-")).getTime() -
          new Date(b.date.split("/").reverse().join("-")).getTime(),
      )
      .slice(-8) 
  }

  const stats = getStats()
  const chartData = getChartData()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando histórico...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-orange-600" />
        <h1 className="text-3xl font-bold">Histórico de Treinos</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-gray-600">Treinos realizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</p>
                <p className="text-sm text-gray-600">Tempo total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avgDuration}min</p>
                <p className="text-sm text-gray-600">Duração média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-lg font-bold truncate">{stats.mostUsedWorkout}</p>
                <p className="text-sm text-gray-600">Ficha mais usada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Frequência Semanal de Treinos</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => `Semana: ${label}`}
                    formatter={(value: number) => [value, "Treinos"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="treinos"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por ficha de treino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os meses</option>
          {getUniqueMonths().map((month) => (
            <option key={month} value={month}>
              {getMonthName(month)}
            </option>
          ))}
        </select>
      </div>

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum treino encontrado</h3>
            <p className="text-gray-600 mb-4">
              {sessions.length === 0 ? "Você ainda não realizou nenhum treino" : "Tente ajustar os filtros de busca"}
            </p>
            <Link href="/progress">
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Iniciar Treino
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{session.template_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      {session.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration_minutes} min</span>
                        </div>
                      )}
                    </div>
                    {session.notes && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{session.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Concluído</Badge>
                    <Link href={`/progress/session/${session.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-gray-600">
        <p>
          Mostrando {filteredSessions.length} de {sessions.length} treino(s)
        </p>
      </div>
    </div>
  )
}
