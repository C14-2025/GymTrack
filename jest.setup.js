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
