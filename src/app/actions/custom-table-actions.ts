"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CustomFieldType, Team, Prisma } from "@/generated/prisma/client";

// Get all custom tables
export async function getCustomTables() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const tables = await prisma.customTable.findMany({
    include: {
      _count: {
        select: { fields: true, rows: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return tables;
}

// Get specific table with its schema and data
export async function getCustomTable(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const table = await prisma.customTable.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { order: "asc" }
      },
      rows: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return table;
}

// Create new custom table
export async function createCustomTable(data: {
  name: string;
  team?: Team | null;
  fields: { name: string; type: CustomFieldType; options?: unknown }[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const user = session.user as { role: string };
  if (user.role !== "SUPERADMIN") throw new Error("Only superadmin can create tables");

  const table = await prisma.customTable.create({
    data: {
      name: data.name,
      team: data.team || null,
      fields: {
        create: data.fields.map((f, i) => ({
          name: f.name,
          type: f.type,
          options: f.options ? JSON.stringify(f.options) : undefined,
          order: i
        }))
      }
    }
  });

  revalidatePath("/tables");
  return table;
}

// Delete custom table
export async function deleteCustomTable(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const user = session.user as { role: string };
  if (user.role !== "SUPERADMIN") throw new Error("Only superadmin can delete tables");

  // Prisma needs to cascade delete rows and fields. 
  // Wait, does schema have onDelete: Cascade?
  // Let's delete manually to be safe.
  await prisma.$transaction([
    prisma.customTableRow.deleteMany({ where: { tableId: id } }),
    prisma.customTableField.deleteMany({ where: { tableId: id } }),
    prisma.customTable.delete({ where: { id } })
  ]);

  revalidatePath("/tables");
}

// Add a row to a custom table
export async function addCustomTableRow(tableId: string, rowData: Prisma.InputJsonValue) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const row = await prisma.customTableRow.create({
    data: {
      tableId,
      data: rowData
    }
  });

  revalidatePath(`/tables/${tableId}`);
  return row;
}

// Update a row in a custom table
export async function updateCustomTableRow(rowId: string, tableId: string, rowData: Prisma.InputJsonValue) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const row = await prisma.customTableRow.update({
    where: { id: rowId },
    data: {
      data: rowData
    }
  });

  revalidatePath(`/tables/${tableId}`);
  return row;
}

// Delete a row
export async function deleteCustomTableRow(rowId: string, tableId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.customTableRow.delete({ where: { id: rowId } });

  revalidatePath(`/tables/${tableId}`);
}
