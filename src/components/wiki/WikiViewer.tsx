"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteWikiPage } from "@/app/actions/wiki-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WikiViewer({ 
  page, 
  userRole 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any;
  userRole: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus halaman ini?")) return;
    
    try {
      setIsDeleting(true);
      await deleteWikiPage(page.id);
      router.push("/wiki");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus halaman");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {page.parent && (
        <div className="text-sm text-slate-500 mb-2">
          {page.parent.title} /
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
          <div className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <span>Oleh: {page.author.name}</span>
            <span>•</span>
            <span>Diperbarui: {new Date(page.updatedAt).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {userRole === "SUPERADMIN" && (
            <Link 
              href={`/wiki/${page.slug}/edit`}
              className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4 mr-1.5" /> Edit
            </Link>
          )}
          
          {userRole === "SUPERADMIN" && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
            </button>
          )}
        </div>
      </div>
      
      {/* Content rendered safely because we will use tiptap rich text HTML output */}
      <div 
        className="prose prose-slate max-w-none text-slate-800" 
        dangerouslySetInnerHTML={{ __html: page.content || "<p>Tidak ada konten</p>" }} 
      />
    </div>
  );
}
