import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'test@rodflix.com' } });
  if (!user) { console.log('User not found'); return; }

  console.log('User:', { id: user.id, email: user.email, role: user.role, approved: user.approved });
  
  const passwords = ['admin123', 'password123', 'test123'];
  for (const p of passwords) {
    const match = await bcrypt.compare(p, user.password);
    console.log(`  "${p}" → ${match ? '✅ MATCH' : '❌ no match'}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
