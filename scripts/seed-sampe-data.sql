INSERT INTO exercises (name, muscle_group, description, instructions) VALUES
('Supino Reto', 'chest', 'Exercício básico para peitoral', 'Deite no banco, segure a barra e empurre para cima'),
('Agachamento', 'legs', 'Exercício fundamental para pernas', 'Desça mantendo as costas retas e suba'),
('Barra Fixa', 'back', 'Exercício para dorsais', 'Puxe o corpo para cima até o queixo passar da barra'),
('Desenvolvimento', 'shoulders', 'Exercício para ombros', 'Empurre os halteres para cima acima da cabeça'),
('Rosca Direta', 'biceps', 'Exercício para bíceps', 'Flexione os braços mantendo os cotovelos fixos'),
('Tríceps Testa', 'triceps', 'Exercício para tríceps', 'Estenda os braços mantendo os cotovelos fixos'),
('Prancha', 'core', 'Exercício isométrico para core', 'Mantenha o corpo reto apoiado nos antebraços');

INSERT INTO workout_templates (name, description) VALUES
('Treino A - Peito e Tríceps', 'Treino focado em peitoral e tríceps');

INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, order_index) VALUES
(1, 1, 4, 12, 60.0, 90, 1),
(1, 5, 3, 15, 15.0, 60, 2),
(1, 6, 3, 12, 20.0, 60, 3);
