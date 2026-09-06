"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { CustomFieldType, Team } from "@/generated/prisma/client";
import { createCustomTable } from "@/app/actions/custom-table-actions";
import { useRouter } from "next/navigation";

export function CreateTableModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [team, setTeam] = useState<Team | "">("");
  const [fields, setFields] = useState<{ name: string; type: CustomFieldType }[]>([
    { name: "Nama", type: "TEXT" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "TEXT" }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: 'name' | 'type', value: string) => {
    const newFields = [...fields];
    if (key === 'name') newFields[index].name = value;
    if (key === 'type') newFields[index].type = value as CustomFieldType;
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Nama tabel harus diisi");
    
    // validasi field
    for (const f of fields) {
      if (!f.name.trim()) return setError("Semua nama kolom harus diisi");
    }

    setLoading(true);
    setError("");

    try {
      await createCustomTable({
        name,
        team: team ? (team as Team) : null,
        fields
      });
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat tabel");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Buat Tabel Custom Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
          
          <form id="createTableForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Tabel <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                placeholder="Contoh: Database Prospek Donatur"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Akses Tim (Opsional)</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as Team | "")}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="">Semua Tim (Umum)</option>
                <option value="KONTEN">Tim Konten</option>
                <option value="FUNDRAISING">Tim Fundraising</option>
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-slate-700">Definisi Kolom <span className="text-red-500">*</span></label>
                <button type="button" onClick={handleAddField} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Tambah Kolom
                </button>
              </div>
              
              <div className="space-y-3">
                {fields.map((field, i) => (
                  <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={field.name}
                        onChange={(e) => handleFieldChange(i, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white text-slate-900"
                        placeholder="Nama Kolom"
                      />
                    </div>
                    <div className="w-40">
                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(i, 'type', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white text-slate-900"
                      >
                        <option value="TEXT">Teks Pendek</option>
                        <option value="NUMBER">Angka</option>
                        <option value="DATE">Tanggal</option>
                        <option value="SELECT">Pilihan</option>
                      </select>
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => handleRemoveField(i)} className="p-1.5 text-slate-400 hover:text-red-500 mt-0.5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-white border rounded-md hover:bg-slate-50 font-medium">Batal</button>
          <button type="submit" form="createTableForm" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 font-medium disabled:opacity-50">
            {loading ? "Menyimpan..." : "Buat Tabel"}
          </button>
        </div>
      </div>
    </div>
  );
}
