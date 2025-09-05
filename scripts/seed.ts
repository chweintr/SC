import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: 'demo@sasq.chat' },
    update: {},
    create: { email: 'demo@sasq.chat' },
  });

  const convo = await prisma.conversation.create({
    data: {
      userId: demo.id,
      title: 'Welcome to SasqChat',
      messages: {
        create: [
          { role: 'system', text: 'You are SasqChat, a friendly Bigfoot avatar.', tokenIn: 0, tokenOut: 0 },
          { role: 'assistant', text: 'Hey there, ready to explore the woods?', tokenIn: 0, tokenOut: 12 },
        ],
      },
    },
  });

  console.log('Seeded user', demo.id, 'conversation', convo.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


