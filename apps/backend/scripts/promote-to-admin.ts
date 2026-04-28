import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Por favor, forneça um email. Exemplo: npm run promote-to-admin -- user@example.com');
    process.exit(1);
  }

  try {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', approved: true },
    });

    console.log(`✅ Usuário ${updated.email} promovido a ADMIN e aprovado com sucesso!`);
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
