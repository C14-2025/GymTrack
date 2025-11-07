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

    jest.spyOn(WorkoutTemplateModel, 'findById').mockRestore()
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

    const deleteStmtSuccess = { run: jest.fn().mockReturnValue({ changes: 1 }) }
    mockDb.prepare.mockReturnValueOnce(deleteStmtSuccess)
    const success = WorkoutTemplateModel.delete(5)
    expect(success).toBe(true)
    

    const deleteStmtFail = { run: jest.fn().mockReturnValue({ changes: 0 }) }
    mockDb.prepare.mockReturnValueOnce(deleteStmtFail)
    const fail = WorkoutTemplateModel.delete(999)
    expect(fail).toBe(false)
  })


  
  describe("findByIdWithExercises", () => {
    it("deve retornar template com exercises quando encontrado", () => {
        const mockLogs = [{ id: 10, exercise_id: 2, exercise_name: "Ex", muscle_group: "Peito" }]

        const findByIdSpy = jest.spyOn(WorkoutTemplateModel, 'findById').mockReturnValue(mockTemplate);
        

        const stmtExercises = { all: jest.fn().mockReturnValue(mockLogs) }
        mockDb.prepare.mockReturnValue(stmtExercises);

        const result = WorkoutTemplateModel.findByIdWithExercises(5)
        
        expect(result).toEqual({ ...mockTemplate, exercises: mockLogs })
        findByIdSpy.mockRestore();
    })

    it("deve retornar template com array de exercises vazio [BRANCH COVERAGE]", () => {

        const findByIdSpy = jest.spyOn(WorkoutTemplateModel, 'findById').mockReturnValue(mockTemplate);
        
        const stmtExercises = { all: jest.fn().mockReturnValue([]) }
        mockDb.prepare.mockReturnValue(stmtExercises);

        const result = WorkoutTemplateModel.findByIdWithExercises(5)
        
        expect(result).toEqual({ ...mockTemplate, exercises: [] })
        findByIdSpy.mockRestore();
    })

    it("deve retornar null se template não for encontrado [BRANCH COVERAGE]", () => {

      const findByIdSpy = jest.spyOn(WorkoutTemplateModel, 'findById').mockReturnValue(null);
      const result = WorkoutTemplateModel.findByIdWithExercises(999)
      expect(result).toBeNull()
      findByIdSpy.mockRestore();
    })
  })



  describe("update", () => {

    let findByIdSpy: jest.SpyInstance
    
    beforeEach(() => {
        findByIdSpy = jest.spyOn(WorkoutTemplateModel, 'findById')
            .mockImplementation((id: number) => id === 5 ? mockTemplate : null);
    })

    afterEach(() => {
        findByIdSpy.mockRestore();
    })

    it("update: deve atualizar nome e descrição", () => {
      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)
      
      WorkoutTemplateModel.update(5, { name: "W5-upd", description: "x" })
      

      expect(updateStmt.run).toHaveBeenCalledWith("W5-upd", "x", 5) 

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP"))
    })

    it("update: deve atualizar apenas o nome (description undefined) [BRANCH COVERAGE]", () => {
 
      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)
      
      WorkoutTemplateModel.update(5, { name: "W5-only-name" })
      
      expect(updateStmt.run).toHaveBeenCalledWith("W5-only-name", 5)
  
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("SET name = ?, updated_at = CURRENT_TIMESTAMP"))
    })

    it("update: deve atualizar apenas a descrição (name undefined) [BRANCH COVERAGE]", () => {

      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)
      
      WorkoutTemplateModel.update(5, { description: "only-desc" })
      
      expect(updateStmt.run).toHaveBeenCalledWith("only-desc", 5)

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("SET description = ?, updated_at = CURRENT_TIMESTAMP"))
    })
    
    it("update: deve permitir definir descrição como vazio [BRANCH COVERAGE]", () => {

      const updateStmt = { run: jest.fn() }
      mockDb.prepare.mockReturnValue(updateStmt)
      
      WorkoutTemplateModel.update(5, { description: "" })
      
      expect(updateStmt.run).toHaveBeenCalledWith("", 5)
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining("SET description = ?, updated_at = CURRENT_TIMESTAMP"))
    })
  })
  


  describe("Exercise management", () => {
    it("addExercise: deve retornar true se inserção for bem-sucedida e false se falhar [BRANCH COVERAGE]", () => {

      const addStmtSuccess = { run: jest.fn().mockReturnValue({ changes: 1 }) }
      mockDb.prepare.mockReturnValueOnce(addStmtSuccess)
      const success = WorkoutTemplateModel.addExercise(5, mockExercise)
      expect(success).toBe(true)


      const addStmtFail = { run: jest.fn().mockReturnValue({ changes: 0 }) }
      mockDb.prepare.mockReturnValueOnce(addStmtFail)
      const fail = WorkoutTemplateModel.addExercise(5, mockExercise)
      expect(fail).toBe(false)
    })

    it("removeExercise: deve retornar true se remoção for bem-sucedida e false se falhar [BRANCH COVERAGE]", () => {

      const deleteStmtSuccess = { run: jest.fn().mockReturnValue({ changes: 1 }) }
      mockDb.prepare.mockReturnValueOnce(deleteStmtSuccess)
      const success = WorkoutTemplateModel.removeExercise(5, 2)
      expect(success).toBe(true)


      const deleteStmtFail = { run: jest.fn().mockReturnValue({ changes: 0 }) }
      mockDb.prepare.mockReturnValueOnce(deleteStmtFail)
      const fail = WorkoutTemplateModel.removeExercise(5, 2)
      expect(fail).toBe(false)
    })
  })


  
  describe("Validation", () => {

    it("validateTemplate: deve retornar erro para nome vazio e array vazio para nome válido [BRANCH COVERAGE]", () => {
 
      const errors = WorkoutTemplateModel.validateTemplate({ name: "  " })
      expect(errors).toContain("Nome da ficha é obrigatório")


      const valid = WorkoutTemplateModel.validateTemplate({ name: "W6" })
      expect(valid).toHaveLength(0)
    })

 
    it("validateTemplateExercise: deve retornar array vazio para dados válidos [BRANCH COVERAGE]", () => {

      const valid = WorkoutTemplateModel.validateTemplateExercise(mockExercise)
      expect(valid).toHaveLength(0)
    })
    
    it("validateTemplateExercise: deve falhar para sets/reps inválidos [BRANCH COVERAGE]", () => {

      const errorsSets = WorkoutTemplateModel.validateTemplateExercise({ sets: 0, exercise_id: 1 })
      expect(errorsSets).toContain("Número de séries deve ser maior que zero")
      

      const errorsReps = WorkoutTemplateModel.validateTemplateExercise({ reps: -5, exercise_id: 1, sets: 1 })
      expect(errorsReps).toContain("Número de repetições deve ser maior que zero")
    })

    it("validateTemplateExercise: deve falhar para initial_weight negativo [BRANCH COVERAGE]", () => {

      const errors = WorkoutTemplateModel.validateTemplateExercise({ initial_weight: -1, exercise_id: 1, sets: 1, reps: 1 })
      expect(errors).toContain("Peso inicial não pode ser negativo")
    })
    
    it("validateTemplateExercise: deve falhar para rest_seconds negativo [BRANCH COVERAGE]", () => {

      const errors = WorkoutTemplateModel.validateTemplateExercise({ rest_seconds: -10, initial_weight: 0, exercise_id: 1, sets: 1, reps: 1 })
      expect(errors).toContain("Tempo de descanso não pode ser negativo")
    })
  })
})