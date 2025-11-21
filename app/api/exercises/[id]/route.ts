import { type NextRequest, NextResponse } from "next/server"
import { ExerciseModel } from "@/lib/models/Exercise"

// GET
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const parsedId = Number.parseInt(id)

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const exercise = ExerciseModel.findById(parsedId)
    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error fetching exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const parsedId = Number.parseInt(id)

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()

    const errors = ExerciseModel.validateExercise(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const exercise = ExerciseModel.update(parsedId, body)
    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error updating exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const parsedId = Number.parseInt(id)

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const deleted = ExerciseModel.delete(parsedId)
    if (!deleted) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exercício excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
