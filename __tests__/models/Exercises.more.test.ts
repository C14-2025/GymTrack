// __tests__/models/Exercise.more.test.ts
import { jest } from "@jest/globals"

afterEach(() => {
  jest.resetModules()
  jest.restoreAllMocks()
})

test("ExerciseModel: create/findAll/findById/findByMuscleGroup/update/delete/validate", () => {
  const stmt = {
    run: jest.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 }),
    get: jest.fn().mockReturnValue({ id: 1, name: "Agachamento", muscle_group: "Pernas", description: null, video_url: null }),
    all: jest.fn().mockReturnValue([{ id: 1, name: "Agachamento", muscle_group: "Pernas" }]),
  }
  const mockDb = { prepare: jest.fn().mockReturnValue(stmt), exec: jest.fn(), pragma: jest.fn() }
  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseModel } = require("../../lib/models/Exercise")

  const created = ExerciseModel.create({ name: "Agachamento", muscle_group: "Pernas" })
  expect(created).toBeDefined()
  expect(created.id).toBe(1)
  expect(mockDb.prepare).toHaveBeenCalled()

  const all = ExerciseModel.findAll()
  expect(Array.isArray(all)).toBe(true)

  const found = ExerciseModel.findById(1)
  expect(found).toBeDefined()
  expect(found!.name).toBe("Agachamento")

  // findByMuscleGroup
  mockDb.prepare.mockReturnValueOnce({ all: jest.fn().mockReturnValue([{ id: 2, name: "Leg Press", muscle_group: "Pernas" }]) })
  const group = ExerciseModel.findByMuscleGroup("Pernas")
  expect(group[0].muscle_group).toBe("Pernas")

  // update: only name
  const updStmt = { run: jest.fn().mockReturnValue({}), get: jest.fn().mockReturnValue({ id: 1, name: "Agachamento X" }) }
  mockDb.prepare.mockReturnValueOnce(updStmt)
  const updated = ExerciseModel.update(1, { name: "Agachamento" })
  expect(updated).toBeDefined()
  expect(updated!.name).toBe("Agachamento")
  expect(updStmt.run).toHaveBeenCalled()

  // delete: simulate changes > 0
  const delStmt = { run: jest.fn().mockReturnValue({ changes: 1 }), get: jest.fn(), all: jest.fn() }
  mockDb.prepare.mockReturnValueOnce(delStmt)
  const deleted = ExerciseModel.delete(1)
  expect(deleted).toBe(true)

  // validateExercise: missing fields
  const errors = ExerciseModel.validateExercise({} as any)
  expect(errors).toContain("Nome do exercício é obrigatório")
  expect(errors).toContain("Grupo muscular é obrigatório")

  // validateExercise: invalid video_url
  const badUrlErrors = ExerciseModel.validateExercise({ name: "A", muscle_group: "X", video_url: "notaurl" } as any)
  expect(badUrlErrors).toContain("URL do vídeo deve ser válida")
})
