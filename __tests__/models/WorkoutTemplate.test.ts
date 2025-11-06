describe('WorkoutTemplateModel (isolated module loading)', () => {
  afterEach(() => {
    jest.resetModules() 
    jest.restoreAllMocks()
  })

  it('create retorna template criado', () => {
    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 2, changes: 1 }),
      get: jest.fn().mockReturnValue({ id: 2, name: 'W1', description: 'x' }),
      all: jest.fn().mockReturnValue([{ id: 2, name: 'W1', description: 'x' }]),
    }
    const mockDb = { prepare: jest.fn().mockReturnValue(stmt), exec: jest.fn(), pragma: jest.fn() }

   
    jest.doMock('../../lib/database', () => ({ __esModule: true, default: mockDb }))


    const { WorkoutTemplateModel } = require('../../lib/models/WorkoutTemplate')


    const t = WorkoutTemplateModel.create({ name: 'W1', description: 'x' } as any)
    expect(t).toBeDefined()
    expect(t.id).toBe(2)


    expect(mockDb.prepare).toHaveBeenCalled()
    expect(stmt.run).toHaveBeenCalled()
  })

  it('findAll retorna array e findById retorna item', () => {

    const stmt = {
      run: jest.fn().mockReturnValue({ lastInsertRowid: 2 }),
      get: jest.fn().mockReturnValue({ id: 2, name: 'W1', description: 'x' }),
      all: jest.fn().mockReturnValue([{ id: 2, name: 'W1', description: 'x' }]),
    }
    const mockDb = { prepare: jest.fn().mockReturnValue(stmt), exec: jest.fn(), pragma: jest.fn() }
    jest.doMock('../../lib/database', () => ({ __esModule: true, default: mockDb }))

    const { WorkoutTemplateModel } = require('../../lib/models/WorkoutTemplate')

    const all = WorkoutTemplateModel.findAll()
    expect(Array.isArray(all)).toBe(true)
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('W1')

    const item = WorkoutTemplateModel.findById(2)
    expect(item).toBeDefined()
    expect(item!.name).toBe('W1')
  })
})
