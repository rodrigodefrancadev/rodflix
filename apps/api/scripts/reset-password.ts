import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Por favor, forneça um email e uma nova senha. Exemplo: npm run reset-password user@email.com novaSenha123');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ Senha do usuário ${updated.email} redefinida com sucesso!`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`❌ Usuário com o email "${email}" não encontrado.`);
    } else {
      console.error('❌ Ocorreu um erro ao atualizar o usuário:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
