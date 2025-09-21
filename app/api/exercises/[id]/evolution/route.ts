import { type NextRequest, NextResponse } from "next/server"
import { ExerciseLogModel } from "@/lib/models/WorkoutSession"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const logs = ExerciseLogModel.findByExerciseId(id)

    // Group logs by date and calculate metrics
    const evolutionData: Record<
      string,
      {
        date: string
        maxWeight: number
        totalVolume: number
        totalReps: number
        sets: number
        avgWeight: number
      }
    > = {}

    logs.forEach((log) => {
      const date = log.date
      if (!evolutionData[date]) {
        evolutionData[date] = {
          date,
          maxWeight: 0,
          totalVolume: 0,
          totalReps: 0,
          sets: 0,
          avgWeight: 0,
        }
      }

      const data = evolutionData[date]
      data.maxWeight = Math.max(data.maxWeight, log.weight)
      data.totalVolume += log.weight * log.reps
      data.totalReps += log.reps
      data.sets += 1
    })

    // Calculate average weight and sort by date
    const evolution = Object.values(evolutionData)
      .map((data) => ({
        ...data,
        avgWeight: Number((data.totalVolume / data.totalReps).toFixed(1)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate progress metrics
    const firstSession = evolution[0]
    const lastSession = evolution[evolution.length - 1]

    const progress = {
      weightIncrease: lastSession ? lastSession.maxWeight - firstSession.maxWeight : 0,
      volumeIncrease: lastSession ? lastSession.totalVolume - firstSession.totalVolume : 0,
      totalSessions: evolution.length,
      bestSession: evolution.reduce(
        (best, current) => (current.totalVolume > best.totalVolume ? current : best),
        evolution[0] || {},
      ),
    }

    return NextResponse.json({ evolution, progress, rawLogs: logs })
  } catch (error) {
    console.error("Error fetching exercise evolution:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
