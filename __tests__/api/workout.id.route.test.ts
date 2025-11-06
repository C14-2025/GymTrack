// __tests__/api/workouts.id.route.test.ts
jest.doMock('next/server', () => ({
  __esModule: true,
  NextRequest: class MockNextRequest { constructor(init?: any){ this._body = init?.body } async json(){ return this._body ?? null } },
  NextResponse: { json(payload: any, opts?: any){ return { status: opts?.status ?? 200, async json(){ return payload } } } }
}))

jest.doMock('../../lib/models/WorkoutTemplate', () => ({
  __esModule: true,
  WorkoutTemplateModel: {
    findByIdWithExercises: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    validateTemplate: jest.fn().mockReturnValue(true),
  },
}))

describe('API /api/workouts/[id] route', () => {
  let GET: any, PUT: any, DELETE: any, WorkoutTemplateModel: any

  beforeEach(() => {
    jest.resetModules()
    const route = require('../../app/api/workouts/[id]/route')
    GET = route.GET
    PUT = route.PUT
    DELETE = route.DELETE
    WorkoutTemplateModel = require('../../lib/models/WorkoutTemplate').WorkoutTemplateModel
  })

  afterEach(() => jest.resetAllMocks())

  it('GET retorna template com exercises', async () => {
    (WorkoutTemplateModel.findByIdWithExercises as jest.Mock).mockReturnValue({ id: 2, name: 'W1', exercises: [] })
    const res = await GET({} as any, { params: { id: '2' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('exercises')
  })

  it('DELETE retorna 200 quando exclui', async () => {
    (WorkoutTemplateModel.delete as jest.Mock).mockReturnValue(true)
    const res = await DELETE({} as any, { params: { id: '2' } } as any)
    expect(res.status).toBe(200)
  })

  it('PUT atualiza e retorna 200', async () => {
    (WorkoutTemplateModel.update as jest.Mock).mockReturnValue({ id: 2, name: 'W1 updated' })
    const fakeReq = { json: async () => ({ name: 'W1 updated' }) } as any
    const res = await PUT(fakeReq, { params: { id: '2' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ name: 'W1 updated' })
  })
})
