import "@testing-library/jest-dom"


global.Request = class Request {
  constructor(input, init) {
    this.url = input
    this.method = init?.method || "GET"
    this.headers = new Map(Object.entries(init?.headers || {}))
    this._body = init?.body
  }
  async json() {
    return typeof this._body === "string" ? JSON.parse(this._body) : this._body
  }
}

global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Map(Object.entries(init?.headers || {}))
  }
  async json() {
    return typeof this.body === "string" ? JSON.parse(this.body) : this.body
  }
}

jest.mock("next/server", () => ({
  __esModule: true,
  NextRequest: class MockNextRequest {
    constructor(init) {
      this._body = init ? init.body : null
    }
    async json() {
      return this._body ?? null
    }
  },
  NextResponse: {
    json(payload, opts) {
      return {
        status: opts ? opts.status : 200,
        async json() {
          return payload
        },
      }
    },
  },
}))