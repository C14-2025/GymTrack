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
  },
}))

describe("API /api/exercises/[id] route", () => {
  let GET: any, DELETE: any, ExerciseModel: any

  beforeEach(() => {
    jest.resetModules()
    const route = require("../../app/api/exercises/[id]/route")
    GET = route.GET
    DELETE = route.DELETE
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
})
