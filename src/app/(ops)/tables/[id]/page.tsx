import { getCustomTable, deleteCustomTable } from "@/app/actions/custom-table-actions";
import { notFound, redirect } from "next/navigation";
import { DynamicTableGrid } from "@/components/tables/DynamicTableGrid";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function TableViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();
  
  const resolvedParams = await params;
  const table = await getCustomTable(resolvedParams.id);
  const userRole = (session.user as { role: string }).role;
  
  if (!table) {
    return notFound();
  }

  // A server action to handle deletion with redirect
  async function handleDeleteTable() {
    "use server";
    await deleteCustomTable(resolvedParams.id);
    redirect("/tables");
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/tables" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{table.name}</h1>
            {table.team && <p className="text-sm text-slate-500">Khusus Tim: {table.team}</p>}
          </div>
        </div>
        
        {userRole === "SUPERADMIN" && (
          <form action={handleDeleteTable}>
            <button 
              type="submit"
              className="flex items-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={(e) => {
                 if(!confirm("Yakin ingin menghapus seluruh tabel ini beserta datanya secara permanen?")) e.preventDefault();
              }}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Tabel
            </button>
          </form>
        )}
      </div>

      <div className="flex-1">
        <DynamicTableGrid tableData={table} />
      </div>
    </div>
  );
}
