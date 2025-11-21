import { type NextRequest, NextResponse } from "next/server"
import { WorkoutSessionModel } from "@/lib/models/WorkoutSession"

// GET /api/workout-sessions
export async function GET() {
  try {
    const sessions = WorkoutSessionModel.findAll()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching workout sessions:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

// POST /api/workout-sessions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const errors = WorkoutSessionModel.validateSession(body)
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: "Dados inválidos", details: errors },
        { status: 400 },
      )
    }

    const created = WorkoutSessionModel.create(body)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating workout session:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
