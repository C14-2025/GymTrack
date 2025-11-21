import { type NextRequest, NextResponse } from "next/server"
import { ExerciseLogModel } from "@/lib/models/WorkoutSession"

// PUT /api/exercise-logs/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      )
    }

    const body = await request.json()

    const errors = ExerciseLogModel.validateLog(body)
    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Dados inválidos", details: errors },
        { status: 400 },
      )
    }

    const updated = ExerciseLogModel.update(id, body)
    if (!updated) {
      return NextResponse.json(
        { error: "Log de exercício não encontrado" },
        { status: 404 },
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating exercise log:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

// DELETE /api/exercise-logs/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      )
    }

    const deleted = ExerciseLogModel.delete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Log de exercício não encontrado" },
        { status: 404 },
      )
    }

    return NextResponse.json({ message: "Log excluído com sucesso" })
  } catch (error: any) {
    // erro específico tratado pelo seu model
    if (typeof error.message === "string" && error.message.includes("sessão finalizada")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      )
    }

    console.error("Error deleting exercise log:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
