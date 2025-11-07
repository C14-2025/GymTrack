import { jest } from "@jest/globals"

jest.doMock("next/server", () => ({
  __esModule: true,
  NextRequest: class MockNextRequest {
    constructor(init?: any) {
      this._body = init?.body
    }
    async json() {
      return this._body ?? null
    }
  },
  NextResponse: {
    json(payload: any, opts?: any) {
      return {
        status: opts?.status ?? 200,
        async json() {
          return payload
        },
      }
    },
  },
}))

jest.doMock("../../lib/models/WorkoutSession", () => ({
  __esModule: true,
  ExerciseLogModel: { findByExerciseId: jest.fn() },
}))

describe("GET /api/exercises/[id]/evolution", () => {
  let GET: any
  let ExerciseLogModel: any

  beforeEach(() => {
    jest.resetModules()

    const route = require("../../app/api/exercises/[id]/evolution/route")
    GET = route.GET
    ExerciseLogModel = require("../../lib/models/WorkoutSession").ExerciseLogModel
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("retorna evolution e progress", async () => {
    const logs = [
      { date: "2025-01-01", weight: 100, reps: 5 },
      { date: "2025-02-01", weight: 110, reps: 3 },
    ]
    ;(ExerciseLogModel.findByExerciseId as jest.Mock).mockReturnValue(logs)

    const res = await GET({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)

    const body = await res.json()

    expect(body).toHaveProperty("evolution")
    expect(body).toHaveProperty("progress")
    expect(body.rawLogs).toEqual(logs)
  })
  it("GET retorna 400 se o ID for inválido", async () => {
    
    const res = await GET({} as any, { params: { id: "nao_e_numero" } } as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toMatchObject({ error: "ID inválido" })
})

it("GET retorna 500 em caso de erro interno do servidor", async () => {
    
    ;(ExerciseLogModel.findByExerciseId as jest.Mock).mockImplementation(() => {
        throw new Error("DB Error")
    })

    const res = await GET({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({ error: "Erro interno do servidor" })
})
it("retorna dados zerados quando não há logs de exercícios", async () => {
    
    ;(ExerciseLogModel.findByExerciseId as jest.Mock).mockReturnValue([])

    const res = await GET({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)

    const body = await res.json()

    
    expect(body.evolution).toEqual([])
    expect(body.rawLogs).toEqual([])

    
    expect(body.progress.weightIncrease).toBe(0)
    expect(body.progress.volumeIncrease).toBe(0)
    expect(body.progress.totalSessions).toBe(0)
    
    expect(body.progress.bestSession).toEqual({})
})
})
