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
  it("GET retorna 500 em caso de erro interno do servidor", async () => {
    // Força o findAll a lançar um erro, acionando o bloco 'catch'
    ;(ExerciseModel.findAll as jest.Mock).mockImplementation(() => {
        throw new Error("DB Error")
    })
    const res = await GET({} as any)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({ error: "Erro interno do servidor" })
})
it("POST retorna 409 quando o nome do exercício já existe", async () => {
    // 1. Simula que já existe um exercício com o mesmo nome
    // A implementação da rota compara .toLowerCase(), então o mock deve refletir isso.
    ;(ExerciseModel.findAll as jest.Mock).mockReturnValue([
        { id: 1, name: "Supino Reto", muscle_group: "Peito" },
    ])
    ;(ExerciseModel.validateExercise as jest.Mock).mockReturnValue([]) // Válido

    const fakeReq = { json: async () => ({ name: "supino reto", muscle_group: "Peito" }) } as any
    const res = await POST(fakeReq)
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body).toMatchObject({ error: "Já existe um exercício com este nome" })
})

it("POST retorna 500 em caso de erro interno (ex: falha ao salvar no DB ou parse do JSON)", async () => {
    // Cenário 1: Erro no parse do JSON
    const fakeReqErrorJson = { json: async () => { throw new Error("JSON Parse Error") } } as any
    let res = await POST(fakeReqErrorJson)
    expect(res.status).toBe(500)

    // Cenário 2: Erro ao criar/salvar no DB (create)
    jest.resetAllMocks() // Limpa mocks entre os cenários
    ;(ExerciseModel.validateExercise as jest.Mock).mockReturnValue([])
    ;(ExerciseModel.findAll as jest.Mock).mockReturnValue([])
    ;(ExerciseModel.create as jest.Mock).mockImplementation(() => {
        throw new Error("DB Create Error")
    })

    const fakeReqCreateError = { json: async () => ({ name: "Teste", muscle_group: "Costa" }) } as any
    res = await POST(fakeReqCreateError)
    expect(res.status).toBe(500)
})
})
