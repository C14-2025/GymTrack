import { type NextRequest, NextResponse } from "next/server"
import { WorkoutTemplateModel } from "@/lib/models/WorkoutTemplate"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workoutId = Number.parseInt(params.id)
    if (isNaN(workoutId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()

    // Validate input
    const errors = WorkoutTemplateModel.validateTemplateExercise(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const success = WorkoutTemplateModel.addExercise(workoutId, body)
    if (!success) {
      return NextResponse.json({ error: "Erro ao adicionar exercício" }, { status: 400 })
    }

    return NextResponse.json({ message: "Exercício adicionado com sucesso" }, { status: 201 })
  } catch (error) {
    console.error("Error adding exercise to workout:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
