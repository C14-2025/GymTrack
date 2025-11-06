import { ExerciseModel, type Exercise } from "@/lib/models/Exercise"
import { jest } from "@jest/globals"

jest.mock("@/lib/database", () => {
  const mockDb = {
    prepare: jest.fn(),
  }

  return {
    __esModule: true,
    default: mockDb,
  }
})

describe("ExerciseModel - Testes Mock", () => {
  const mockDb = require("@/lib/database").default

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("deve criar um exercício com dados válidos", () => {
      // Arrange
      const exerciseData: Omit<Exercise, "id" | "created_at" | "updated_at"> = {
        name: "Supino Reto",
        muscle_group: "Peito",
        description: "Exercício para desenvolvimento do peitoral",
        video_url: "https://example.com/video.mp4",
      }

      const mockStmt = {
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
      }

      const mockFindById = jest.fn().mockReturnValue({
        id: 1,
        name: "Supino Reto",
        muscle_group: "Peito",
        description: "Exercício para desenvolvimento do peitoral",
        video_url: "https://example.com/video.mp4",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      })

      mockDb.prepare.mockReturnValue(mockStmt)
      jest.spyOn(ExerciseModel, "findById").mockImplementation(mockFindById)

      // Act
      const result = ExerciseModel.create(exerciseData)

      // Assert
      expect(mockDb.prepare).toHaveBeenCalled()
      expect(mockStmt.run).toHaveBeenCalledWith(
        "Supino Reto",
        "Peito",
        "Exercício para desenvolvimento do peitoral",
        "https://example.com/video.mp4",
      )
      expect(mockFindById).toHaveBeenCalledWith(1)
      expect(result).toEqual({
        id: 1,
        name: "Supino Reto",
        muscle_group: "Peito",
        description: "Exercício para desenvolvimento do peitoral",
        video_url: "https://example.com/video.mp4",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      })
    })

    it("deve criar exercício com campos opcionais nulos", () => {
      // Arrange
      const exerciseData: Omit<Exercise, "id" | "created_at" | "updated_at"> = {
        name: "Agachamento",
        muscle_group: "Pernas",
      }

      const mockStmt = {
        run: jest.fn().mockReturnValue({ lastInsertRowid: 2 }),
      }

      const mockFindById = jest.fn().mockReturnValue({
        id: 2,
        name: "Agachamento",
        muscle_group: "Pernas",
        description: null,
        video_url: null,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      })

      mockDb.prepare.mockReturnValue(mockStmt)
      jest.spyOn(ExerciseModel, "findById").mockImplementation(mockFindById)

      // Act
      const result = ExerciseModel.create(exerciseData)

      // Assert
      expect(mockStmt.run).toHaveBeenCalledWith("Agachamento", "Pernas", undefined, undefined)
      expect(result.name).toBe("Agachamento")
      expect(result.muscle_group).toBe("Pernas")
    })
  })

  describe("validateExercise", () => {
    it("deve retornar erros para dados inválidos", () => {
      // Arrange
      const invalidExercise = {
        name: "",
        muscle_group: "",
        video_url: "url-invalida",
      }

      // Act
      const errors = ExerciseModel.validateExercise(invalidExercise)

      // Assert
      expect(errors).toContain("Nome do exercício é obrigatório")
      expect(errors).toContain("Grupo muscular é obrigatório")
      expect(errors).toContain("URL do vídeo deve ser válida")
    })

    it("deve retornar array vazio para dados válidos", () => {
      // Arrange
      const validExercise = {
        name: "Flexão",
        muscle_group: "Peito",
        video_url: "https://example.com/flexao.mp4",
      }

      // Act
      const errors = ExerciseModel.validateExercise(validExercise)

      // Assert
      expect(errors).toHaveLength(0)
    })
  })
})
