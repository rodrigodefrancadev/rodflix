import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'admin123';
  const hash = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { email: 'test@rodflix.com' },
    data: { password: hash, role: 'ADMIN', approved: true },
  });

  console.log(`✅ Password reset for ${updated.email} — new password: ${newPassword}`);
  await prisma.$disconnect();
}

main().catch(console.error);
