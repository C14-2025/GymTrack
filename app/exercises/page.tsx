"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ExternalLink, Dumbbell, BarChart3 } from "lucide-react"
import type { Exercise } from "@/lib/models/Exercise"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all")
  const [loading, setLoading] = useState(true)

  const muscleGroups = [
    "all",
    "Peito",
    "Costas",
    "Ombros",
    "Bíceps",
    "Tríceps",
    "Pernas",
    "Glúteos",
    "Abdômen",
    "Cardio",
  ]

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm, selectedMuscleGroup])

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises")
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error("Error fetching exercises:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    if (searchTerm) {
      filtered = filtered.filter((exercise) => exercise.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter((exercise) => exercise.muscle_group === selectedMuscleGroup)
    }

    setFilteredExercises(filtered)
  }

  const deleteExercise = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este exercício?")) return

    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setExercises(exercises.filter((ex) => ex.id !== id))
      } else {
        alert("Erro ao excluir exercício")
      }
    } catch (error) {
      console.error("Error deleting exercise:", error)
      alert("Erro ao excluir exercício")
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
          <div className="text-lg">Carregando exercícios...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Exercícios</h1>
        </div>
        <Link href="/exercises/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Exercício
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar exercícios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedMuscleGroup}
          onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {muscleGroups.map((group) => (
            <option key={group} value={group}>
              {group === "all" ? "Todos os grupos" : group}
            </option>
          ))}
        </select>
      </div>

      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
            <p className="text-gray-600 mb-4">
              {exercises.length === 0 ? "Comece criando seu primeiro exercício" : "Tente ajustar os filtros de busca"}
            </p>
            <Link href="/exercises/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Exercício
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{exercise.name}</CardTitle>
                    <Badge className={getMuscleGroupColor(exercise.muscle_group)}>{exercise.muscle_group}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/exercises/${exercise.id}/evolution`}>
                      <Button variant="outline" size="sm" title="Ver Evolução">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/exercises/${exercise.id}/edit`}>
                      <Button variant="outline" size="sm" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteExercise(exercise.id!)}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {exercise.description && <CardDescription className="mb-3">{exercise.description}</CardDescription>}
                {exercise.video_url && (
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver vídeo
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-gray-600">
        <p>Total: {filteredExercises.length} exercício(s)</p>
      </div>
    </div>
  )
}
