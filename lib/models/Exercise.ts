import db from "../database"

export interface Exercise {
  id?: number
  name: string
  muscle_group: string
  description?: string
  video_url?: string
  created_at?: string
  updated_at?: string
}

export class ExerciseModel {
  static create(exercise: Omit<Exercise, "id" | "created_at" | "updated_at">): Exercise {
    const stmt = db.prepare(`
      INSERT INTO exercises (name, muscle_group, description, video_url)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(
      exercise.name,
      exercise.muscle_group,
      exercise.description || null,
      exercise.video_url || null,
    )

    return this.findById(result.lastInsertRowid as number)!
  }

  static findAll(): Exercise[] {
    const stmt = db.prepare("SELECT * FROM exercises ORDER BY name")
    return stmt.all() as Exercise[]
  }

  static findById(id: number): Exercise | null {
    const stmt = db.prepare("SELECT * FROM exercises WHERE id = ?")
    return stmt.get(id) as Exercise | null
  }

  static findByMuscleGroup(muscleGroup: string): Exercise[] {
    const stmt = db.prepare("SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name")
    return stmt.all(muscleGroup) as Exercise[]
  }

  static update(id: number, exercise: Partial<Exercise>): Exercise | null {
    const fields = []
    const values = []

    if (exercise.name) {
      fields.push("name = ?")
      values.push(exercise.name)
    }
    if (exercise.muscle_group) {
      fields.push("muscle_group = ?")
      values.push(exercise.muscle_group)
    }
    if (exercise.description !== undefined) {
      fields.push("description = ?")
      values.push(exercise.description)
    }
    if (exercise.video_url !== undefined) {
      fields.push("video_url = ?")
      values.push(exercise.video_url)
    }

    fields.push("updated_at = CURRENT_TIMESTAMP")
    values.push(id)

    const stmt = db.prepare(`
      UPDATE exercises 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...values)
    return this.findById(id)
  }

  static delete(id: number): boolean {
    const stmt = db.prepare("DELETE FROM exercises WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  static validateExercise(exercise: Partial<Exercise>): string[] {
    const errors: string[] = []

    if (!exercise.name || exercise.name.trim().length === 0) {
      errors.push("Nome do exercício é obrigatório")
    }

    if (!exercise.muscle_group || exercise.muscle_group.trim().length === 0) {
      errors.push("Grupo muscular é obrigatório")
    }

    if (exercise.video_url && !this.isValidUrl(exercise.video_url)) {
      errors.push("URL do vídeo deve ser válida")
    }

    return errors
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}
