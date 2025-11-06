(global as any).Request = class {
  constructor() {}
};

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init: any = {}) => ({
      json: async () => data,
      status: init.status ?? 200,
    }),
  },
}));

import db from "@/lib/database";
import { POST, GET } from "@/app/api/sessions/route";

// Função util para criar request mockado
function createRequest(method: string, body?: any) {
  return {
    method,
    json: async () => body,
  } as any;
}

beforeEach(() => {
  // Limpa tabelas necessárias
  db.exec("DELETE FROM exercise_logs");
  db.exec("DELETE FROM workout_sessions");
  db.exec("DELETE FROM workout_template_exercises");
  db.exec("DELETE FROM exercises");
  db.exec("DELETE FROM workout_templates");

  // ✅ Reinsere template necessário para testes
  db.prepare(
    "INSERT INTO workout_templates (id, name) VALUES (1, 'Treino Teste')"
  ).run();
});

describe("API /api/sessions", () => {
  test("POST deve criar uma sessão", async () => {
    const payload = {
      workout_template_id: 1,
      date: "2024-01-01",
      duration_minutes: 40,
      notes: "Sessão de teste",
    };

    const req = createRequest("POST", payload);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.workout_template_id).toBe(1);
    expect(body.date).toBe("2024-01-01");
  });

  test("POST deve retornar erro para dados inválidos", async () => {
    const req = createRequest("POST", {
      workout_template_id: 0, // inválido
      date: "errado", // inválido
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Dados inválidos");
  });

  test("GET deve listar sessões", async () => {
    // ✅ Criar uma sessão manualmente para o GET ter algo pra retornar
    db.prepare(`
      INSERT INTO workout_sessions (workout_template_id, date, duration_minutes, notes)
      VALUES (1, '2024-01-01', 50, 'teste')
    `).run();

    const req = createRequest("GET");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
