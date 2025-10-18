import "@testing-library/jest-dom" 


try {

  const NextWeb = require('next/dist/server/web/spec-extension/request');

  if (typeof Request === 'undefined') {
    global.Request = NextWeb.Request;
  }
  if (typeof NextRequest === 'undefined') {
    global.NextRequest = NextWeb.NextRequest;
  }

  const ResponseWeb = require('next/dist/server/web/spec-extension/response');
  if (typeof Response === 'undefined') {
    global.Response = ResponseWeb.Response;
  }
} catch (e) {
  console.warn("Falha ao configurar mocks de Request/Response do Next.js. Certifique-se de usar 'NextRequest' em seus testes de API.");
}

if (typeof URL === 'undefined') {
    global.URL = require('url').URL;
}

if (typeof fetch === 'undefined') {
    global.fetch = jest.fn();
}
