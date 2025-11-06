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

jest.doMock("../../lib/models/Exercise", () => {
  return {
    __esModule: true,
    ExerciseModel: {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      validateExercise: jest.fn(),
    },
  }
})

describe("API /api/exercises route", () => {
  const { GET, POST } = require("../../app/api/exercises/route")
  const { ExerciseModel } = require("../../lib/models/Exercise")

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it("GET deve retornar lista e status 200", async () => {
    ;(ExerciseModel.findAll as jest.Mock).mockReturnValue([{ id: 1, name: "Ex", muscle_group: "Perna" }])
    const res = await GET({} as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body[0]).toMatchObject({ id: 1, name: "Ex" })
  })

  it("POST cria novo exercício quando válido", async () => {
    ;(ExerciseModel.findAll as jest.Mock).mockReturnValue([]) // checa duplicados
    ;(ExerciseModel.validateExercise as jest.Mock).mockReturnValue([]) // valida ok
    ;(ExerciseModel.create as jest.Mock).mockReturnValue({ id: 10, name: "Novo", muscle_group: "Peito" })

    const fakeReq = { json: async () => ({ name: "Novo", muscle_group: "Peito" }) } as any
    const res = await POST(fakeReq)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toMatchObject({ id: 10, name: "Novo" })
  })

  it("POST retorna 400 quando validação falha", async () => {
    ;(ExerciseModel.validateExercise as jest.Mock).mockReturnValue(["erro"])
    const fakeReq = { json: async () => ({ name: "", muscle_group: "" }) } as any
    const res = await POST(fakeReq)
    expect(res.status).toBe(400)
  })
})
