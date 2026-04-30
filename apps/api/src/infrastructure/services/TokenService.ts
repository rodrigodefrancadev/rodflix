import jwt, { SignOptions } from 'jsonwebtoken';

export class TokenService {
  private secret = process.env.JWT_SECRET || 'default-secret';

  generateToken(payload: object, expiresIn: SignOptions['expiresIn'] = '1d'): string {
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
