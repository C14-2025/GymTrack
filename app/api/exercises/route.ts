import { type NextRequest, NextResponse } from "next/server"
import { ExerciseModel } from "@/lib/models/Exercise"

export async function GET() {
  try {
    const exercises = ExerciseModel.findAll()
    return NextResponse.json(exercises)
  } catch (error) {
    console.error("Error fetching exercises:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const errors = ExerciseModel.validateExercise(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    // Check for duplicate name
    const existingExercises = ExerciseModel.findAll()
    const nameExists = existingExercises.some((ex) => ex.name.toLowerCase() === body.name.toLowerCase())

    if (nameExists) {
      return NextResponse.json({ error: "Já existe um exercício com este nome" }, { status: 409 })
    }

    const exercise = ExerciseModel.create(body)
    return NextResponse.json(exercise, { status: 201 })
  } catch (error) {
    console.error("Error creating exercise:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
