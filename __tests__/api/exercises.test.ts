// __tests__/api/exercises.test.ts
import { jest } from "@jest/globals"

let GET: any
let POST: any
let ExerciseModel: any
let dbMock: any

beforeAll(async () => {
  // mock do DB - deve ser feito antes de importar a rota
  jest.doMock("../../lib/database", () => {
    return {
      __esModule: true,
      default: {
        prepare: jest.fn(() => ({
          all: jest.fn(() => []),
          get: jest.fn(),
          run: jest.fn(() => ({ lastInsertRowid: 1 })),
        })),
        exec: jest.fn(),
      },
    }
  })

  // mock do model Exercise
  jest.doMock("../../lib/models/Exercise", () => {
    return {
      __esModule: true,
      ExerciseModel: {
        findAll: jest.fn(() => []),
        create: jest.fn((data: any) => ({
          id: 1,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        validateExercise: jest.fn(() => []),
      },
    }
  })

  // agora importamos a rota (ela receberá os mocks acima)
  const routeModule = await import("../../app/api/exercises/route")
  GET = routeModule.GET
  POST = routeModule.POST

  // para inspeção nas asserções dos testes
  const dbModule = await import("../../lib/database")
  dbMock = dbModule.default
  const exerciseModule = await import("../../lib/models/Exercise")
  ExerciseModel = exerciseModule.ExerciseModel
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("/api/exercises", () => {
  test("GET should return exercises list", async () => {
    const request = {
      url: "http://localhost:3000/api/exercises",
      method: "GET",
    } as any

    const response = await GET(request)
    expect(response.status).toBe(200)
  })

  test("POST should create new exercise", async () => {
    // garante que a validação não retorne erros
    ExerciseModel.validateExercise.mockReturnValue([])

    const exerciseData = {
      name: "Test Exercise",
      muscle_group: "Peito",
      description: "Test description",
    }

    const request = {
      url: "http://localhost:3000/api/exercises",
      method: "POST",
      json: async () => exerciseData,
    } as any

    const response = await POST(request)
    // quando a rota usa o model mockado, deve retornar 201
    expect(response.status).toBe(201)
  })

  test("POST should validate required fields", async () => {
    ExerciseModel.validateExercise.mockReturnValue(["Nome do exercício é obrigatório"])

    const invalidData = {
      name: "",
      muscle_group: "Peito",
    }

    const request = {
      url: "http://localhost:3000/api/exercises",
      method: "POST",
      json: async () => invalidData,
    } as any

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
