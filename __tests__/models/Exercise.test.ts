// __tests__/models/Exercise.test.ts
describe('ExerciseModel (unit) - isolated module loading', () => {
  afterEach(() => {
    jest.resetModules() // limpa cache de módulos para próximos testes
    jest.restoreAllMocks()
  })

  it('create deve inserir e retornar o registro criado', () => {
    // preparar o stmt e mock do db ANTES de carregar o model
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

    // define o mock para o módulo ../../lib/database (relativo ao arquivo de teste)
    jest.doMock('../../lib/database', () => ({ __esModule: true, default: mockDb }))

    // agora require o model (garante que ele importe o mock, pois o mock já está em vigor)
    const { ExerciseModel } = require('../../lib/models/Exercise')

    // execução
    const created = ExerciseModel.create({ name: 'Agachamento', muscle_group: 'Pernas' })
    expect(created).toBeDefined()
    expect(created.id).toBe(1)

    // garante que db.prepare foi chamado com a query de INSERT
    expect(mockDb.prepare).toHaveBeenCalled()
    expect(stmt.run).toHaveBeenCalled()
  })

  it('findAll retorna lista e findById funciona', () => {
    // novo mock para este teste (isolado)
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

    // e delete
    const delStmt = {
      run: jest.fn().mockReturnValue({ changes: 1 }),
      get: jest.fn(),
      all: jest.fn().mockReturnValue([]),
    }
    // Simula prepare retornando stmt de delete quando chamado com DELETE, mas não é obrigatório
    mockDb.prepare.mockReturnValueOnce(delStmt)
    const result = ExerciseModel.delete(1)
    expect(result).toBe(true)
  })

  it('validateExercise detecta erros de campos obrigatórios', () => {
    // validateExercise é função pura - não precisa mock do DB
    jest.resetModules()
    const { ExerciseModel } = require('../../lib/models/Exercise')
    const errors = ExerciseModel.validateExercise({})
    expect(errors).toContain('Nome do exercício é obrigatório')
    expect(errors).toContain('Grupo muscular é obrigatório')
  })
})
