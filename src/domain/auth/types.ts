export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
}

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
}

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuditEntry {
  id: number;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number | null;
  antes: string | null;
  despues: string | null;
  fecha: string;
}

export interface AdminRepository {
  findUser(username: string): Promise<AdminUser | null>;
  createUser(username: string, passwordHash: string, role: string): Promise<AdminUser>;
  audit(entry: Omit<AuditEntry, 'id' | 'fecha'>): Promise<void>;
  listAudit(): Promise<AuditEntry[]>;
}