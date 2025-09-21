import { type NextRequest, NextResponse } from "next/server"
import { WorkoutTemplateModel } from "@/lib/models/WorkoutTemplate"

export async function GET() {
  try {
    const workouts = WorkoutTemplateModel.findAll()
    return NextResponse.json(workouts)
  } catch (error) {
    console.error("Error fetching workout templates:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const errors = WorkoutTemplateModel.validateTemplate(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const workout = WorkoutTemplateModel.create(body)
    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    console.error("Error creating workout template:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
