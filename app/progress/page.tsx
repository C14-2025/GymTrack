"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Calendar, Play, Eye } from "lucide-react"
import type { WorkoutTemplate } from "@/lib/models/WorkoutTemplate"
import type { WorkoutSession } from "@/lib/models/WorkoutSession"

export default function ProgressPage() {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([])
  const [recentSessions, setRecentSessions] = useState<(WorkoutSession & { template_name: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [workoutsResponse, sessionsResponse] = await Promise.all([fetch("/api/workouts"), fetch("/api/sessions")])

      const workoutsData = await workoutsResponse.json()
      const sessionsData = await sessionsResponse.json()

      setWorkouts(workoutsData)
      setRecentSessions(sessionsData.slice(0, 5)) 
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold">Registrar Progresso</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Iniciar Treino
            </CardTitle>
            <CardDescription>Selecione uma ficha de treino para começar</CardDescription>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma ficha de treino encontrada</p>
                <Link href="/workouts/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Ficha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workouts.map((workout) => (
                  <Card key={workout.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      {workout.description && <CardDescription>{workout.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <Link href={`/progress/start/${workout.id}`}>
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Treino
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Treinos Recentes
              </CardTitle>
              <Link href="/progress/history">
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum treino registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{session.template_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{new Date(session.date).toLocaleDateString("pt-BR")}</span>
                            {session.duration_minutes && <span>{session.duration_minutes} min</span>}
                          </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
