import { getCustomTables } from "@/app/actions/custom-table-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TableListClient } from "@/components/tables/TableListClient";

export default async function TablesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();
  
  const role = (session.user as { role: string }).role;
  const isSuperadmin = role === "SUPERADMIN";
  
  const tables = await getCustomTables();

  return <TableListClient initialTables={tables} isSuperadmin={isSuperadmin} />;
}
