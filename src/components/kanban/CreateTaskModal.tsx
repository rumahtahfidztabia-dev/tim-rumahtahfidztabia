"use client";

import { useState } from "react";
import { createTask } from "@/app/actions/task-actions";
import { CreateTaskInput } from "@/lib/validators/task-validator";
import { X } from "lucide-react";
import { RichTextEditor } from "../ui/RichTextEditor";

export function CreateTaskModal({ 
  isOpen, 
  onClose,
  defaultTeam = "KONTEN",
  defaultTitle = "",
  defaultDueDate = "",
  contentCalendarItemId,
  members,
  userRole,
  categories
}: { 
  isOpen: boolean; 
  onClose: () => void;
  defaultTeam?: "KONTEN" | "FUNDRAISING";
  defaultTitle?: string;
  defaultDueDate?: string;
  contentCalendarItemId?: string;
  members: { id: string; name: string; avatarUrl?: string | null }[];
  userRole?: string;
  categories: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [brief, setBrief] = useState("");
  const [team, setTeam] = useState<"KONTEN" | "FUNDRAISING">(defaultTeam);
  const [opsTaskCategoryId, setOpsTaskCategoryId] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [month, setMonth] = useState<string>("");
  const [driveLink, setDriveLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const input: CreateTaskInput = {
        title,
        description,
        team,
        opsTaskCategoryId: opsTaskCategoryId || undefined,
        dueDate: dueDate || undefined,
        month: month || undefined,
        driveLink: driveLink || undefined,
        assignedToId: assignedToId || undefined,
        contentCalendarItemId: contentCalendarItemId || undefined,
        brief: brief || undefined,
      };

      await createTask(input);
      // Reset and close
      setTitle(defaultTitle);
      setDescription("");
      setBrief("");
      setOpsTaskCategoryId("");
      setAssignedToId("");
      setDueDate("");
      setMonth("");
      setDriveLink("");
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal membuat task");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Buat Task Baru</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 min-h-0 bg-white">
          <form id="create-task-form" onSubmit={handleSubmit} className="p-4 space-y-4">
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
              placeholder="Contoh: Desain Banner Ramadhan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Penjelasan singkat..."
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
              <p className="text-xs text-slate-500 mt-1 italic">* Hanya Super Admin yang dapat menambahkan brief.</p>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign Ke (Opsional)</label>
            <select 
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Pilih Anggota Tim --</option>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Bulan Campaign (Opsional)</label>
              <input 
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline (Opsional)</label>
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
            form="create-task-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md disabled:bg-slate-400"
          >
            {loading ? "Menyimpan..." : "Simpan Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
