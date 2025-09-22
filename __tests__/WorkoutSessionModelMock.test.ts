import { WorkoutSessionModel, WorkoutSessionWithLogs, ExerciseLog } from "@/lib/models/WorkoutSession"

// Mock do banco de dados
jest.mock("@/lib/database", () => {
  const mockDb = {
    prepare: jest.fn(),
  }
  
  return {
    __esModule: true,
    default: mockDb,
  }
})

describe("WorkoutSessionModel - Testes Mock", () => {
  const mockDb = require("@/lib/database").default

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("findByIdWithLogs", () => {
    it("deve retornar sessão completa com logs de exercícios", () => {
      // Arrange
      const sessionId = 1
      const mockSessionData = {
        id: 1,
        workout_template_id: 1,
        date: "2024-01-15",
        duration_minutes: 60,
        notes: "Treino intenso",
        created_at: "2024-01-15T08:00:00Z",
        template_name: "Treino A - Peito e Tríceps"
      }

      const mockLogsData = [
        {
          id: 1,
          workout_session_id: 1,
          exercise_id: 1,
          set_number: 1,
          reps: 12,
          weight: 80,
          completed: true,
          notes: "Boa execução",
          created_at: "2024-01-15T08:05:00Z",
          exercise_name: "Supino Reto",
          muscle_group: "Peito"
        },
        {
          id: 2,
          workout_session_id: 1,
          exercise_id: 1,
          set_number: 2,
          reps: 10,
          weight: 85,
          completed: true,
          notes: null,
          created_at: "2024-01-15T08:10:00Z",
          exercise_name: "Supino Reto",
          muscle_group: "Peito"
        },
        {
          id: 3,
          workout_session_id: 1,
          exercise_id: 2,
          set_number: 1,
          reps: 15,
          weight: 20,
          completed: true,
          notes: "Foco na contração",
          created_at: "2024-01-15T08:15:00Z",
          exercise_name: "Tríceps Pulley",
          muscle_group: "Tríceps"
        }
      ]

      // Mock das consultas SQL
      const mockSessionStmt = {
        get: jest.fn().mockReturnValue(mockSessionData)
      }
      
      const mockLogsStmt = {
        all: jest.fn().mockReturnValue(mockLogsData)
      }

      mockDb.prepare
        .mockReturnValueOnce(mockSessionStmt) // Primeira chamada para buscar sessão
        .mockReturnValueOnce(mockLogsStmt)    // Segunda chamada para buscar logs

      // Act
      const result = WorkoutSessionModel.findByIdWithLogs(sessionId)

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledTimes(2)
      
      // Verifica primeira consulta (sessão)
      expect(mockDb.prepare).toHaveBeenNthCalledWith(1, `
      SELECT ws.*, wt.name as template_name
      FROM workout_sessions ws
      JOIN workout_templates wt ON ws.workout_template_id = wt.id
      WHERE ws.id = ?
    `)
      expect(mockSessionStmt.get).toHaveBeenCalledWith(sessionId)

      // Verifica segunda consulta (logs)
      expect(mockDb.prepare).toHaveBeenNthCalledWith(2, `
      SELECT el.*, e.name as exercise_name, e.muscle_group
      FROM exercise_logs el
      JOIN exercises e ON el.exercise_id = e.id
      WHERE el.workout_session_id = ?
      ORDER BY el.exercise_id, el.set_number
    `)
      expect(mockLogsStmt.all).toHaveBeenCalledWith(sessionId)

      // Verifica resultado
      expect(result).toEqual({
        ...mockSessionData,
        logs: mockLogsData
      })
      expect(result?.logs).toHaveLength(3)
      expect(result?.logs[0].exercise_name).toBe("Supino Reto")
      expect(result?.logs[2].exercise_name).toBe("Tríceps Pulley")
    })

    it("deve retornar null quando sessão não existe", () => {
      // Arrange
      const sessionId = 999
      const mockSessionStmt = {
        get: jest.fn().mockReturnValue(null)
      }

      mockDb.prepare.mockReturnValue(mockSessionStmt)

      // Act
      const result = WorkoutSessionModel.findByIdWithLogs(sessionId)

      // Assert
      expect(result).toBeNull()
      expect(mockDb.prepare).toHaveBeenCalledTimes(1) // Só a primeira consulta
      expect(mockSessionStmt.get).toHaveBeenCalledWith(sessionId)
    })

    it("deve retornar sessão com logs vazios quando não há exercícios registrados", () => {
      // Arrange
      const sessionId = 2
      const mockSessionData = {
        id: 2,
        workout_template_id: 2,
        date: "2024-01-16",
        duration_minutes: 45,
        notes: "Treino leve",
        created_at: "2024-01-16T09:00:00Z",
        template_name: "Treino B - Costas e Bíceps"
      }

      const mockSessionStmt = {
        get: jest.fn().mockReturnValue(mockSessionData)
      }
      
      const mockLogsStmt = {
        all: jest.fn().mockReturnValue([])
      }

      mockDb.prepare
        .mockReturnValueOnce(mockSessionStmt)
        .mockReturnValueOnce(mockLogsStmt)

      // Act
      const result = WorkoutSessionModel.findByIdWithLogs(sessionId)

      // Assert
      expect(result).toEqual({
        ...mockSessionData,
        logs: []
      })
      expect(result?.logs).toHaveLength(0)
    })
  })

  describe("validateSession", () => {
    it("deve retornar erros para dados inválidos", () => {
      // Arrange
      const invalidSession = {
        workout_template_id: 0,
        date: "data-invalida",
        duration_minutes: -10
      }

      // Act
      const errors = WorkoutSessionModel.validateSession(invalidSession)

      // Assert
      expect(errors).toContain("Ficha de treino é obrigatória")
      expect(errors).toContain("Data inválida")
      expect(errors).toContain("Duração não pode ser negativa")
    })

    it("deve retornar array vazio para dados válidos", () => {
      // Arrange
      const validSession = {
        workout_template_id: 1,
        date: "2024-01-15",
        duration_minutes: 60,
        notes: "Treino completo"
      }

      // Act
      const errors = WorkoutSessionModel.validateSession(validSession)

      // Assert
      expect(errors).toHaveLength(0)
    })
  })
})
