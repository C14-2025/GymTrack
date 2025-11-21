import { type NextRequest, NextResponse } from "next/server"
import { WorkoutTemplateModel } from "@/lib/models/WorkoutTemplate"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const workout = WorkoutTemplateModel.findByIdWithExercises(id)
    if (!workout) {
      return NextResponse.json({ error: "Ficha de treino não encontrada" }, { status: 404 })
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error("Error fetching workout template:", error)
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

    
    const errors = WorkoutTemplateModel.validateTemplate(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const workout = WorkoutTemplateModel.update(id, body)
    if (!workout) {
      return NextResponse.json({ error: "Ficha de treino não encontrada" }, { status: 404 })
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error("Error updating workout template:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const deleted = WorkoutTemplateModel.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Ficha de treino não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ficha de treino excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting workout template:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
