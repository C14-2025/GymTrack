"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Dumbbell, Clock, Hash, Weight } from "lucide-react"
import type { WorkoutTemplateWithExercises } from "@/lib/models/WorkoutTemplate"

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const [workout, setWorkout] = useState<WorkoutTemplateWithExercises | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkout()
  }, [])

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkout(data)
      }
    } catch (error) {
      console.error("Error fetching workout:", error)
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando ficha de treino...</div>
        </div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ficha de treino não encontrada</h1>
          <Link href="/workouts">
            <Button>Voltar para Fichas</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/workouts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <Calendar className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">{workout.name}</h1>
        </div>
        <Link href={`/workouts/${workout.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ficha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workout.description && <p className="text-gray-600">{workout.description}</p>}
              <p className="text-sm text-gray-500">
                Criado em: {new Date(workout.created_at!).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-gray-500">Total de exercícios: {workout.exercises.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Exercícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workout.exercises.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhum exercício adicionado ainda</p>
                <Link href={`/workouts/${workout.id}/edit`}>
                  <Button>Adicionar Exercícios</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {workout.exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{exercise.exercise_name}</h4>
                          <Badge className={getMuscleGroupColor(exercise.muscle_group)} variant="secondary">
                            {exercise.muscle_group}
                          </Badge>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Séries:</span>
                          <span>{exercise.sets}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Reps:</span>
                          <span>{exercise.reps}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Peso:</span>
                          <span>{exercise.initial_weight}kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">Descanso:</span>
                          <span>{formatTime(exercise.rest_seconds)}</span>
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
