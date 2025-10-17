import { WorkoutSessionModel } from '../lib/models/WorkoutSession';

// 👇 Isso substitui o módulo inteiro por mocks controláveis
jest.mock('../lib/database', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(() => ({
      run: jest.fn(() => ({ lastInsertRowid: 1 })),
    })),
  },
}));

describe('WorkoutSessionModel', () => {
  describe('validateSession', () => {
    it('deve validar sessão válida', () => {
      const errors = WorkoutSessionModel.validateSession({
        workout_template_id: 1,
        date: '2025-09-21',
        duration_minutes: 60,
        notes: 'Sessão de teste',
      });
      expect(errors).toHaveLength(0);
    });

    it('deve retornar erro se faltar workout_template_id', () => {
      const errors = WorkoutSessionModel.validateSession({
        date: '2025-09-21',
      });
      expect(errors).toContain('Ficha de treino é obrigatória');
    });

    it('deve retornar erro se a data for inválida', () => {
      const errors = WorkoutSessionModel.validateSession({
        workout_template_id: 1,
        date: 'data-invalida',
      });
      expect(errors).toContain('Data inválida');
    });
  });

  describe('create', () => {
    it('deve chamar db.prepare e db.run ao criar sessão', () => {
      const { default: db } = require('../lib/database'); // acessa o mock criado acima
      const mockPrepare = db.prepare as jest.Mock;

      const session = {
        workout_template_id: 1,
        date: '2025-09-21',
        duration_minutes: 60,
        notes: 'Sessão de teste',
      };

      jest
        .spyOn(WorkoutSessionModel, 'findById')
        .mockReturnValue({ ...session, id: 1, created_at: '2025-09-21' });

      const result = WorkoutSessionModel.create(session);

      expect(mockPrepare).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, workout_template_id: 1 });
    });
  });
});
