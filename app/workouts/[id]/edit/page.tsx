"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Plus,
  Save,
  Trash2,
} from "lucide-react"

import type { WorkoutTemplateWithExercises } from "@/lib/models/WorkoutTemplate"
import type { Exercise } from "@/lib/models/Exercise"

export default function EditWorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutTemplateWithExercises | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [newExercise, setNewExercise] = useState({
    exercise_id: "",
    sets: 3,
    reps: 12,
    initial_weight: 0,
    rest_seconds: 60,
    order_index: 0,
  })

  useEffect(() => {
    fetchWorkout()
    fetchExercises()
  }, [])

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkout(data)
        setFormData({
          name: data.name,
          description: data.description || "",
        })
      } else {
        router.push("/workouts")
      }
    } catch (error) {
      console.error("Error fetching workout:", error)
      router.push("/workouts")
    } finally {
      setLoading(false)
    }
  }

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises")
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error("Error fetching exercises:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors([])

    try {
      const response = await fetch(`/api/workouts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/workouts/${params.id}`)
      } else {
        if (data.details) {
          setErrors(data.details)
        } else {
          setErrors([data.error || "Erro ao atualizar ficha"])
        }
      }
    } catch (error) {
      console.error("Error updating workout:", error)
      setErrors(["Erro interno do servidor"])
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const exerciseData = {
        ...newExercise,
        exercise_id: Number.parseInt(newExercise.exercise_id),
        order_index: workout?.exercises.length || 0,
      }

      const response = await fetch(`/api/workouts/${params.id}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exerciseData),
      })

      if (response.ok) {
        setShowAddExercise(false)
        setNewExercise({
          exercise_id: "",
          sets: 3,
          reps: 12,
          initial_weight: 0,
          rest_seconds: 60,
          order_index: 0,
        })
        fetchWorkout() 
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao adicionar exercício")
      }
    } catch (error) {
      console.error("Error adding exercise:", error)
      alert("Erro ao adicionar exercício")
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
        <Link href={`/workouts/${workout.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Editar Ficha</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ficha</CardTitle>
          </CardHeader>
          <CardContent>
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h4 className="text-red-800 font-semibold mb-2">Erro ao atualizar ficha:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nome da Ficha *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o objetivo desta ficha de treino..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Exercícios ({workout.exercises.length})
              </CardTitle>
              <Button onClick={() => setShowAddExercise(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddExercise && (
              <Card className="mb-6 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Exercício</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddExercise} className="space-y-4">
                    <div>
                      <Label htmlFor="exercise_id">Exercício *</Label>
                      <select
                        id="exercise_id"
                        value={newExercise.exercise_id}
                        onChange={(e) => setNewExercise({ ...newExercise, exercise_id: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um exercício</option>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name} ({exercise.muscle_group})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="sets">Séries *</Label>
                        <Input
                          id="sets"
                          type="number"
                          min="1"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise({ ...newExercise, sets: Number.parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reps">Repetições *</Label>
                        <Input
                          id="reps"
                          type="number"
                          min="1"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise({ ...newExercise, reps: Number.parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="initial_weight">Peso (kg)</Label>
                        <Input
                          id="initial_weight"
                          type="number"
                          min="0"
                          step="0.5"
                          value={newExercise.initial_weight}
                          onChange={(e) =>
                            setNewExercise({ ...newExercise, initial_weight: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="rest_seconds">Descanso (s)</Label>
                        <Input
                          id="rest_seconds"
                          type="number"
                          min="0"
                          value={newExercise.rest_seconds}
                          onChange={(e) =>
                            setNewExercise({ ...newExercise, rest_seconds: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">Adicionar Exercício</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddExercise(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {workout.exercises.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhum exercício adicionado ainda</p>
                <Button onClick={() => setShowAddExercise(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Exercício
                </Button>
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Séries:</span> {exercise.sets}
                        </div>
                        <div>
                          <span className="font-medium">Reps:</span> {exercise.reps}
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span> {exercise.initial_weight}kg
                        </div>
                        <div>
                          <span className="font-medium">Descanso:</span> {exercise.rest_seconds}s
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
