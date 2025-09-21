import { type NextRequest, NextResponse } from "next/server"
import { WorkoutSessionModel } from "@/lib/models/WorkoutSession"

export async function GET() {
  try {
    const sessions = WorkoutSessionModel.findAll()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching workout sessions:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const errors = WorkoutSessionModel.validateSession(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const session = WorkoutSessionModel.create(body)
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("Error creating workout session:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
