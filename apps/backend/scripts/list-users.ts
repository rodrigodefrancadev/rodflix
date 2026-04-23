import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany({
  select: { id: true, email: true, role: true, approved: true }
}).then(users => {
  console.log(JSON.stringify(users, null, 2));
  return prisma.$disconnect();
});
