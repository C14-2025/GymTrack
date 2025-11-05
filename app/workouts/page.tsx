"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Edit, Trash2, Eye } from "lucide-react"
import type { WorkoutTemplate } from "@/lib/models/WorkoutTemplate"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts")
      const data = await response.json()
      setWorkouts(data)
    } catch (error) {
      console.error("Error fetching workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkout = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta ficha de treino?")) return

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setWorkouts(workouts.filter((workout) => workout.id !== id))
      } else {
        alert("Erro ao excluir ficha de treino")
      }
    } catch (error) {
      console.error("Error deleting workout:", error)
      alert("Erro ao excluir ficha de treino")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando fichas de treino...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Fichas de Treino</h1>
        </div>
        <Link href="/workouts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ficha
          </Button>
        </Link>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma ficha de treino encontrada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira ficha de treino personalizada</p>
            <Link href="/workouts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Ficha
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{workout.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      Ficha de Treino
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/workouts/${workout.id}`}>
                      <Button variant="outline" size="sm" title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/workouts/${workout.id}/edit`}>
                      <Button variant="outline" size="sm" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWorkout(workout.id!)}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {workout.description && <CardDescription className="mb-3">{workout.description}</CardDescription>}
                <div className="text-sm text-gray-600">
                  <p>Criado em: {new Date(workout.created_at!).toLocaleDateString("pt-BR")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-gray-600">
        <p>Total: {workouts.length} ficha(s) de treino</p>
      </div>
    </div>
  )
}
