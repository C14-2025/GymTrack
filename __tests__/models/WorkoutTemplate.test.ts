describe("WorkoutSessionModel - Mock Global (read-only)", () => {
  jest.mock("@/lib/database", () => {
    const mockDb = { prepare: jest.fn(), exec: jest.fn(), pragma: jest.fn() }
    return { __esModule: true, default: mockDb }
  })

  const mockDb = require("@/lib/database").default
  const { WorkoutSessionModel } = require("@/lib/models/WorkoutSession")

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("findByIdWithLogs retorna sessão completa com logs", () => {
    const mockSession = { id: 1, template_name: "Treino A" }
    const mockLogs = [{ id: 1, exercise_name: "Supino" }]

    const sessionStmt = { get: jest.fn().mockReturnValue(mockSession) }
    const logsStmt = { all: jest.fn().mockReturnValue(mockLogs) }

    mockDb.prepare.mockReturnValueOnce(sessionStmt).mockReturnValueOnce(logsStmt)

    const result = WorkoutSessionModel.findByIdWithLogs(1)

    expect(result).toEqual({ ...mockSession, logs: mockLogs })
    expect(mockDb.prepare).toHaveBeenCalledTimes(2)
  })

  it("findByIdWithLogs retorna null quando sessão não existe", () => {
    mockDb.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(null) })

    const result = WorkoutSessionModel.findByIdWithLogs(999)
    expect(result).toBeNull()
  })

  it("validateSession retorna erros para dados inválidos", () => {
    const invalid = { workout_template_id: 0, date: "x", duration_minutes: -10 }
    const errors = WorkoutSessionModel.validateSession(invalid)
    expect(errors).toContain("Ficha de treino é obrigatória")
  })

  it("validateSession retorna array vazio para dados válidos", () => {
    const valid = { workout_template_id: 1, date: "2024-01-15", duration_minutes: 60 }
    const errors = WorkoutSessionModel.validateSession(valid)
    expect(errors).toHaveLength(0)
  })
})

describe("WorkoutSessionModel - Isolado (create/update/delete)", () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.unmock("@/lib/database")
  })

  it("create retorna sessão criada", () => {
    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 10 }),
      get: jest.fn().mockReturnValue({ id: 10, workout_template_id: 1 }),
    }

    const mockDb = {
      prepare: jest.fn().mockReturnValue(stmt),
      exec: jest.fn(),
      pragma: jest.fn(),
    }

    jest.doMock("@/lib/database", () => ({
      __esModule: true,
      default: mockDb,
    }))

    let Model: any
    jest.isolateModules(() => {
      Model = require("@/lib/models/WorkoutSession").WorkoutSessionModel
    })

    const session = Model.create({ workout_template_id: 1 })

    expect(session).toEqual({ id: 10, workout_template_id: 1 })
    expect(stmt.run).toHaveBeenCalled()
    expect(mockDb.prepare).toHaveBeenCalled()
  })

  it("findAll retorna lista vazia", () => {
    const stmt = { all: jest.fn().mockReturnValue([]) }

    const mockDb = {
      prepare: jest.fn().mockReturnValue(stmt),
      exec: jest.fn(),
      pragma: jest.fn(),
    }

    jest.doMock("@/lib/database", () => ({
      __esModule: true,
      default: mockDb,
    }))

    let Model: any
    jest.isolateModules(() => {
      Model = require("@/lib/models/WorkoutSession").WorkoutSessionModel
    })

    const result = Model.findAll()

    expect(result).toEqual([])
    expect(mockDb.prepare).toHaveBeenCalled()
  })
})
