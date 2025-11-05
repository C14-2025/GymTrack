// __tests__/models/WorkoutSession.test.ts
describe('WorkoutSessionModel (isolated module loading)', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it('create deve retornar session criada', () => {
    // mock do statement e do db antes de carregar o model
    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 5, changes: 1 }),
      get: jest.fn().mockReturnValue({
        id: 5,
        workout_template_id: 1,
        date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
      }),
      all: jest.fn().mockReturnValue([]),
    }
    const mockDb = { prepare: jest.fn().mockReturnValue(stmt), exec: jest.fn(), pragma: jest.fn() }

    // registra o mock ANTES do require do model
    jest.doMock('../lib/database', () => ({ __esModule: true, default: mockDb }))

    // require após registrar mock — garante que o model use o db mockado
    const { WorkoutSessionModel } = require('../lib/models/WorkoutSession')

    const s = WorkoutSessionModel.create({ workout_template_id: 1 } as any)
    expect(s).toBeDefined()
    expect(mockDb.prepare).toHaveBeenCalled()
    expect(stmt.run).toHaveBeenCalled()
  })

  it('findAll retorna array (mock vazio)', () => {
    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }),
      get: jest.fn(),
      all: jest.fn().mockReturnValue([]),
    }
    const mockDb = { prepare: jest.fn().mockReturnValue(stmt), exec: jest.fn(), pragma: jest.fn() }
    jest.doMock('../lib/database', () => ({ __esModule: true, default: mockDb }))

    const { WorkoutSessionModel } = require('../lib/models/WorkoutSession')

    const list = WorkoutSessionModel.findAll()
    expect(Array.isArray(list)).toBe(true)
    expect(mockDb.prepare).toHaveBeenCalled()
  })
})