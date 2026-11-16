import type { AdminRepository } from '../../domain/auth/types.js';
import { JwtService } from '../../infrastructure/auth/JwtService.js';
import { HttpError } from '../../lib/httpError.js';

export class RefreshSession {
  constructor(private readonly repository: AdminRepository, private readonly jwt: JwtService) {}

  async execute(refreshToken: string) {
    const username = this.jwt.verifyRefresh(refreshToken);
    const user = await this.repository.findUser(username);
    if (!user) throw new HttpError(401, 'SESION_INVALIDA', 'Sesión inválida');
    return {
      accessToken: this.jwt.signAccess(user.username, user.role),
      expiresIn: 900
    };
  }
}