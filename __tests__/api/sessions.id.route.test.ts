import { jest } from "@jest/globals"

jest.mock("../../lib/models/WorkoutSession", () => ({
  __esModule: true,
  WorkoutSessionModel: {
    findByIdWithLogs: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    validateSession: jest.fn(),
  },
}))

describe("API /api/sessions/[id] route", () => {
  let GET: any, PUT: any, DELETE: any, WorkoutSessionModel: any

  beforeEach(async () => {
    jest.clearAllMocks()
    const route = await import("../../app/api/sessions/[id]/route")
    GET = route.GET
    PUT = route.PUT
    DELETE = route.DELETE
    WorkoutSessionModel = (await import("../../lib/models/WorkoutSession")).WorkoutSessionModel
  })

  afterEach(() => jest.clearAllMocks())

  it("GET retorna sessão com logs quando existe", async () => {
    const mockSession = {
      id: 1,
      workout_template_id: 1,
      date: "2025-01-01",
      logs: [{ id: 1, exercise_id: 1, weight: 100 }],
    }
    ;(WorkoutSessionModel.findByIdWithLogs as jest.Mock).mockReturnValue(mockSession)

    const res = await GET({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ id: 1 })
    expect(body.logs).toBeDefined()
  })

  it("GET retorna 404 quando sessão não existe", async () => {
    ;(WorkoutSessionModel.findByIdWithLogs as jest.Mock).mockReturnValue(null)

    const res = await GET({} as any, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("PUT atualiza sessão com dados válidos", async () => {
    const updatedSession = {
      id: 1,
      duration_minutes: 60,
      notes: "Atualizado",
    }
    ;(WorkoutSessionModel.validateSession as jest.Mock).mockReturnValue([])
    ;(WorkoutSessionModel.update as jest.Mock).mockReturnValue(updatedSession)

    const fakeReq = {
      json: async () => ({ duration_minutes: 60, notes: "Atualizado" }),
    } as any

    const res = await PUT(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ duration_minutes: 60 })
  })

  it("PUT retorna 400 para dados inválidos", async () => {
    ;(WorkoutSessionModel.validateSession as jest.Mock).mockReturnValue(["Erro de validação"])

    const fakeReq = {
      json: async () => ({ duration_minutes: -10 }),
    } as any

    const res = await PUT(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(400)  // Se ainda falhar, verifique se a rota chama validateSession antes de update
  })

  it("PUT retorna 404 quando sessão não existe", async () => {
    ;(WorkoutSessionModel.validateSession as jest.Mock).mockReturnValue([])
    ;(WorkoutSessionModel.update as jest.Mock).mockReturnValue(null)

    const fakeReq = {
      json: async () => ({ duration_minutes: 60 }),
    } as any

    const res = await PUT(fakeReq, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("DELETE exclui sessão com sucesso", async () => {
    ;(WorkoutSessionModel.delete as jest.Mock).mockReturnValue(true)

    const res = await DELETE({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("message")
  })

  it("DELETE retorna 404 quando sessão não existe", async () => {
    ;(WorkoutSessionModel.delete as jest.Mock).mockReturnValue(false)

    const res = await DELETE({} as any, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })
})