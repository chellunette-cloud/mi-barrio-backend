import jwt from 'jsonwebtoken';

export class JwtService {
  constructor(private readonly accessSecret: string, private readonly refreshSecret: string) {}

  signAccess(username: string, role: string): string {
    return jwt.sign({ sub: username, role, type: 'access' }, this.accessSecret, { expiresIn: '15m' });
  }

  signRefresh(username: string): string {
    return jwt.sign({ sub: username, type: 'refresh' }, this.refreshSecret, { expiresIn: '7d' });
  }

  verifyAccess(token: string): { username: string; role: string } {
    const payload = jwt.verify(token, this.accessSecret) as { sub: string; role: string; type: string };
    if (payload.type !== 'access') throw new Error('Token inválido');
    return { username: payload.sub, role: payload.role };
  }

  verifyRefresh(token: string): string {
    const payload = jwt.verify(token, this.refreshSecret) as { sub: string; type: string };
    if (payload.type !== 'refresh') throw new Error('Token inválido');
    return payload.sub;
  }
}