import { jest } from "@jest/globals"

jest.mock("next/server", () => ({
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

jest.mock("../../lib/models/WorkoutTemplate", () => ({
  __esModule: true,
  WorkoutTemplateModel: {
    addExercise: jest.fn(),
    removeExercise: jest.fn(),
    validateTemplateExercise: jest.fn(),
  },
}))

describe("API /api/workouts/[id]/exercises route", () => {
  let POST: any, DELETE: any, WorkoutTemplateModel: any

  beforeEach(async () => {
    jest.clearAllMocks()
    const route = await import("../../app/api/workouts/[id]/exercises/route")
    POST = route.POST
    DELETE = route.DELETE
    WorkoutTemplateModel = (await import("../../lib/models/WorkoutTemplate")).WorkoutTemplateModel
  })

  afterEach(() => jest.clearAllMocks())

  it("POST adiciona exercício ao template com dados válidos", async () => {
    const mockExercise = {
      id: 1,
      workout_template_id: 1,
      exercise_id: 5,
      sets: 3,
      reps: 10,
      weight: 100,
      rest_seconds: 60,
      order_index: 1,
    }
    ;(WorkoutTemplateModel.validateTemplateExercise as jest.Mock).mockReturnValue([])
    ;(WorkoutTemplateModel.addExercise as jest.Mock).mockReturnValue(mockExercise)

    const fakeReq = {
      json: async () => ({
        exercise_id: 5,
        sets: 3,
        reps: 10,
        weight: 100,
      }),
    } as any

    const res = await POST(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toMatchObject({ exercise_id: 5, sets: 3 })
  })

  it("POST retorna 400 para dados inválidos", async () => {
    ;(WorkoutTemplateModel.validateTemplateExercise as jest.Mock).mockReturnValue([
      "Número de séries deve ser positivo",
    ])

    const fakeReq = {
      json: async () => ({
        exercise_id: 5,
        sets: 0,
      }),
    } as any

    const res = await POST(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("errors")
  })

  it("POST retorna 404 quando template não existe", async () => {
    ;(WorkoutTemplateModel.validateTemplateExercise as jest.Mock).mockReturnValue([])
    ;(WorkoutTemplateModel.addExercise as jest.Mock).mockReturnValue(null)

    const fakeReq = {
      json: async () => ({ exercise_id: 5, sets: 3 }),
    } as any

    const res = await POST(fakeReq, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("DELETE remove exercício do template", async () => {
    ;(WorkoutTemplateModel.removeExercise as jest.Mock).mockReturnValue(true)

    const fakeReq = {
      json: async () => ({ exercise_id: 5 }),
    } as any

    const res = await DELETE(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("message")
  })

  it("DELETE retorna 404 quando exercício não está no template", async () => {
    ;(WorkoutTemplateModel.removeExercise as jest.Mock).mockReturnValue(false)

    const fakeReq = {
      json: async () => ({ exercise_id: 999 }),
    } as any

    const res = await DELETE(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(404)
  })

  it("DELETE retorna 400 quando exercise_id não é fornecido", async () => {
    const fakeReq = {
      json: async () => ({}),
    } as any

    const res = await DELETE(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(400)
  })
})
