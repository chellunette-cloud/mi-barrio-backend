import argon2 from 'argon2';
import type { AdminRepository } from '../../domain/auth/types.js';
import { JwtService } from '../../infrastructure/auth/JwtService.js';
import { HttpError } from '../../lib/httpError.js';

export class LoginAdmin {
  constructor(private readonly repository: AdminRepository, private readonly jwt: JwtService) {}

  async execute(username: string, password: string) {
    const user = await this.repository.findUser(username);
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new HttpError(401, 'CREDENCIALES_INVALIDAS', 'Credenciales inválidas');
    }
    return {
      accessToken: this.jwt.signAccess(user.username, user.role),
      refreshToken: this.jwt.signRefresh(user.username),
      expiresIn: 900
    };
  }
}