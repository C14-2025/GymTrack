// __tests__/models/WorkoutSession.more.test.ts
import { jest } from "@jest/globals"

afterEach(() => {
  jest.resetModules()
  jest.restoreAllMocks()
})

test("WorkoutSessionModel: create/findAll/findByTemplateId/update/delete/validate", () => {
  const createStmt = { run: jest.fn().mockReturnValue({ lastInsertRowid: 20 }), get: jest.fn().mockReturnValue({ id: 20, workout_template_id: 1 }) }
  const mockDb: any = {
    prepare: jest.fn().mockReturnValue(createStmt),
    exec: jest.fn(),
    pragma: jest.fn(),
  }
  jest.doMock("../../lib/database", () => ({ __esModule: true, default: mockDb }))

  const { WorkoutSessionModel } = require("../../lib/models/WorkoutSession")

  const created = WorkoutSessionModel.create({ workout_template_id: 1, date: "2025-01-01" } as any)
  expect(created).toBeDefined()
  expect(created.id).toBe(20)
  expect(createStmt.run).toHaveBeenCalled()

  const allStmt = { all: jest.fn().mockReturnValue([{ id: 20, workout_template_id: 1 }]) }
  mockDb.prepare.mockReturnValueOnce(allStmt)
  const all = WorkoutSessionModel.findAll()
  expect(Array.isArray(all)).toBe(true)

  const byTemplateStmt = { all: jest.fn().mockReturnValue([{ id: 21 }]) }
  mockDb.prepare.mockReturnValueOnce(byTemplateStmt)
  const byTemplate = WorkoutSessionModel.findByTemplateId(1)
  expect(byTemplate[0].id).toBe(21)

  const findStmt = { get: jest.fn().mockReturnValue({ id: 20, workout_template_id: 1 }) }
  mockDb.prepare.mockReturnValueOnce(findStmt)
  const noChange = WorkoutSessionModel.update(20, {})
  expect(noChange).toEqual({ id: 20, workout_template_id: 1 })

  const updStmt = { run: jest.fn() }
  const findAfterUpdateStmt = { get: jest.fn().mockReturnValue({ id: 20, duration_minutes: 45 }) }
  mockDb.prepare.mockReturnValueOnce(updStmt) // UPDATE statement
  mockDb.prepare.mockReturnValueOnce(findAfterUpdateStmt) // SELECT used by findById
  const updated = WorkoutSessionModel.update(20, { duration_minutes: 45 })
  expect(updated).toBeDefined()
  expect(updated!.duration_minutes).toBe(45)
  expect(updStmt.run).toHaveBeenCalled()

  const delStmt = { run: jest.fn().mockReturnValue({ changes: 1 }) }
  mockDb.prepare.mockReturnValueOnce(delStmt)
  const deleted = WorkoutSessionModel.delete(20)
  expect(deleted).toBe(true)

  const errs = WorkoutSessionModel.validateSession({} as any)
  expect(errs).toContain("Ficha de treino é obrigatória")
  const invalidDateErrs = WorkoutSessionModel.validateSession({ workout_template_id: 1, date: "bad" } as any)
  expect(invalidDateErrs).toContain("Data inválida")
  const negErrs = WorkoutSessionModel.validateSession({ workout_template_id: 1, date: "2025-01-01", duration_minutes: -5 } as any)
  expect(negErrs).toContain("Duração não pode ser negativa")
})
