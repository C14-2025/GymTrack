// __tests__/models/WorkoutSession.test.ts
import { jest } from "@jest/globals"

let db: any
let ExerciseModel: any
let mockDb: any

beforeAll(async () => {
 
  jest.doMock("../../lib/database", () => {
    let lastParams: any[] | null = null
    let lastInsertId = 1

    const prepare = jest.fn((sql: string) => {
      const s = (sql || "").toUpperCase()


      if (/INSERT\s+INTO\s+EXERCISES/i.test(s)) {
        return {
          run: jest.fn((...params: any[]) => {
            lastParams = params
            return { lastInsertRowid: lastInsertId++ }
          }),
          get: jest.fn(),
          all: jest.fn(),
        }
      }


      if (/SELECT\s+\*\s+FROM\s+EXERCISES\s+WHERE\s+ID\s*\=\s*\?/i.test(s)) {
        return {
          run: jest.fn(),
          get: jest.fn((id: number) => {
            if (lastParams) {
              return {
                id,
                name: lastParams[0],
                muscle_group: lastParams[1],

                description: lastParams[2] === null ? undefined : lastParams[2],
                video_url: undefined,
              }
            }
            return { id, name: "Mock Name", muscle_group: "Mock Group" }
          }),
          all: jest.fn(),
        }
      }

      return {
        run: jest.fn(),
        get: jest.fn(),
        all: jest.fn(),
      }
    })

    return {
      __esModule: true,
      default: {
        prepare,
        exec: jest.fn(),
      },
    }
  })


  const dbModule = await import("../../lib/database")
  db = dbModule.default
  const exerciseModule = await import("../../lib/models/Exercise")
  ExerciseModel = exerciseModule.ExerciseModel


  mockDb = require("../../lib/database").default
})

beforeEach(() => {
  jest.clearAllMocks()

  db.exec("DELETE FROM exercises")
})

describe("ExerciseModel - Testes Mock", () => {
  it("deve criar um exercício com dados válidos", () => {
    const result = ExerciseModel.create({
      name: "Supino Reto Teste",
      muscle_group: "Peito",
      description: "Exercício de peito",
    })


    expect(mockDb.prepare).toHaveBeenCalled()


    const insertResultObj = (mockDb.prepare as jest.Mock).mock.results.find((r: any) =>
      r.value && typeof r.value.run === "function" && r.value.run.mock
    )?.value

    expect(insertResultObj).toBeDefined()

    expect(insertResultObj.run).toHaveBeenCalledWith(
      "Supino Reto Teste",
      "Peito",
      "Exercício de peito",
      null
    )

    expect(result).toBeDefined()
    expect(result.name).toBe("Supino Reto Teste")
    expect(result.muscle_group).toBe("Peito")
  })

  it("deve criar exercício com campos opcionais nulos", () => {
    const result = ExerciseModel.create({
      name: "Agachamento Teste",
      muscle_group: "Pernas",
    })

    const insertResultObj = (mockDb.prepare as jest.Mock).mock.results.find((r: any) =>
      r.value && typeof r.value.run === "function" && r.value.run.mock
    )?.value

    expect(insertResultObj).toBeDefined()

    expect(insertResultObj.run).toHaveBeenCalledWith(
      "Agachamento Teste",
      "Pernas",
      null,
      null
    )

    expect(result).toBeDefined()
    expect(result.name).toBe("Agachamento Teste")
    expect(result.muscle_group).toBe("Pernas")
  })
})
