import type { Pool } from 'pg';
import type { AdminRepository, AdminUser, AuditEntry } from '../../domain/auth/types.js';

export class PostgresAdminRepository implements AdminRepository {
  constructor(private readonly pool: Pool) {}

  async findUser(username: string): Promise<AdminUser | null> {
    const result = await this.pool.query<{
      id: number; username: string; password_hash: string; role: string;
    }>('SELECT id, username, password_hash, role FROM admin_usuario WHERE username = $1', [username]);
    const row = result.rows[0];
    return row ? { id: row.id, username: row.username, passwordHash: row.password_hash, role: row.role } : null;
  }

  async createUser(username: string, passwordHash: string, role: string): Promise<AdminUser> {
    const result = await this.pool.query<{ id: number }>(
      `INSERT INTO admin_usuario (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
      [username, passwordHash, role]
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error('No se pudo crear el usuario');
    return { id, username, passwordHash, role };
  }

  async audit(entry: Omit<AuditEntry, 'id' | 'fecha'>): Promise<void> {
    await this.pool.query(
      `INSERT INTO auditoria (usuario, accion, entidad, entidad_id, antes, despues)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)`,
      [entry.usuario, entry.accion, entry.entidad, entry.entidadId, entry.antes, entry.despues]
    );
  }

  async listAudit(): Promise<AuditEntry[]> {
    const result = await this.pool.query<{
      id: number; usuario: string; accion: string; entidad: string; entidad_id: number | null;
      antes: string | null; despues: string | null; fecha: string;
    }>('SELECT id, usuario, accion, entidad, entidad_id, antes, despues, fecha FROM auditoria ORDER BY fecha DESC LIMIT 100');
    return result.rows.map((row) => ({
      id: row.id, usuario: row.usuario, accion: row.accion, entidad: row.entidad,
      entidadId: row.entidad_id, antes: row.antes, despues: row.despues, fecha: row.fecha
    }));
  }
}