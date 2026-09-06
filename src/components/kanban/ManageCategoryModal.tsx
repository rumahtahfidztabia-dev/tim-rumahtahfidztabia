"use client";

import { useState } from "react";
import { Plus, X, Trash2, Edit2, Save } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { OpsTaskCategory } from "@/generated/prisma/client";
import { createOpsTaskCategory, updateOpsTaskCategory, deleteOpsTaskCategory } from "@/app/actions/task-category-actions";

const MySwal = withReactContent(Swal);

interface ManageCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: OpsTaskCategory[];
}

export function ManageCategoryModal({ isOpen, onClose, categories }: ManageCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await createOpsTaskCategory({ name: newName.trim() });
      if (!result.success) {
        setError(result.error);
      } else {
        setNewName("");
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await updateOpsTaskCategory(id, { name: editName.trim() });
      if (!result.success) {
        setError(result.error);
      } else {
        setEditingId(null);
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Hapus Kategori?',
      text: "Yakin ingin menghapus kategori ini? Data yang terkait mungkin ikut terpengaruh.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError(null);
    try {
      const result = await deleteOpsTaskCategory(id);
      if (!result.success) {
        setError(result.error);
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Kelola Kategori Task</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b shrink-0 bg-slate-50">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kategori baru..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 flex items-center text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 bg-white p-4">
          {categories.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">
              Belum ada kategori.
            </div>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors">
                  {editingId === cat.id ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleUpdate(cat.id)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          disabled={loading}
                          className="text-slate-400 hover:text-blue-600 p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={loading}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
