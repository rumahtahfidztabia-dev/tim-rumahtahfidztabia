"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { createWikiPage, updateWikiPage } from "@/app/actions/wiki-actions";
import { useRouter } from "next/navigation";
import { Team } from "@/generated/prisma/client";
import { Save, X } from "lucide-react";
import Link from "next/link";
import { WikiNode } from "./WikiSidebar";

export function WikiEditor({ 
  initialData, 
  tree 
}: { 
  initialData?: { id: string; slug: string; title: string; content: string; parentId: string | null; team: string | null };
  tree: WikiNode[];
}) {
  const router = useRouter();
  const isEditing = !!initialData;
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [parentId, setParentId] = useState<string>(initialData?.parentId || "");
  const [team, setTeam] = useState<Team | "">((initialData?.team as Team) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul halaman wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        title,
        content,
        parentId: parentId || null,
        team: team ? team as Team : null,
      };

      let result;
      if (isEditing) {
        result = await updateWikiPage(initialData.id, data);
      } else {
        result = await createWikiPage(data);
      }
      
      router.push(`/wiki/${result.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan halaman");
      setLoading(false);
    }
  };

  // Flatten tree for parent selection
  const flattenTree = (nodes: WikiNode[], level = 0): { id: string; title: string; level: number }[] => {
    let result: { id: string; title: string; level: number }[] = [];
    for (const node of nodes) {
      // Don't allow selecting self or children as parent
      if (isEditing && node.id === initialData.id) continue;
      
      result.push({ id: node.id, title: node.title, level });
      if (node.children) {
        result = result.concat(flattenTree(node.children, level + 1));
      }
    }
    return result;
  };

  const parentOptions = flattenTree(tree);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditing ? "Edit Halaman Wiki" : "Buat Halaman Wiki Baru"}
        </h1>
        <Link 
          href={isEditing ? `/wiki/${initialData.slug}` : "/wiki"}
          className="flex items-center px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4 mr-1" /> Batal
        </Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Judul Halaman <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 font-medium"
            placeholder="Contoh: SOP Penggalangan Dana"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Halaman Induk (Parent)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="">-- Tidak ada (Halaman Utama) --</option>
              {parentOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {'\u00A0'.repeat(opt.level * 4)}
                  {opt.level > 0 ? "└ " : ""}{opt.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Akses Tim (Opsional)</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value as Team | "")}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="">Semua Tim (Umum)</option>
              <option value="KONTEN">Tim Konten</option>
              <option value="FUNDRAISING">Tim Fundraising</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Konten Halaman</label>
          <div className="min-h-75">
             <RichTextEditor 
                value={content} 
                onChange={setContent} 
                placeholder="Tulis konten wiki di sini..." 
             />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Menyimpan..." : "Simpan Halaman"}
          </button>
        </div>
      </form>
    </div>
  );
}
