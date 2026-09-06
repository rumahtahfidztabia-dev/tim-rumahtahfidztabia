import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { team: "KONTEN" }
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
