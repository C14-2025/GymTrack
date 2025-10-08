"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Calendar, Weight, BarChart3, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { Exercise } from "@/lib/models/Exercise"

interface EvolutionData {
  date: string
  maxWeight: number
  totalVolume: number
  totalReps: number
  sets: number
  avgWeight: number
}

interface ProgressMetrics {
  weightIncrease: number
  volumeIncrease: number
  totalSessions: number
  bestSession: EvolutionData
}

export default function ExerciseEvolutionPage({ params }: { params: { id: string } }) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [evolution, setEvolution] = useState<EvolutionData[]>([])
  const [progress, setProgress] = useState<ProgressMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState<"weight" | "volume" | "reps">("weight")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [exerciseResponse, evolutionResponse] = await Promise.all([
        fetch(`/api/exercises/${params.id}`),
        fetch(`/api/exercises/${params.id}/evolution`),
      ])

      if (exerciseResponse.ok) {
        const exerciseData = await exerciseResponse.json()
        setExercise(exerciseData)
      }

      if (evolutionResponse.ok) {
        const evolutionData = await evolutionResponse.json()
        setEvolution(evolutionData.evolution)
        setProgress(evolutionData.progress)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: Record<string, string> = {
      Peito: "bg-red-100 text-red-800",
      Costas: "bg-blue-100 text-blue-800",
      Ombros: "bg-yellow-100 text-yellow-800",
      Bíceps: "bg-green-100 text-green-800",
      Tríceps: "bg-purple-100 text-purple-800",
      Pernas: "bg-indigo-100 text-indigo-800",
      Glúteos: "bg-pink-100 text-pink-800",
      Abdômen: "bg-orange-100 text-orange-800",
      Cardio: "bg-gray-100 text-gray-800",
    }
    return colors[muscleGroup] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const getChartData = () => {
    return evolution.map((data) => ({
      ...data,
      date: formatDate(data.date),
    }))
  }

  const getChartConfig = () => {
    switch (activeChart) {
      case "weight":
        return {
          dataKey: "maxWeight",
          name: "Peso Máximo (kg)",
          color: "#3b82f6",
          yAxisLabel: "Peso (kg)",
        }
      case "volume":
        return {
          dataKey: "totalVolume",
          name: "Volume Total (kg)",
          color: "#10b981",
          yAxisLabel: "Volume (kg)",
        }
      case "reps":
        return {
          dataKey: "totalReps",
          name: "Repetições Totais",
          color: "#f59e0b",
          yAxisLabel: "Repetições",
        }
      default:
        return {
          dataKey: "maxWeight",
          name: "Peso Máximo (kg)",
          color: "#3b82f6",
          yAxisLabel: "Peso (kg)",
        }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando evolução...</div>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exercício não encontrado</h1>
          <Link href="/exercises">
            <Button>Voltar para Exercícios</Button>
          </Link>
        </div>
      </div>
    )
  }

  const chartConfig = getChartConfig()
  const chartData = getChartData()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/exercises">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{exercise.name}</h1>
            <Badge className={getMuscleGroupColor(exercise.muscle_group)} variant="secondary">
              {exercise.muscle_group}
            </Badge>
          </div>
        </div>
      </div>

      {evolution.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado de evolução</h3>
            <p className="text-gray-600 mb-4">Este exercício ainda não foi realizado em nenhum treino</p>
            <Link href="/progress">
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Iniciar Treino
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {progress && (
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">+{progress.weightIncrease}kg</p>
                      <p className="text-sm text-gray-600">Aumento de peso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">+{Math.round(progress.volumeIncrease)}</p>
                      <p className="text-sm text-gray-600">Aumento de volume</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{progress.totalSessions}</p>
                      <p className="text-sm text-gray-600">Sessões realizadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{Math.round(progress.bestSession.totalVolume)}</p>
                      <p className="text-sm text-gray-600">Melhor volume</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Evolução do Exercício</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={activeChart === "weight" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveChart("weight")}
                  >
                    Peso
                  </Button>
                  <Button
                    variant={activeChart === "volume" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveChart("volume")}
                  >
                    Volume
                  </Button>
                  <Button
                    variant={activeChart === "reps" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveChart("reps")}
                  >
                    Repetições
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: chartConfig.yAxisLabel, angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      labelFormatter={(label) => `Data: ${label}`}
                      formatter={(value: number) => [value, chartConfig.name]}
                    />
                    <Line
                      type="monotone"
                      dataKey={chartConfig.dataKey}
                      stroke={chartConfig.color}
                      strokeWidth={3}
                      dot={{ fill: chartConfig.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume por Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: "Volume (kg)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      labelFormatter={(label) => `Data: ${label}`}
                      formatter={(value: number) => [value, "Volume Total (kg)"]}
                    />
                    <Bar dataKey="totalVolume" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evolution
                  .slice()
                  .reverse()
                  .map((session, index) => (
                    <div key={session.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">#{evolution.length - index}</Badge>
                        <div>
                          <p className="font-medium">{new Date(session.date).toLocaleDateString("pt-BR")}</p>
                          <p className="text-sm text-gray-600">{session.sets} séries realizadas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{session.maxWeight}kg</p>
                          <p className="text-gray-600">Peso máx</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{session.totalReps}</p>
                          <p className="text-gray-600">Reps total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{Math.round(session.totalVolume)}</p>
                          <p className="text-gray-600">Volume</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
