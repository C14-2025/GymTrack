import { type NextRequest, NextResponse } from "next/server"
import { ExerciseLogModel } from "@/lib/models/WorkoutSession"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()

    // Validate input
    const errors = ExerciseLogModel.validateLog(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const log = ExerciseLogModel.update(id, body)
    if (!log) {
      return NextResponse.json({ error: "Log de exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error updating exercise log:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const success = ExerciseLogModel.delete(id)
    if (!success) {
      return NextResponse.json({ error: "Log de exercício não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Log excluído com sucesso" })
  } catch (error) {
    if (error.message.includes("sessão finalizada")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error deleting exercise log:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
