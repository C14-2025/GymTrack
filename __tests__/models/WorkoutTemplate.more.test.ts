import { jest } from "@jest/globals"

afterEach(() => {
  jest.resetModules()
  jest.restoreAllMocks()
})

test("WorkoutTemplateModel: create/findByIdWithExercises/add/remove/update/validation", () => {
  const insertStmt = { run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }), get: jest.fn(), all: jest.fn() }
  const selectTemplateStmt = { get: jest.fn().mockReturnValue({ id: 5, name: "W5", description: "desc" }), run: jest.fn(), all: jest.fn() }
  const stmtExercises = { all: jest.fn().mockReturnValue([{ id: 10, exercise_id: 2, exercise_name: "Ex", muscle_group: "Peito" }]), get: jest.fn(), run: jest.fn() }

  const mockDb: any = {
    prepare: jest.fn()
      .mockReturnValueOnce(insertStmt)
      .mockReturnValueOnce(selectTemplateStmt)
      .mockReturnValueOnce(stmtExercises)
      .mockReturnValue({ run: jest.fn(), get: jest.fn(), all: jest.fn() }),
    exec: jest.fn(),
    pragma: jest.fn(),
  }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { WorkoutTemplateModel } = require("../../lib/models/WorkoutTemplate")

  const created = WorkoutTemplateModel.create({ name: "W5", description: "desc" })
  expect(created).toBeDefined()
  expect(created.id).toBe(5)
  expect(insertStmt.run).toHaveBeenCalled()

  const all = WorkoutTemplateModel.findAll()
  expect(Array.isArray(all)).toBe(true)

  mockDb.prepare.mockReturnValueOnce(selectTemplateStmt)
  mockDb.prepare.mockReturnValueOnce(stmtExercises)
  const withExercises = WorkoutTemplateModel.findByIdWithExercises(5)
  expect(withExercises).toBeDefined()
  expect(Array.isArray(withExercises!.exercises)).toBe(true)
  expect(withExercises!.exercises[0].exercise_name).toBe("Ex")

  const insertTemplateExerciseStmt = { run: jest.fn().mockReturnValue({ changes: 1 }), get: jest.fn(), all: jest.fn() }
  mockDb.prepare.mockReturnValueOnce(insertTemplateExerciseStmt)
  const addRes = WorkoutTemplateModel.addExercise(5, { exercise_id: 2, sets: 3, reps: 10, initial_weight: 0, rest_seconds: 60, order_index: 1 } as any)
  expect(addRes).toBe(true)
  expect(insertTemplateExerciseStmt.run).toHaveBeenCalled()

  const deleteStmt = { run: jest.fn().mockReturnValue({ changes: 1 }), get: jest.fn(), all: jest.fn() }
  mockDb.prepare.mockReturnValueOnce(deleteStmt)
  const rem = WorkoutTemplateModel.removeExercise(5, 2)
  expect(rem).toBe(true)
  expect(deleteStmt.run).toHaveBeenCalled()

  const updateStmt = { run: jest.fn().mockReturnValue({}), get: jest.fn().mockReturnValue({ id: 5, name: "W5-upd", description: "x" }), all: jest.fn() }
  mockDb.prepare.mockReturnValueOnce(updateStmt)
  mockDb.prepare.mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 5, name: "W5-upd", description: "x" }) })
  const upd = WorkoutTemplateModel.update(5, { name: "W5-upd", description: "x" })
  expect(upd).toBeDefined()
  expect(upd!.name).toBe("W5-upd")
  expect(updateStmt.run).toHaveBeenCalled()

  const v1 = WorkoutTemplateModel.validateTemplate({} as any)
  expect(v1).toContain("Nome da ficha é obrigatório")

  const ve = WorkoutTemplateModel.validateTemplateExercise({} as any)
  expect(ve).toContain("Exercício é obrigatório")
  expect(ve).toContain("Número de séries deve ser maior que zero")
  expect(ve).toContain("Número de repetições deve ser maior que zero")
})
