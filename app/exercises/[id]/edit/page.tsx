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

import { ArrowLeft, Save, Dumbbell } from "lucide-react"

import type { Exercise } from "@/lib/models/Exercise"

export default function EditExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    muscle_group: "",
    description: "",
    video_url: "",
  })

  const muscleGroups = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas", "Glúteos", "Abdômen", "Cardio"]

  useEffect(() => {
    fetchExercise()
  }, [])

  const fetchExercise = async () => {
    try {
      const response = await fetch(`/api/exercises/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setExercise(data)
        setFormData({
          name: data.name,
          muscle_group: data.muscle_group,
          description: data.description || "",
          video_url: data.video_url || "",
        })
      } else {
        router.push("/exercises")
      }
    } catch (error) {
      console.error("Error fetching exercise:", error)
      router.push("/exercises")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors([])

    try {
      const response = await fetch(`/api/exercises/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/exercises")
      } else {
        if (data.details) {
          setErrors(data.details)
        } else {
          setErrors([data.error || "Erro ao atualizar exercício"])
        }
      }
    } catch (error) {
      console.error("Error updating exercise:", error)
      setErrors(["Erro interno do servidor"])
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando exercício...</div>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/exercises">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Editar Exercício</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <h4 className="text-red-800 font-semibold mb-2">Erro ao atualizar exercício:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nome do Exercício *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Supino reto com barra"
                required
              />
            </div>

            <div>
              <Label htmlFor="muscle_group">Grupo Muscular *</Label>
              <select
                id="muscle_group"
                name="muscle_group"
                value={formData.muscle_group}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um grupo muscular</option>
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva como executar o exercício..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="video_url">Link do Vídeo (opcional)</Label>
              <Input
                id="video_url"
                name="video_url"
                type="url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Link href="/exercises">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
