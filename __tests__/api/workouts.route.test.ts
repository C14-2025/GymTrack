// __tests__/api/workouts.route.test.ts
jest.doMock('next/server', () => ({
  __esModule: true,
  NextRequest: class MockNextRequest { constructor(init?: any){ this._body = init?.body } async json(){ return this._body ?? null } },
  NextResponse: { json(payload: any, opts?: any){ return { status: opts?.status ?? 200, async json(){ return payload } } } }
}))

jest.doMock('../../lib/models/WorkoutTemplate', () => ({
  __esModule: true,
  WorkoutTemplateModel: {
    findAll: jest.fn(),
    create: jest.fn(),
    validateTemplate: jest.fn(),
  },
}))

describe('API /api/workouts route', () => {
  let GET: any, POST: any, WorkoutTemplateModel: any

  beforeEach(() => {
    jest.resetModules() // limpa cache para garantir que require irá carregar módulos *após* os mocks
    const route = require('../../app/api/workouts/route')
    GET = route.GET
    POST = route.POST
    WorkoutTemplateModel = require('../../lib/models/WorkoutTemplate').WorkoutTemplateModel
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('GET retorna lista de templates', async () => {
    ;(WorkoutTemplateModel.findAll as jest.Mock).mockReturnValue([{ id: 2, name: 'W1' }])
    const res = await GET({} as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it('POST valida e cria template', async () => {
    ;(WorkoutTemplateModel.validateTemplate as jest.Mock).mockReturnValue([])
    ;(WorkoutTemplateModel.create as jest.Mock).mockReturnValue({ id: 3, name: 'Novo' })

    const fakeReq = { json: async () => ({ name: 'Novo', description: 'x' }) } as any
    const res = await POST(fakeReq)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toMatchObject({ id: 3, name: 'Novo' })
  })

  it('POST retorna 400 para dados invalidos', async () => {
    ;(WorkoutTemplateModel.validateTemplate as jest.Mock).mockReturnValue(['erro'])
    const fakeReq = { json: async () => ({ name: '', description: '' }) } as any
    const res = await POST(fakeReq)
    expect(res.status).toBe(400)
  })
})
