import { type NextRequest, NextResponse } from "next/server"
import { ExerciseLogModel } from "@/lib/models/WorkoutSession"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = Number.parseInt(params.id)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const logData = { ...body, workout_session_id: sessionId }

    // Validate input
    const errors = ExerciseLogModel.validateLog(logData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const log = ExerciseLogModel.create(logData)
    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("Error creating exercise log:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
