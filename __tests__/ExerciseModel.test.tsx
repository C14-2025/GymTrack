import { ExerciseModel } from '../lib/models/Exercise';

describe('ExerciseModel.validateExercise', () => {
  it('deve validar exercício válido', () => {
    const errors = ExerciseModel.validateExercise({ name: 'Supino', muscle_group: 'Peito' });
    expect(errors).toHaveLength(0);
  });

  it('deve retornar erro se faltar nome', () => {
    const errors = ExerciseModel.validateExercise({ muscle_group: 'Peito' });
    expect(errors).toContain('Nome do exercício é obrigatório');
  });

  it('deve rejeitar URL inválida', () => {
    const errors = ExerciseModel.validateExercise({ name: 'Supino', muscle_group: 'Peito', video_url: 'not-a-url' });
    expect(errors).toContain('URL do vídeo deve ser válida');
  });
});
