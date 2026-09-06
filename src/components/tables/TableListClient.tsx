"use client";

import { useState } from "react";
import { CreateTableModal } from "@/components/tables/CreateTableModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type TableItem = {
  id: string;
  name: string;
  _count?: {
    fields: number;
    rows: number;
  };
};

export function TableListClient({ initialTables, isSuperadmin }: { initialTables: TableItem[], isSuperadmin: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Tabel Custom</h1>
        {isSuperadmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 text-sm font-medium"
          >
            Buat Tabel Baru
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialTables.map(table => (
          <Link key={table.id} href={`/tables/${table.id}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between h-32 hover:border-blue-400 cursor-pointer transition-colors group">
              <div>
                <h2 className="text-lg font-semibold text-slate-700 group-hover:text-blue-700">{table.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {table._count?.fields} kolom, {table._count?.rows} baris
                </p>
              </div>
            </div>
          </Link>
        ))}
        
        {isSuperadmin && (
          <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-50 p-6 rounded-lg shadow-sm border-slate-300 flex items-center justify-center h-32 border-dashed border-2 hover:bg-slate-100 hover:border-slate-400 cursor-pointer transition-colors"
          >
             <span className="text-slate-500 font-medium">+ Buat Tabel Baru</span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateTableModal 
          onClose={() => { 
            setIsModalOpen(false); 
            router.refresh(); 
          }} 
        />
      )}
    </div>
  );
}
