"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { logKpiEntry } from "@/app/actions/kpi-actions";

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricId: string;
  metricName: string;
  unit: string;
}

export function LogEntryModal({ isOpen, onClose, metricId, metricName, unit }: LogEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    value: 0,
    note: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await logKpiEntry({
        metricId,
        entryDate: new Date(formData.entryDate),
        value: Number(formData.value),
        note: formData.note || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Gagal menyimpan realisasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Input Realisasi
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 text-sm font-medium">
            Metrik: {metricName}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Realisasi</label>
            <input
              type="date"
              required
              value={formData.entryDate}
              onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pencapaian (Angka)</label>
            <div className="flex items-center">
              <input
                type="number"
                required
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="bg-slate-100 border border-l-0 px-4 py-2 rounded-r-md text-slate-600 text-sm">
                {unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Contoh: Termasuk 2 donatur offline"
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Realisasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
