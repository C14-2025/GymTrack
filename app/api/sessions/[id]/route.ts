import { type NextRequest, NextResponse } from "next/server"
import { WorkoutSessionModel } from "@/lib/models/WorkoutSession"

// GET /api/workout-sessions/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      )
    }

    const session = WorkoutSessionModel.findByIdWithLogs(id)

    if (!session) {
      return NextResponse.json(
        { error: "Sessão de treino não encontrada" },
        { status: 404 },
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error fetching workout session:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

// PUT /api/workout-sessions/[id]
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

    const errors = WorkoutSessionModel.validateSession(body)
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: "Dados inválidos", details: errors },
        { status: 400 },
      )
    }

    const updated = WorkoutSessionModel.update(id, body)

    if (!updated) {
      return NextResponse.json(
        { error: "Sessão de treino não encontrada" },
        { status: 404 },
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating workout session:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

// DELETE /api/workout-sessions/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      )
    }

    const deleted = WorkoutSessionModel.delete(id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Sessão de treino não encontrada" },
        { status: 404 },
      )
    }

    return NextResponse.json({ message: "Sessão excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting workout session:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
