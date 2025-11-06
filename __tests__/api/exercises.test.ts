import { GET, POST } from "../../app/api/exercises/route"
import { jest } from "@jest/globals"

jest.mock("../../lib/database", () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(() => ({
      all: jest.fn(() => []),
      get: jest.fn(),
      run: jest.fn(() => ({ lastInsertRowid: 1 })),
    })),
  },
}))

jest.mock("../../lib/models/Exercise", () => ({
  __esModule: true,
  ExerciseModel: {
    findAll: jest.fn(() => []),
    create: jest.fn((data) => ({
      id: 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    validateExercise: jest.fn(() => []),
  },
}))

describe("/api/exercises", () => {
  test("GET should return exercises list", async () => {
    const request = {
      url: "http://localhost:3000/api/exercises",
      method: "GET",
    } as any

    const response = await GET(request)
    expect(response.status).toBe(200)
  })

  test("POST should create new exercise", async () => {
    const { ExerciseModel } = require("../../lib/models/Exercise")
    ExerciseModel.validateExercise.mockReturnValue([])

    const exerciseData = {
      name: "Test Exercise",
      muscle_group: "Peito",
      description: "Test description",
    }

    const request = {
      url: "http://localhost:3000/api/exercises",
      method: "POST",
      json: async () => exerciseData,
    } as any

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  test("POST should validate required fields", async () => {
    const { ExerciseModel } = require("../../lib/models/Exercise")
    ExerciseModel.validateExercise.mockReturnValue(["Nome do exercício é obrigatório"])

    const invalidData = {
      name: "",
      muscle_group: "Peito",
    }

    const request = {
      url: "http://localhost:3000/api/exercises",
      method: "POST",
      json: async () => invalidData,
    } as any

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
