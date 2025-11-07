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

jest.mock("../../lib/models/WorkoutSession", () => ({
  __esModule: true,
  ExerciseLogModel: {
    update: jest.fn(),
    delete: jest.fn(),
    validateLog: jest.fn(),
  },
}))

describe("API /api/logs/[id] route", () => {
  let PUT: any, DELETE: any, ExerciseLogModel: any

  beforeEach(async () => {
    jest.clearAllMocks()
    
    const route = await import("../../app/api/logs/[id]/route")
    PUT = route.PUT
    DELETE = route.DELETE
    ExerciseLogModel = (await import("../../lib/models/WorkoutSession")).ExerciseLogModel
  })

  afterEach(() => jest.clearAllMocks())

 

  it("PUT atualiza log com dados válidos", async () => {
    const updatedLog = {
      id: 1,
      weight: 110,
      reps: 8,
      completed: true,
    }
    ;(ExerciseLogModel.validateLog as jest.Mock).mockReturnValue([])
    ;(ExerciseLogModel.update as jest.Mock).mockReturnValue(updatedLog)

    const fakeReq = {
      json: async () => ({ weight: 110, reps: 8, completed: true }),
    } as any

    const res = await PUT(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ weight: 110, reps: 8 })
  })

  it("PUT retorna 400 se o ID for inválido", async () => {
    
    const fakeReq = { json: async () => ({ weight: 110 }) } as any
    const res = await PUT(fakeReq, { params: { id: "invalido" } } as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toMatchObject({ error: "ID inválido" })
  })

  it("PUT retorna 400 para dados inválidos", async () => {
    ;(ExerciseLogModel.validateLog as jest.Mock).mockReturnValue(["Peso deve ser positivo"])

    const fakeReq = {
      json: async () => ({ weight: -50 }),
    } as any

    const res = await PUT(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(400)
  })

  it("PUT retorna 404 quando log não existe", async () => {
    ;(ExerciseLogModel.validateLog as jest.Mock).mockReturnValue([])
    ;(ExerciseLogModel.update as jest.Mock).mockReturnValue(null)

    const fakeReq = {
      json: async () => ({ weight: 110 }),
    } as any

    const res = await PUT(fakeReq, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("PUT retorna 500 em caso de erro interno do servidor", async () => {
    
    const fakeReq = { json: async () => { throw new Error("JSON Parse Failed") } } as any
    
    const res = await PUT(fakeReq, { params: { id: "1" } } as any)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({ error: "Erro interno do servidor" })
  })

  // --- Testes DELETE ---

  it("DELETE exclui log com sucesso", async () => {
    ;(ExerciseLogModel.delete as jest.Mock).mockReturnValue(true)

    const res = await DELETE({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("message")
  })
  
  it("DELETE retorna 400 se o ID for inválido", async () => {
    
    const res = await DELETE({} as any, { params: { id: "invalido" } } as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toMatchObject({ error: "ID inválido" })
  })

  it("DELETE retorna 404 quando log não existe", async () => {
    ;(ExerciseLogModel.delete as jest.Mock).mockReturnValue(false)

    const res = await DELETE({} as any, { params: { id: "999" } } as any)
    expect(res.status).toBe(404)
  })

  it("DELETE não permite excluir log de sessão finalizada (400)", async () => {
   
    ;(ExerciseLogModel.delete as jest.Mock).mockImplementation(() => {
      throw new Error("Não é possível excluir log de sessão finalizada")
    })

    const res = await DELETE({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(400)
  })

  it("DELETE retorna 500 em caso de erro interno genérico", async () => {
    
    ;(ExerciseLogModel.delete as jest.Mock).mockImplementation(() => {
      throw new Error("DB Connection Error") 
    })

    const res = await DELETE({} as any, { params: { id: "1" } } as any)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({ error: "Erro interno do servidor" })
  })
})