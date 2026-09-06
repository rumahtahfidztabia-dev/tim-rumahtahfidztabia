import { prisma } from "./src/lib/prisma";

async function main() {
  const tasks = await prisma.task.findMany({
    select: { id: true, title: true, team: true, status: true }
  });
  console.log("ALL TASKS:");
  console.table(tasks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
