import { prisma } from "./src/lib/prisma";

async function main() {
  const tasks = await prisma.task.findMany({});
  console.log("TOTAL TASKS IN DB:", tasks.length);
  console.log(tasks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
