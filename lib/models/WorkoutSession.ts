import db from "../database"

export interface WorkoutSession {
  id?: number
  workout_template_id: number
  date: string
  duration_minutes?: number
  notes?: string
  created_at?: string
}

export interface ExerciseLog {
  id?: number
  workout_session_id: number
  exercise_id: number
  set_number: number
  reps: number
  weight: number
  completed: boolean
  notes?: string
  created_at?: string
}

export interface WorkoutSessionWithLogs extends WorkoutSession {
  template_name: string
  logs: (ExerciseLog & {
    exercise_name: string
    muscle_group: string
  })[]
}

export class WorkoutSessionModel {
  static create(session: Omit<WorkoutSession, "id" | "created_at">): WorkoutSession {
    const stmt = db.prepare(`
      INSERT INTO workout_sessions (workout_template_id, date, duration_minutes, notes)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(
      session.workout_template_id,
      session.date,
      session.duration_minutes || null,
      session.notes || null,
    )

    return this.findById(result.lastInsertRowid as number)!
  }

  static findAll(): WorkoutSession[] {
    const stmt = db.prepare(`
      SELECT ws.*, wt.name as template_name
      FROM workout_sessions ws
      JOIN workout_templates wt ON ws.workout_template_id = wt.id
      ORDER BY ws.date DESC, ws.created_at DESC
    `)
    return stmt.all() as (WorkoutSession & { template_name: string })[]
  }

  static findById(id: number): WorkoutSession | null {
    const stmt = db.prepare("SELECT * FROM workout_sessions WHERE id = ?")
    return stmt.get(id) as WorkoutSession | null
  }

  static findByIdWithLogs(id: number): WorkoutSessionWithLogs | null {
    const session = db
      .prepare(`
      SELECT ws.*, wt.name as template_name
      FROM workout_sessions ws
      JOIN workout_templates wt ON ws.workout_template_id = wt.id
      WHERE ws.id = ?
    `)
      .get(id) as (WorkoutSession & { template_name: string }) | null

    if (!session) return null

    const logs = db
      .prepare(`
      SELECT el.*, e.name as exercise_name, e.muscle_group
      FROM exercise_logs el
      JOIN exercises e ON el.exercise_id = e.id
      WHERE el.workout_session_id = ?
      ORDER BY el.exercise_id, el.set_number
    `)
      .all(id) as (ExerciseLog & {
      exercise_name: string
      muscle_group: string
    })[]

    return { ...session, logs }
  }

  static findByTemplateId(templateId: number): WorkoutSession[] {
    const stmt = db.prepare(`
      SELECT * FROM workout_sessions 
      WHERE workout_template_id = ? 
      ORDER BY date DESC
    `)
    return stmt.all(templateId) as WorkoutSession[]
  }

  static update(id: number, session: Partial<WorkoutSession>): WorkoutSession | null {
    const fields = []
    const values = []

    if (session.duration_minutes !== undefined) {
      fields.push("duration_minutes = ?")
      values.push(session.duration_minutes)
    }
    if (session.notes !== undefined) {
      fields.push("notes = ?")
      values.push(session.notes)
    }

    if (fields.length === 0) return this.findById(id)

    values.push(id)

    const stmt = db.prepare(`
      UPDATE workout_sessions 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...values)
    return this.findById(id)
  }

  static delete(id: number): boolean {
    const stmt = db.prepare("DELETE FROM workout_sessions WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  static validateSession(session: Partial<WorkoutSession>): string[] {
    const errors: string[] = []

    if (!session.workout_template_id || session.workout_template_id <= 0) {
      errors.push("Ficha de treino é obrigatória")
    }

    if (!session.date) {
      errors.push("Data é obrigatória")
    } else {
      const date = new Date(session.date)
      if (isNaN(date.getTime())) {
        errors.push("Data inválida")
      }
    }

    if (session.duration_minutes !== undefined && session.duration_minutes < 0) {
      errors.push("Duração não pode ser negativa")
    }

    return errors
  }
}

export class ExerciseLogModel {
  static create(log: Omit<ExerciseLog, "id" | "created_at">): ExerciseLog {
    const stmt = db.prepare(`
      INSERT INTO exercise_logs (workout_session_id, exercise_id, set_number, reps, weight, completed, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      log.workout_session_id,
      log.exercise_id,
      log.set_number,
      log.reps,
      log.weight,
      log.completed ? 1 : 0,
      log.notes || null,
    )

    return this.findById(result.lastInsertRowid as number)!
  }

  static findById(id: number): ExerciseLog | null {
    const stmt = db.prepare("SELECT * FROM exercise_logs WHERE id = ?")
    return stmt.get(id) as ExerciseLog | null
  }

  static findBySessionId(sessionId: number): ExerciseLog[] {
    const stmt = db.prepare(`
      SELECT * FROM exercise_logs 
      WHERE workout_session_id = ? 
      ORDER BY exercise_id, set_number
    `)
    return stmt.all(sessionId) as ExerciseLog[]
  }

  static findByExerciseId(exerciseId: number): ExerciseLog[] {
    const stmt = db.prepare(`
      SELECT el.*, ws.date
      FROM exercise_logs el
      JOIN workout_sessions ws ON el.workout_session_id = ws.id
      WHERE el.exercise_id = ? 
      ORDER BY ws.date DESC, el.created_at DESC
    `)
    return stmt.all(exerciseId) as (ExerciseLog & { date: string })[]
  }

  static update(id: number, log: Partial<ExerciseLog>): ExerciseLog | null {
    const fields = []
    const values = []

    if (log.reps !== undefined) {
      fields.push("reps = ?")
      values.push(log.reps)
    }
    if (log.weight !== undefined) {
      fields.push("weight = ?")
      values.push(log.weight)
    }
    if (log.completed !== undefined) {
      fields.push("completed = ?")
      values.push(log.completed ? 1 : 0)
    }
    if (log.notes !== undefined) {
      fields.push("notes = ?")
      values.push(log.notes)
    }

    if (fields.length === 0) return this.findById(id)

    values.push(id)

    const stmt = db.prepare(`
      UPDATE exercise_logs 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...values)
    return this.findById(id)
  }

  static delete(id: number): boolean {
    const stmt = db.prepare("DELETE FROM exercise_logs WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  static validateLog(log: Partial<ExerciseLog>): string[] {
    const errors: string[] = []

    if (!log.workout_session_id || log.workout_session_id <= 0) {
      errors.push("Sessão de treino é obrigatória")
    }

    if (!log.exercise_id || log.exercise_id <= 0) {
      errors.push("Exercício é obrigatório")
    }

    if (!log.set_number || log.set_number <= 0) {
      errors.push("Número da série deve ser maior que zero")
    }

    if (log.reps !== undefined && log.reps < 0) {
      errors.push("Repetições não podem ser negativas")
    }

    if (log.weight !== undefined && log.weight < 0) {
      errors.push("Peso não pode ser negativo")
    }

    return errors
  }
}
