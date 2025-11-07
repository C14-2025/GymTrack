// __tests__/api/sessions.id.logs.route.test.ts
import { jest } from "@jest/globals"

let POST: any
let ExerciseLogModel: any
let WorkoutSessionModel: any

beforeAll(async () => {
  // Mock do módulo único que exporta WorkoutSessionModel e ExerciseLogModel
  jest.doMock("../../lib/models/WorkoutSession", () => {
    return {
      __esModule: true,
      WorkoutSessionModel: {
        // usado possivelmente por outras rotas; deixamos mocks básicos
        findByIdWithLogs: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        validateSession: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      ExerciseLogModel: {
        validateLog: jest.fn(),
        create: jest.fn(),
        findBySessionId: jest.fn(),
        delete: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
      },
    }
  })

  // Agora importamos a rota (após mock)
  const routeModule = await import("../../app/api/sessions/[id]/logs/route")
  POST = routeModule.POST

  // pegar referências para ajustar comportamentos nos testes
  const mod = await import("../../lib/models/WorkoutSession")
  WorkoutSessionModel = mod.WorkoutSessionModel
  ExerciseLogModel = mod.ExerciseLogModel
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("POST /api/sessions/[id]/logs", () => {
  test("deve retornar 400 quando id inválido", async () => {
    const req = { json: async () => ({}) } as any
    const res = await POST(req, { params: { id: "abc" } } as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("error", "ID inválido")
  })

  test("deve retornar 400 quando validação falha", async () => {
    ;(ExerciseLogModel.validateLog as jest.Mock).mockReturnValue(["Erro de validação"])

    const req = {
      json: async () => ({ exercise_id: 1, set_number: -1 }),
    } as any

    const res = await POST(req, { params: { id: "1" } } as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("error", "Dados inválidos")
    expect(body).toHaveProperty("details")
    expect(Array.isArray(body.details)).toBeTruthy()
  })

  test("deve criar log e retornar 201 quando válido", async () => {
    ;(ExerciseLogModel.validateLog as jest.Mock).mockReturnValue([])
    const created = { id: 10, workout_session_id: 1, exercise_id: 2, reps: 8 }
    ;(ExerciseLogModel.create as jest.Mock).mockReturnValue(created)

    const req = {
      json: async () => ({ exercise_id: 2, set_number: 1, reps: 8, weight: 60, completed: true }),
    } as any

    const res = await POST(req, { params: { id: "1" } } as any)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toMatchObject({ id: 10, workout_session_id: 1 })
  })

  test("se ExerciseLogModel.create lançar erro, rota retorna 500", async () => {
    ;(ExerciseLogModel.validateLog as jest.Mock).mockReturnValue([])
    ;(ExerciseLogModel.create as jest.Mock).mockImplementation(() => {
      throw new Error("DB error")
    })

    const req = {
      json: async () => ({ exercise_id: 2, set_number: 1, reps: 8 }),
    } as any

    const res = await POST(req, { params: { id: "1" } } as any)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toHaveProperty("error", "Erro interno do servidor")
  })
})
