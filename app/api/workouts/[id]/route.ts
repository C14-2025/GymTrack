import { type NextRequest, NextResponse } from "next/server"
import { WorkoutTemplateModel } from "@/lib/models/WorkoutTemplate"

// Helpers reutilizáveis
function parseWorkoutId(id: string) {
  const num = Number.parseInt(id)
  return isNaN(num) ? null : num
}

function badRequest(message: string, details?: any) {
  return NextResponse.json({ error: message, ...(details && { details }) }, { status: 400 })
}

function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 })
}

function serverError(context: string, error: unknown) {
  console.error(context, error)
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workoutId = parseWorkoutId(params.id)
    if (!workoutId) return badRequest("ID inválido")

    const workout = WorkoutTemplateModel.findByIdWithExercises(workoutId)
    if (!workout) return notFound("Ficha de treino não encontrada")

    return NextResponse.json(workout)
  } catch (error) {
    return serverError("Error fetching workout template:", error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workoutId = parseWorkoutId(params.id)
    if (!workoutId) return badRequest("ID inválido")

    const body = await request.json()

    const errors = WorkoutTemplateModel.validateTemplate(body)
    if (errors.length > 0) {
      return badRequest("Dados inválidos", errors)
    }

    const workout = WorkoutTemplateModel.update(workoutId, body)
    if (!workout) return notFound("Ficha de treino não encontrada")

    return NextResponse.json(workout)
  } catch (error) {
    return serverError("Error updating workout template:", error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workoutId = parseWorkoutId(params.id)
    if (!workoutId) return badRequest("ID inválido")

    const deleted = WorkoutTemplateModel.delete(workoutId)
    if (!deleted) return notFound("Ficha de treino não encontrada")

    return NextResponse.json({ message: "Ficha de treino excluída com sucesso" })
  } catch (error) {
    return serverError("Error deleting workout template:", error)
  }
}
