"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import type { WorkoutSessionWithLogs } from "@/lib/models/WorkoutSession"

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<WorkoutSessionWithLogs | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
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

  const groupLogsByExercise = (logs: WorkoutSessionWithLogs["logs"]) => {
    const grouped: Record<number, typeof logs> = {}
    logs.forEach((log) => {
      if (!grouped[log.exercise_id]) {
        grouped[log.exercise_id] = []
      }
      grouped[log.exercise_id].push(log)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando sessão...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sessão não encontrada</h1>
          <Link href="/progress">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  const groupedLogs = groupLogsByExercise(session.logs)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/progress">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Treino Concluído</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{session.template_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Data:</span>
                <span>{new Date(session.date).toLocaleDateString("pt-BR")}</span>
              </div>
              {session.duration_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Duração:</span>
                  <span>{session.duration_minutes} minutos</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Exercícios:</span>
                <span>{Object.keys(groupedLogs).length}</span>
              </div>
            </div>
            {session.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Observações:</p>
                <p className="text-gray-700">{session.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercícios Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([exerciseId, logs]) => {
                const firstLog = logs[0]
                const completedSets = logs.filter((log) => log.completed).length
                const totalSets = logs.length

                return (
                  <Card key={exerciseId} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{firstLog.exercise_name}</CardTitle>
                          <Badge className={getMuscleGroupColor(firstLog.muscle_group)} variant="secondary">
                            {firstLog.muscle_group}
                          </Badge>
                        </div>
                        <Badge variant={completedSets === totalSets ? "default" : "secondary"}>
                          {completedSets}/{totalSets} séries
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">Série {log.set_number}</span>
                              <span>{log.reps} reps</span>
                              <span>{log.weight}kg</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {log.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm text-gray-600">
                                {log.completed ? "Concluída" : "Não concluída"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
