
describe('ExerciseModel (unit) - isolated module loading', () => {
  afterEach(() => {
    jest.resetModules() 
    jest.restoreAllMocks()
  })

  it('create deve inserir e retornar o registro criado', () => {
    
    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 }),
      get: jest.fn().mockReturnValue({
        id: 1,
        name: 'Agachamento',
        muscle_group: 'Pernas',
        description: null,
        video_url: null,
      }),
      all: jest.fn().mockReturnValue([{ id: 1, name: 'Agachamento', muscle_group: 'Pernas' }]),
    }
    const mockDb = {
      prepare: jest.fn().mockReturnValue(stmt),
      exec: jest.fn(),
      pragma: jest.fn(),
    }

    
    jest.doMock('../../lib/database', () => ({ __esModule: true, default: mockDb }))

    
    const { ExerciseModel } = require('../../lib/models/Exercise')

    
    const created = ExerciseModel.create({ name: 'Agachamento', muscle_group: 'Pernas' })
    expect(created).toBeDefined()
    expect(created.id).toBe(1)

    
    expect(mockDb.prepare).toHaveBeenCalled()
    expect(stmt.run).toHaveBeenCalled()
  })

  it('findAll retorna lista e findById funciona', () => {
    
    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
      get: jest.fn().mockReturnValue({ id: 1, name: 'Agachamento', muscle_group: 'Pernas' }),
      all: jest.fn().mockReturnValue([{ id: 1, name: 'Agachamento', muscle_group: 'Pernas' }]),
    }
    const mockDb = { prepare: jest.fn().mockReturnValue(stmt), exec: jest.fn(), pragma: jest.fn() }

    jest.doMock('../../lib/database', () => ({ __esModule: true, default: mockDb }))
    const { ExerciseModel } = require('../../lib/models/Exercise')

    const all = ExerciseModel.findAll()
    expect(Array.isArray(all)).toBe(true)
    expect(all.length).toBeGreaterThan(0)
    expect(all[0].name).toBe('Agachamento')

    const found = ExerciseModel.findById(1)
    expect(found).toBeDefined()
    expect(found!.name).toBe('Agachamento')

    
    const delStmt = {
      run: jest.fn().mockReturnValue({ changes: 1 }),
      get: jest.fn(),
      all: jest.fn().mockReturnValue([]),
    }
    
    mockDb.prepare.mockReturnValueOnce(delStmt)
    const result = ExerciseModel.delete(1)
    expect(result).toBe(true)
  })

  it('validateExercise detecta erros de campos obrigatórios', () => {
    
    jest.resetModules()
    const { ExerciseModel } = require('../../lib/models/Exercise')
    const errors = ExerciseModel.validateExercise({})
    expect(errors).toContain('Nome do exercício é obrigatório')
    expect(errors).toContain('Grupo muscular é obrigatório')
  })
})
