// __tests__/api/exercises.evolution.test.ts
// registra mocks ANTES de carregar qualquer rota
jest.doMock('next/server', () => ({
  __esModule: true,
  NextRequest: class MockNextRequest { constructor(init?: any){ this._body = init?.body } async json(){ return this._body ?? null } },
  NextResponse: { json(payload: any, opts?: any){ return { status: opts?.status ?? 200, async json(){ return payload } } } }
}))

jest.doMock('../../lib/models/WorkoutSession', () => ({
  __esModule: true,
  ExerciseLogModel: { findByExerciseId: jest.fn() },
}))

describe('GET /api/exercises/[id]/evolution', () => {
  let GET: any
  let ExerciseLogModel: any

  beforeEach(() => {
    jest.resetModules()
    // importa a rota correta: app/api/exercises/[id]/evolution/route.ts
    const route = require('../../app/api/exercises/[id]/evolution/route')
    GET = route.GET
    ExerciseLogModel = require('../../lib/models/WorkoutSession').ExerciseLogModel
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('retorna evolution e progress', async () => {
    const logs = [
      { date: '2025-01-01', weight: 100, reps: 5 },
      { date: '2025-02-01', weight: 110, reps: 3 },
    ]
    ;(ExerciseLogModel.findByExerciseId as jest.Mock).mockReturnValue(logs)

    const res = await GET({} as any, { params: { id: '1' } } as any)
    expect(res.status).toBe(200)

    const body = await res.json()
    // se der problema, descomente a linha abaixo pra ver o que chegou:
    // console.log('evolution body ->', JSON.stringify(body, null, 2))

    expect(body).toHaveProperty('evolution')
    expect(body).toHaveProperty('progress')
    expect(body.rawLogs).toEqual(logs)
  })
})
