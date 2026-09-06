"use client";

import { useState } from "react";
import { updateTaskDetails, deleteTask } from "@/app/actions/task-actions";
import { EditTaskInput } from "@/lib/validators/task-validator";
import { X, Trash2 } from "lucide-react";
import { Task } from "@/generated/prisma/client";
import { RichTextEditor } from "../ui/RichTextEditor";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export function EditTaskModal({ 
  task,
  isOpen, 
  onClose,
  members,
  userRole,
  categories
}: { 
  task: Task | null;
  isOpen: boolean; 
  onClose: () => void;
  members: { id: string; name: string; avatarUrl?: string | null }[];
  userRole?: string;
  categories: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [brief, setBrief] = useState(task?.brief || "");
  const [team, setTeam] = useState<"KONTEN" | "FUNDRAISING">(task?.team || "KONTEN");
  const [opsTaskCategoryId, setOpsTaskCategoryId] = useState<string>(task?.opsTaskCategoryId || "");
  const [assignedToId, setAssignedToId] = useState<string>(task?.assignedToId || "");
  const [dueDate, setDueDate] = useState<string>(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
  const [month, setMonth] = useState<string>(task?.month || "");
  const [driveLink, setDriveLink] = useState<string>(task?.driveLink || "");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const input: EditTaskInput = {
        id: task.id,
        title,
        description,
        team,
        opsTaskCategoryId: opsTaskCategoryId || undefined,
        dueDate: dueDate || undefined,
        month: month || undefined,
        driveLink: driveLink || undefined,
        assignedToId: assignedToId || undefined,
        brief: brief || undefined,
      };

      await updateTaskDetails(input);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal mengubah task");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: 'Hapus Task?',
      text: "Apakah Anda yakin ingin menghapus task ini? Tindakan ini tidak dapat dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal menghapus task");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Detail Task</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 p-1"
              title="Hapus Task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 min-h-0 bg-white">
          <form id="edit-task-form" onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Task</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brief (Rich Text)</label>
              <div className={userRole !== "SUPERADMIN" ? "opacity-75 pointer-events-none" : ""}>
                <RichTextEditor 
                  value={brief}
                  onChange={setBrief}
                  placeholder="Tuliskan brief lengkap di sini..."
                />
              </div>
              {userRole !== "SUPERADMIN" && (
                <p className="text-xs text-slate-500 mt-1 italic">* Hanya Super Admin yang dapat mengedit brief.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tim</label>
                <select 
                  value={team}
                  onChange={(e) => setTeam(e.target.value as "KONTEN" | "FUNDRAISING")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="KONTEN">Konten</option>
                  <option value="FUNDRAISING">Fundraising</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Task</label>
                <select 
                  value={opsTaskCategoryId}
                  onChange={(e) => setOpsTaskCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Ke</label>
              <select 
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Kosong --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link Google Drive (Opsional)</label>
              <input 
                type="url" 
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bulan Campaign</label>
                <input 
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t shrink-0 flex justify-end space-x-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            form="edit-task-form"
            disabled={loading || isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-blue-400"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
