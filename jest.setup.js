// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

if (typeof Request === 'undefined') {
  global.Request = require('next/dist/server/web/spec-extension/request').Request;
}
if (typeof NextRequest === 'undefined') {
  global.NextRequest = require('next/dist/server/web/spec-extension/request').NextRequest;
}

// Resposta da API (Response)
if (typeof Response === 'undefined') {
  global.Response = require('next/dist/server/web/spec-extension/response').Response;
}

// Objeto URL, necessário para o NextRequest
if (typeof URL === 'undefined') {
    global.URL = require('url').URL;
}

// Se o seu código usar fetch (ou o Next.js o importar), defina um mock
if (typeof fetch === 'undefined') {
    global.fetch = jest.fn();
}
