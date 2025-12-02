import { jest } from "@jest/globals"

const mockDb: any = {
  prepare: jest.fn(),
  exec: jest.fn(),
  pragma: jest.fn(),
}

jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

const { WorkoutTemplateModel } = require("../../lib/models/WorkoutTemplate")

describe("WorkoutTemplateModelTest", () => {
  const mockTemplate = { id: 5, name: "W5", description: "desc", created_at: "now", updated_at: "now" }
  const mockExercise = { exercise_id: 2, sets: 3, reps: 10, initial_weight: 0, rest_seconds: 60, order_index: 1 }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(WorkoutTemplateModel, "findById").mockRestore()
  })

  it("create: deve inserir e retornar o template criado", () => {
    const insertStmt = { run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }) }
    const findStmt = { get: jest.fn().mockReturnValue(mockTemplate) }

    mockDb.prepare.mockReturnValueOnce(insertStmt).mockReturnValueOnce(findStmt)

    const created = WorkoutTemplateModel.create({ name: "W5", description: "desc" })

    expect(created).toEqual(mockTemplate)
    expect(insertStmt.run).toHaveBeenCalledWith("W5", "desc")
  })

  it("create: deve lidar com description undefined (usa null)", () => {
    const insertStmt = { run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }) }
    const findStmt = { get: jest.fn().mockReturnValue(mockTemplate) }

    mockDb.prepare.mockReturnValueOnce(insertStmt).mockReturnValueOnce(findStmt)

    WorkoutTemplateModel.create({ name: "W5" })

    expect(insertStmt.run).toHaveBeenCalledWith("W5", null)
  })

  it("delete: deve retornar true se deletar e false se não encontrar [BRANCH COVERAGE]", () => {
    const deleteStmtExercisesSuccess = { run: jest.fn() }
    const deleteStmtTemplateSuccess = { run: jest.fn().mockReturnValue({ changes: 1 }) }

    mockDb.prepare.mockReturnValueOnce(deleteStmtExercisesSuccess)
    mockDb.prepare.mockReturnValueOnce(deleteStmtTemplateSuccess)

    const success = WorkoutTemplateModel.delete(5)
    expect(success).toBe(true)

    const deleteStmtExercisesFail = { run: jest.fn() }
    const deleteStmtTemplateFail = { run: jest.fn().mockReturnValue({ changes: 0 }) }

    mockDb.prepare.mockReturnValueOnce(deleteStmtExercisesFail)
    mockDb.prepare.mockReturnValueOnce(deleteStmtTemplateFail)

    const fail = WorkoutTemplateModel.delete(999)
    expect(fail).toBe(false)
  })

  // -------------------- FIND BY ID WITH EXERCISES --------------------
  describe("findByIdWithExercises", () => {
    it("deve retornar template com exercises quando encontrado", () => {
      const mockLogs = [{ id: 10, exercise_id: 2, exercise_name: "Ex", muscle_group: "Peito" }]

      const findByIdSpy = jest.spyOn(WorkoutTemplateModel, "findById").mockReturnValue(mockTemplate)

      const stmtExercises = { all: jest.fn().mockReturnValue(mockLogs) }
      mockDb.prepare.mockReturnValue(stmtExercises)

      const result = WorkoutTemplateModel.findByIdWithExercises(5)

      expect(result).toEqual({ ...mockTemplate, exercises: mockLogs })
      findByIdSpy.mockRestore()
    })

    it("deve retornar template com array vazio", () => {
      const findByIdSpy = jest.spyOn(WorkoutTemplateModel, "findById").mockReturnValue(mockTemplate)

      const stmtExercises = { all: jest.fn().mockReturnValue([]) }
      mockDb.prepare.mockReturnValue(stmtExercises)

      const result = WorkoutTemplateModel.findByIdWithExercises(5)

      expect(result).toEqual({ ...mockTemplate, exercises: [] })
      findByIdSpy.mockRestore()
    })

    it("deve retornar null se não encontrar o template", () => {
      const findByIdSpy = jest.spyOn(WorkoutTemplateModel, "findById").mockReturnValue(null)

      const result = WorkoutTemplateModel.findByIdWithExercises(999)

      expect(result).toBeNull()
      findByIdSpy.mockRestore()
    })
  })

  // -------------------- UPDATE --------------------
  describe("update", () => {
    let findByIdSpy: jest.SpyInstance

    beforeEach(() => {
      findByIdSpy = jest
        .spyOn(WorkoutTemplateModel, "findById")
        .mockImplementation((id) => (id === 5 ? mockTemplate : null))
    })

    afterEach(() => {
      findByIdSpy.mockRestore()
    })

    it("update: deve atualizar nome e descrição", () => {
      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)

      WorkoutTemplateModel.update(5, { name: "W5-upd", description: "x" })

      expect(updateStmt.run).toHaveBeenCalledWith("W5-upd", "x", 5)
    })

    it("update: deve atualizar apenas o nome", () => {
      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)

      WorkoutTemplateModel.update(5, { name: "W5-only-name" })

      expect(updateStmt.run).toHaveBeenCalledWith("W5-only-name", 5)
    })

    it("update: deve atualizar apenas a descrição", () => {
      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)

      WorkoutTemplateModel.update(5, { description: "only-desc" })

      expect(updateStmt.run).toHaveBeenCalledWith("only-desc", 5)
    })

    it("update: deve permitir descrição vazia", () => {
      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)

      WorkoutTemplateModel.update(5, { description: "" })

      expect(updateStmt.run).toHaveBeenCalledWith("", 5)
    })
  })

  // -------------------- EXERCISES --------------------
  describe("Exercise management", () => {
    it("addExercise: deve retornar true ou false corretamente", () => {
      const addSuccess = { run: jest.fn().mockReturnValue({ changes: 1 }) }
      mockDb.prepare.mockReturnValueOnce(addSuccess)

      expect(WorkoutTemplateModel.addExercise(5, mockExercise)).toBe(true)

      const addFail = { run: jest.fn().mockReturnValue({ changes: 0 }) }
      mockDb.prepare.mockReturnValueOnce(addFail)

      expect(WorkoutTemplateModel.addExercise(5, mockExercise)).toBe(false)
    })

    it("removeExercise: deve retornar true ou false corretamente", () => {
      const delSuccess = { run: jest.fn().mockReturnValue({ changes: 1 }) }
      mockDb.prepare.mockReturnValueOnce(delSuccess)
      expect(WorkoutTemplateModel.removeExercise(5, 2)).toBe(true)

      const delFail = { run: jest.fn().mockReturnValue({ changes: 0 }) }
      mockDb.prepare.mockReturnValueOnce(delFail)
      expect(WorkoutTemplateModel.removeExercise(5, 2)).toBe(false)
    })
  })

  // -------------------- VALIDATION --------------------
  describe("Validation", () => {
    it("validateTemplate: erros e válido", () => {
      expect(WorkoutTemplateModel.validateTemplate({ name: "   " })).toContain("Nome da ficha é obrigatório")
      expect(WorkoutTemplateModel.validateTemplate({ name: "W6" })).toHaveLength(0)
    })

    it("validateTemplateExercise: válido", () => {
      expect(WorkoutTemplateModel.validateTemplateExercise(mockExercise)).toHaveLength(0)
    })

    it("validateTemplateExercise: sets/reps inválidos", () => {
      expect(WorkoutTemplateModel.validateTemplateExercise({ sets: 0, exercise_id: 1 }))
        .toContain("Número de séries deve ser maior que zero")

      expect(WorkoutTemplateModel.validateTemplateExercise({ reps: -5, sets: 1, exercise_id: 1 }))
        .toContain("Número de repetições deve ser maior que zero")
    })

    it("validateTemplateExercise: initial_weight negativo", () => {
      expect(
        WorkoutTemplateModel.validateTemplateExercise({ initial_weight: -1, exercise_id: 1, reps: 1, sets: 1 })
      ).toContain("Peso inicial não pode ser negativo")
    })

    it("validateTemplateExercise: rest_seconds negativo", () => {
      expect(
        WorkoutTemplateModel.validateTemplateExercise({ rest_seconds: -10, exercise_id: 1, reps: 1, sets: 1 })
      ).toContain("Tempo de descanso não pode ser negativo")
    })
  })
})
