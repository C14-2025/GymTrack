import { WorkoutSessionModel } from '../lib/models/WorkoutSession';

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
      const mockPrepare = jest.fn(() => ({
        run: jest.fn(() => ({ lastInsertRowid: 1 })),
      }));
      jest.spyOn(require('../lib/database'), 'default', 'get').mockReturnValue({ prepare: mockPrepare });
      const session = {
        workout_template_id: 1,
        date: '2025-09-21',
        duration_minutes: 60,
        notes: 'Sessão de teste',
      };
      
      jest.spyOn(WorkoutSessionModel, 'findById').mockReturnValue({ ...session, id: 1, created_at: '2025-09-21' });
      const result = WorkoutSessionModel.create(session);
      expect(mockPrepare).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, workout_template_id: 1 });
    });
  });
});
