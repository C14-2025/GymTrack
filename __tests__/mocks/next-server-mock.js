// test/mocks/next-server-mock.js
// Mock global de next/server usado em testes unitários.

jest.doMock('next/server', () => {
  return {
    __esModule: true,

    NextRequest: class MockNextRequest {
      constructor(init = {}) {

        if (init && init.body !== undefined) this._body = init.body
        else if (typeof init === 'string') { this.url = init }
      }
      async json() {
        return this._body ?? null
      }

      async text() { return this._body ? String(this._body) : '' }
    },


    NextResponse: {
      json(payload, opts = {}) {
        const status = opts.status ?? 200
        return {
          status,
          async json() { return payload },
          async text() { return typeof payload === 'string' ? payload : JSON.stringify(payload) },

        }
      },
      redirect(url, opts = {}) {
        const status = opts.status ?? 307
        return {
          status,
          headers: { Location: url },
        }
      }
    },


    default: {
      NextRequest: class MockNextRequest2 {},
      NextResponse: {},
    }
  }
})
