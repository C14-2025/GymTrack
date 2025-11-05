"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Play, Check, Clock, Weight, Hash } from "lucide-react"
import type { WorkoutTemplateWithExercises } from "@/lib/models/WorkoutTemplate"

interface ExerciseProgress {
  exercise_id: number
  sets: { reps: number; weight: number; completed: boolean }[]
}

export default function StartWorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutTemplateWithExercises | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [progress, setProgress] = useState<Record<number, ExerciseProgress>>({})
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchWorkout()
  }, [])

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkout(data)
        initializeProgress(data)
      } else {
        router.push("/progress")
      }
    } catch (error) {
      console.error("Error fetching workout:", error)
      router.push("/progress")
    } finally {
      setLoading(false)
    }
  }

  const initializeProgress = (workoutData: WorkoutTemplateWithExercises) => {
    const initialProgress: Record<number, ExerciseProgress> = {}

    workoutData.exercises.forEach((exercise) => {
      initialProgress[exercise.exercise_id] = {
        exercise_id: exercise.exercise_id,
        sets: Array.from({ length: exercise.sets }, () => ({
          reps: exercise.reps,
          weight: exercise.initial_weight,
          completed: false,
        })),
      }
    })

    setProgress(initialProgress)
  }

  const startWorkout = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workout_template_id: Number.parseInt(params.id),
          date: new Date().toISOString().split("T")[0],
        }),
      })

      if (response.ok) {
        const session = await response.json()
        setSessionId(session.id)
        setStartTime(new Date())
      } else {
        alert("Erro ao iniciar treino")
      }
    } catch (error) {
      console.error("Error starting workout:", error)
      alert("Erro ao iniciar treino")
    }
  }

  const updateSet = (exerciseId: number, setIndex: number, field: "reps" | "weight", value: number) => {
    setProgress((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId].sets.map((set, index) => (index === setIndex ? { ...set, [field]: value } : set)),
      },
    }))
  }

  const toggleSetCompleted = (exerciseId: number, setIndex: number) => {
    setProgress((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId].sets.map((set, index) =>
          index === setIndex ? { ...set, completed: !set.completed } : set,
        ),
      },
    }))
  }

  const finishWorkout = async () => {
    if (!sessionId || !startTime) return

    setSaving(true)

    try {
      // Calculate duration
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60)

      // Update session with duration and notes
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration_minutes: duration,
          notes: notes || null,
        }),
      })

      // Save all exercise logs
      for (const [exerciseId, exerciseProgress] of Object.entries(progress)) {
        for (let setIndex = 0; setIndex < exerciseProgress.sets.length; setIndex++) {
          const set = exerciseProgress.sets[setIndex]

          await fetch(`/api/sessions/${sessionId}/logs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              exercise_id: Number.parseInt(exerciseId),
              set_number: setIndex + 1,
              reps: set.reps,
              weight: set.weight,
              completed: set.completed,
            }),
          })
        }
      }

      router.push(`/progress/session/${sessionId}`)
    } catch (error) {
      console.error("Error finishing workout:", error)
      alert("Erro ao finalizar treino")
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando treino...</div>
        </div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ficha de treino não encontrada</h1>
          <Link href="/progress">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/progress">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <Play className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">{workout.name}</h1>
        </div>
        {sessionId && startTime && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Iniciado às {startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}
      </div>

      {!sessionId ? (
        <Card>
          <CardHeader>
            <CardTitle>Pronto para começar?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Você está prestes a iniciar o treino <strong>{workout.name}</strong> com {workout.exercises.length}{" "}
                exercícios.
              </p>
              <Button onClick={startWorkout} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Treino
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.exercise_id} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.exercise_name}</CardTitle>
                    <Badge className={getMuscleGroupColor(exercise.muscle_group)} variant="secondary">
                      {exercise.muscle_group}
                    </Badge>
                  </div>
                  <Badge variant="outline">#{exerciseIndex + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progress[exercise.exercise_id]?.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Série {setIndex + 1}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`reps-${exercise.exercise_id}-${setIndex}`} className="text-sm">
                          Reps:
                        </Label>
                        <Input
                          id={`reps-${exercise.exercise_id}-${setIndex}`}
                          type="number"
                          min="0"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(exercise.exercise_id, setIndex, "reps", Number.parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) =>
                            updateSet(exercise.exercise_id, setIndex, "weight", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">kg</span>
                      </div>

                      <Button
                        variant={set.completed ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSetCompleted(exercise.exercise_id, setIndex)}
                        className={set.completed ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Observações do Treino</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Como foi o treino? Alguma observação importante..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={finishWorkout} disabled={saving} className="flex-1">
              {saving ? "Finalizando..." : "Finalizar Treino"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
