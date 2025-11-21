import { type NextRequest, NextResponse } from "next/server"
import { WorkoutTemplateModel } from "@/lib/models/WorkoutTemplate"

// Helpers seguros
function parseWorkoutId(id: string) {
  const num = Number.parseInt(id)
  return isNaN(num) ? null : num
}

function badRequest(message: string, details?: any) {
  return NextResponse.json({ error: message, ...(details && { details }) }, { status: 400 })
}

function serverError(message: string, error: unknown) {
  console.error(message, error)
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workoutId = parseWorkoutId(params.id)
    if (!workoutId) return badRequest("ID inválido")

    const body = await request.json()

    const errors = WorkoutTemplateModel.validateTemplateExercise(body)
    if (errors.length > 0) {
      return badRequest("Dados inválidos", errors)
    }

    const success = WorkoutTemplateModel.addExercise(workoutId, body)
    if (!success) {
      return badRequest("Erro ao adicionar exercício")
    }

    return NextResponse.json({ message: "Exercício adicionado com sucesso" }, { status: 201 })
  } catch (error) {
    return serverError("Error adding exercise to workout:", error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workoutId = parseWorkoutId(params.id)
    if (!workoutId) return badRequest("ID inválido")

    const body = await request.json()
    const exerciseId = body.exercise_id

    if (!exerciseId) return badRequest("exercise_id é obrigatório")

    const success = WorkoutTemplateModel.removeExercise(workoutId, exerciseId)

    if (!success) {
      return NextResponse.json({ error: "Exercício não encontrado no template" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exercício removido com sucesso" })
  } catch (error) {
    return serverError("Error removing exercise from workout:", error)
  }
}
