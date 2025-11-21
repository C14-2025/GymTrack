import { type NextRequest, NextResponse } from "next/server"
import { WorkoutTemplateModel } from "@/lib/models/WorkoutTemplate"

// Helpers
function badRequest(message: string, details?: any) {
  return NextResponse.json({ error: message, ...(details && { details }) }, { status: 400 })
}

function serverError(context: string, error: unknown) {
  console.error(context, error)
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
}

export async function GET() {
  try {
    const workouts = WorkoutTemplateModel.findAll()
    return NextResponse.json(workouts)
  } catch (error) {
    return serverError("Error fetching workout templates:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const errors = WorkoutTemplateModel.validateTemplate(body)
    if (errors.length > 0) {
      return badRequest("Dados inválidos", errors)
    }

    const workout = WorkoutTemplateModel.create(body)
    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    return serverError("Error creating workout template:", error)
  }
}
