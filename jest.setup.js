
import "@testing-library/jest-dom" 
try {
  const NextServerWeb = require('next/server');

  if (typeof global.Request === 'undefined' && NextServerWeb.Request) {
      global.Request = NextServerWeb.Request;
  }
  if (typeof global.Response === 'undefined' && NextServerWeb.Response) {
      global.Response = NextServerWeb.Response;
  }
  if (typeof global.NextRequest === 'undefined' && NextServerWeb.NextRequest) {
      global.NextRequest = NextServerWeb.NextRequest;
  }

} catch (e) {
  console.warn("Falha ao carregar Next.js Web Globals. O ambiente Jest está muito restrito.");
}

if (typeof global.URL === 'undefined') {
    global.URL = require('url').URL;
}

if (typeof global.fetch === 'undefined') {
    global.fetch = jest.fn();
}
