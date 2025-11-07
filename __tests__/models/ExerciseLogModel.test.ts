// __tests__/models/ExerciseLogModel.test.ts
import { jest } from "@jest/globals"

afterEach(() => {
  jest.resetModules()
  jest.restoreAllMocks()
})

test("create log", () => {
  const insertStmt = {
    run: jest.fn().mockReturnValue({ lastInsertRowid: 99 })
  }
  const findStmt = {
    get: jest.fn().mockReturnValue({
      id: 99, reps: 10, weight: 20, completed: 1
    })
  }

  const mockDb: any = {
    prepare: jest.fn()
      .mockReturnValueOnce(insertStmt)
      .mockReturnValueOnce(findStmt)
  }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  const result = ExerciseLogModel.create({
    workout_session_id: 1,
    exercise_id: 5,
    set_number: 1,
    reps: 10,
    weight: 20,
    completed: true
  })

  expect(result.id).toBe(99)
})

test("findById", () => {
  const stmt = { get: jest.fn().mockReturnValue({ id: 10 }) }
  const mockDb = { prepare: jest.fn().mockReturnValue(stmt) }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  const result = ExerciseLogModel.findById(10)

  expect(result!.id).toBe(10)
})

test("findBySessionId", () => {
  const stmt = { all: jest.fn().mockReturnValue([{ id: 1 }]) }
  const mockDb = { prepare: jest.fn().mockReturnValue(stmt) }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  const logs = ExerciseLogModel.findBySessionId(55)

  expect(logs.length).toBe(1)
})

test("findByExerciseId", () => {
  const stmt = { all: jest.fn().mockReturnValue([{ id: 1, date: "2025-01-01" }]) }
  const mockDb = { prepare: jest.fn().mockReturnValue(stmt) }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  const logs = ExerciseLogModel.findByExerciseId(10)

  expect(logs[0].date).toBe("2025-01-01")
})

test("update (with fields)", () => {
  const updateStmt = { run: jest.fn() }
  const findStmt = { get: jest.fn().mockReturnValue({ id: 1, reps: 12 }) }

  const mockDb = {
    prepare: jest.fn()
      .mockReturnValueOnce(updateStmt)
      .mockReturnValueOnce(findStmt)
  }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  const result = ExerciseLogModel.update(1, { reps: 12 })

  expect(result!.reps).toBe(12)
})

test("update (no fields)", () => {
  const findStmt = { get: jest.fn().mockReturnValue({ id: 1 }) }
  const mockDb = { prepare: jest.fn().mockReturnValue(findStmt) }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  const result = ExerciseLogModel.update(1, {})

  expect(result!.id).toBe(1)
})

test("delete", () => {
  const delStmt = { run: jest.fn().mockReturnValue({ changes: 1 }) }
  const mockDb = { prepare: jest.fn().mockReturnValue(delStmt) }

  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")
  expect(ExerciseLogModel.delete(10)).toBe(true)
})

test("validateLog", () => {
  const { ExerciseLogModel } = require("../../lib/models/WorkoutSession")

  expect(ExerciseLogModel.validateLog({})).toContain("Sessão de treino é obrigatória")
  expect(ExerciseLogModel.validateLog({ workout_session_id: 1 })).toContain("Exercício é obrigatório")
  expect(ExerciseLogModel.validateLog({ workout_session_id: 1, exercise_id: 1, set_number: -1 }))
    .toContain("Número da série deve ser maior que zero")
  expect(ExerciseLogModel.validateLog({ workout_session_id: 1, exercise_id: 1, set_number: 1, reps: -5 }))
    .toContain("Repetições não podem ser negativas")
})
