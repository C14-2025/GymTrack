import db from "../database"

export interface WorkoutTemplate {
  id?: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface WorkoutTemplateExercise {
  id?: number
  workout_template_id: number
  exercise_id: number
  sets: number
  reps: number
  initial_weight: number
  rest_seconds: number
  order_index: number
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: (WorkoutTemplateExercise & {
    exercise_name: string
    muscle_group: string
  })[]
}

export class WorkoutTemplateModel {
  static create(template: Omit<WorkoutTemplate, "id" | "created_at" | "updated_at">): WorkoutTemplate {
    const stmt = db.prepare(`
      INSERT INTO workout_templates (name, description)
      VALUES (?, ?)
    `)

    const result = stmt.run(template.name, template.description || null)
    return this.findById(result.lastInsertRowid as number)!
  }

  static findAll(): WorkoutTemplate[] {
    const stmt = db.prepare("SELECT * FROM workout_templates ORDER BY name")
    return stmt.all() as WorkoutTemplate[]
  }

  static findById(id: number): WorkoutTemplate | null {
    const stmt = db.prepare("SELECT * FROM workout_templates WHERE id = ?")
    return stmt.get(id) as WorkoutTemplate | null
  }

  static findByIdWithExercises(id: number): WorkoutTemplateWithExercises | null {
    const template = this.findById(id)
    if (!template) return null

    const stmt = db.prepare(`
      SELECT wte.*, e.name as exercise_name, e.muscle_group
      FROM workout_template_exercises wte
      JOIN exercises e ON wte.exercise_id = e.id
      WHERE wte.workout_template_id = ?
      ORDER BY wte.order_index
    `)

    const exercises = stmt.all(id) as (WorkoutTemplateExercise & {
      exercise_name: string
      muscle_group: string
    })[]

    return { ...template, exercises }
  }

  static addExercise(
    templateId: number,
    exercise: Omit<WorkoutTemplateExercise, "id" | "workout_template_id">,
  ): boolean {
    const stmt = db.prepare(`
      INSERT INTO workout_template_exercises 
      (workout_template_id, exercise_id, sets, reps, initial_weight, rest_seconds, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      templateId,
      exercise.exercise_id,
      exercise.sets,
      exercise.reps,
      exercise.initial_weight,
      exercise.rest_seconds,
      exercise.order_index,
    )

    return result.changes > 0
  }

  static removeExercise(templateId: number, exerciseId: number): boolean {
    const stmt = db.prepare(`
      DELETE FROM workout_template_exercises 
      WHERE workout_template_id = ? AND exercise_id = ?
    `)

    const result = stmt.run(templateId, exerciseId)
    return result.changes > 0
  }

  static update(id: number, template: Partial<WorkoutTemplate>): WorkoutTemplate | null {
    const fields = []
    const values = []

    if (template.name) {
      fields.push("name = ?")
      values.push(template.name)
    }
    if (template.description !== undefined) {
      fields.push("description = ?")
      values.push(template.description)
    }

    fields.push("updated_at = CURRENT_TIMESTAMP")
    values.push(id)

    const stmt = db.prepare(`
      UPDATE workout_templates 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...values)
    return this.findById(id)
  }

  static delete(id: number): boolean {
  
  db.prepare("DELETE FROM workout_template_exercises WHERE workout_template_id = ?")
    .run(id)

  
  const stmt = db.prepare("DELETE FROM workout_templates WHERE id = ?")
  const result = stmt.run(id)

  return result.changes > 0
}

  static validateTemplate(template: Partial<WorkoutTemplate>): string[] {
    const errors: string[] = []

    if (!template.name || template.name.trim().length === 0) {
      errors.push("Nome da ficha é obrigatório")
    }

    return errors
  }

  static validateTemplateExercise(exercise: Partial<WorkoutTemplateExercise>): string[] {
    const errors: string[] = []

    if (!exercise.exercise_id || exercise.exercise_id <= 0) {
      errors.push("Exercício é obrigatório")
    }

    if (!exercise.sets || exercise.sets <= 0) {
      errors.push("Número de séries deve ser maior que zero")
    }

    if (!exercise.reps || exercise.reps <= 0) {
      errors.push("Número de repetições deve ser maior que zero")
    }

    if (exercise.initial_weight !== undefined && exercise.initial_weight < 0) {
      errors.push("Peso inicial não pode ser negativo")
    }

    if (exercise.rest_seconds !== undefined && exercise.rest_seconds < 0) {
      errors.push("Tempo de descanso não pode ser negativo")
    }

    return errors
  }
}
