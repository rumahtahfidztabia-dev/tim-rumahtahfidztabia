"use client";

import { useState } from "react";
import { X, Target } from "lucide-react";
import { Team, KpiPeriod } from "@/generated/prisma/client";
import { createMetricWithTarget } from "@/app/actions/kpi-actions";

interface ManageMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageMetricModal({ isOpen, onClose }: ManageMetricModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    team: "KONTEN" as Team,
    name: "",
    unit: "",
    period: "MINGGUAN" as KpiPeriod,
    initialTarget: 0,
    periodStart: "",
    periodEnd: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.unit || !formData.periodStart || !formData.periodEnd) {
      setError("Harap isi semua kolom yang wajib.");
      setLoading(false);
      return;
    }

    try {
      await createMetricWithTarget({
        team: formData.team,
        name: formData.name,
        unit: formData.unit,
        period: formData.period,
        initialTarget: Number(formData.initialTarget),
        periodStart: new Date(formData.periodStart),
        periodEnd: new Date(formData.periodEnd),
      });
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Gagal membuat metrik.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Buat Metrik KPI Baru
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tim</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value as Team })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="KONTEN">Konten</option>
                <option value="FUNDRAISING">Fundraising</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Periode Evaluasi</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as KpiPeriod })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="HARIAN">Harian</option>
                <option value="MINGGUAN">Mingguan</option>
                <option value="BULANAN">Bulanan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Indikator / Metrik</label>
            <input
              type="text"
              required
              placeholder="Misal: Jumlah Post Terupload"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Angka (Awal)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Misal: 10"
                value={formData.initialTarget}
                onChange={(e) => setFormData({ ...formData, initialTarget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
              <input
                type="text"
                required
                placeholder="Misal: Post, Orang, Juta"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">MASA BERLAKU TARGET</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                required
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Buat Metrik"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
