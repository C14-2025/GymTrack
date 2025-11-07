
import { jest } from "@jest/globals"

// __tests__/api/exercises.id.route.test.ts
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

jest.doMock("../../lib/models/Exercise", () => ({
  __esModule: true,
  ExerciseModel: {
    findById: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    validateExercise: jest.fn(),
  },
}))

describe("API /api/exercises/[id] route", () => {
  let GET: any, DELETE: any, ExerciseModel: any, PUT: any

  beforeEach(() => {
    jest.resetModules()
    const route = require("../../app/api/exercises/[id]/route")
    GET = route.GET
    DELETE = route.DELETE
    PUT = route.PUT
    ExerciseModel = require("../../lib/models/Exercise").ExerciseModel
    
  })

  afterEach(() => jest.resetAllMocks())

  it("GET retorna 200 e objeto quando existe", async () => {
    ;(ExerciseModel.findById as jest.Mock).mockReturnValue({ id: 1, name: "Ex" })
    const res = await GET({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ id: 1, name: "Ex" })
  })

  it("GET retorna 404 quando nao existe", async () => {
    ;(ExerciseModel.findById as jest.Mock).mockReturnValue(null)
    const res = await GET({} as any, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("DELETE retorna 200 quando exclui", async () => {
    ;(ExerciseModel.delete as jest.Mock).mockReturnValue(true)
    const res = await DELETE({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("message")
  })

  it("DELETE retorna 404 quando nao encontra", async () => {
    ;(ExerciseModel.delete as jest.Mock).mockReturnValue(false)
    const res = await DELETE({} as any, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("GET retorna 400 quando id é inválido", async () => {
  const res = await GET({} as any, { params: { id: "abc" } } as any)
  expect(res.status).toBe(400)
  const body = await res.json()
  expect(body.error).toBe("ID inválido")
  })

  it("GET retorna 500 quando ocorre erro interno", async () => {
  (ExerciseModel.findById as jest.Mock).mockImplementation(() => {
    throw new Error("DB fail")
  })

  const res = await GET({} as any, { params: { id: "1" } } as any)
  expect(res.status).toBe(500)
  })

  it("PUT retorna 400 quando id é inválido", async () => {
  const req = new (require("next/server").NextRequest)({ body: {} })
  const res = await PUT(req as any, { params: { id: "abc" } } as any)
  expect(res.status).toBe(400)
})
it("PUT retorna 400 quando validateExercise retorna erros", async () => {
  ExerciseModel.validateExercise.mockReturnValue(["erro"])
  
  const req = new (require("next/server").NextRequest)({ body: { name: "" } })
  const res = await PUT(req as any, { params: { id: "1" } } as any)

  expect(res.status).toBe(400)
  const body = await res.json()
  expect(body.error).toBe("Dados inválidos")
})
it("PUT retorna 404 quando update retorna null", async () => {
  ExerciseModel.validateExercise.mockReturnValue([])
  ExerciseModel.update.mockReturnValue(null)

  const req = new (require("next/server").NextRequest)({ body: { name: "A" } })
  const res = await PUT(req as any, { params: { id: "1" } } as any)

  expect(res.status).toBe(404)
})
it("PUT retorna 200 quando atualiza com sucesso", async () => {
  ExerciseModel.validateExercise.mockReturnValue([])
  ExerciseModel.update.mockReturnValue({ id: 1, name: "Novo" })

  const req = new (require("next/server").NextRequest)({ body: { name: "Novo" } })
  const res = await PUT(req as any, { params: { id: "1" } } as any)

  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.name).toBe("Novo")
})
it("PUT retorna 500 quando ocorre erro interno", async () => {
  ExerciseModel.validateExercise.mockImplementation(() => {
    throw new Error("fail")
  })

  const req = new (require("next/server").NextRequest)({ body: {} })
  const res = await PUT(req as any, { params: { id: "1" } } as any)

  expect(res.status).toBe(500)
})
it("DELETE retorna 400 quando id é inválido", async () => {
  const res = await DELETE({} as any, { params: { id: "abc" } } as any)
  expect(res.status).toBe(400)
})
it("DELETE retorna 500 quando ocorre erro interno", async () => {
  (ExerciseModel.delete as jest.Mock).mockImplementation(() => {
    throw new Error("boom")
  })

  const res = await DELETE({} as any, { params: { id: "1" } } as any)
  expect(res.status).toBe(500)
})



})
