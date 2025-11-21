import { type NextRequest, NextResponse } from "next/server"
import { ExerciseModel } from "@/lib/models/Exercise"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const exercise = ExerciseModel.findById(id)
    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error fetching exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()

    
    const errors = ExerciseModel.validateExercise(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const exercise = ExerciseModel.update(id, body)
    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error updating exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const deleted = ExerciseModel.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exercício excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
