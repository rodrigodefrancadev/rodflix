import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { PasswordService } from '../../infrastructure/services/PasswordService';
import { TokenService } from '../../infrastructure/services/TokenService';

const passwordService = new PasswordService();
const tokenService = new TokenService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      const hashedPassword = await passwordService.hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          // First user gets to be admin/approved for easier bootstrap, otherwise USER
        },
      });

      // Optionally, check if it's the first user and assign ADMIN role
      const userCount = await prisma.user.count();
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN', approved: true },
        });
      }

      res.status(201).json({ message: 'User registered successfully waiting for approval' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Missing email or password' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await passwordService.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      if (!user.approved) {
        res.status(403).json({ error: 'User not yet approved by moderator' });
        return;
      }

      const token = tokenService.generateToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
