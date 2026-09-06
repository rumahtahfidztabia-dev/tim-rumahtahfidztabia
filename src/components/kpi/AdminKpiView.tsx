"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Users, TrendingUp, AlertCircle, Download, CheckCircle2, PlusCircle, ListTodo } from "lucide-react";
import { ManageMetricModal } from "@/components/kpi/ManageMetricModal";
import { addKpiNote } from "@/app/actions/kpi-actions";

type IncompletedTask = {
  id: string;
  title: string;
  dueDate: Date | null;
  status: string;
  kpiNote: string | null;
};

type StaffData = {
  id: string;
  name: string;
  role: string;
  team: string;
  total: number;
  completed: number;
  incomplete: number;
  percentage: number;
  incompleteTasks: IncompletedTask[];
};

type MonthlyData = {
  month: string;
  team: {
    konten: { total: number; completed: number; percentage: number };
    fundraising: { total: number; completed: number; percentage: number };
  };
  staff: StaffData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manualMetrics: any[];
};

function getPercentageColor(pct: number) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-yellow-600";
  return "text-red-500";
}

function getBarColor(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function TeamSummaryCard({ label, data }: { label: string; data: { total: number; completed: number; percentage: number } }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{label}</h3>
        <span className={`text-2xl font-extrabold ${getPercentageColor(data.percentage)}`}>{data.percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-500 ${getBarColor(data.percentage)}`} style={{ width: `${data.percentage}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 font-medium">
        <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> Selesai: <strong className="ml-1">{data.completed}</strong></span>
        <span className="flex items-center"><ListTodo className="w-3.5 h-3.5 mr-1 text-slate-400" /> Total: <strong className="ml-1">{data.total}</strong></span>
        <span className="flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1 text-yellow-500" /> Belum: <strong className="ml-1">{data.total - data.completed}</strong></span>
      </div>
    </div>
  );
}

function StaffRow({ staff, onNoteChange }: { staff: StaffData; onNoteChange: (taskId: string, note: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (taskId: string) => {
    setSaving(taskId);
    await addKpiNote(taskId, editNotes[taskId] || "");
    onNoteChange(taskId, editNotes[taskId] || "");
    setSaving(null);
  };

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-semibold text-slate-800">{staff.name}</td>
        <td className="px-4 py-3 text-center text-slate-600">{staff.total}</td>
        <td className="px-4 py-3 text-center text-green-600 font-semibold">{staff.completed}</td>
        <td className="px-4 py-3 text-center text-red-500 font-semibold">{staff.incomplete}</td>
        <td className="px-4 py-3 text-center">
          <span className={`text-sm font-bold ${getPercentageColor(staff.percentage)}`}>{staff.percentage}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className={`h-1.5 rounded-full ${getBarColor(staff.percentage)}`} style={{ width: `${staff.percentage}%` }} />
          </div>
        </td>
        <td className="px-4 py-3 text-center text-slate-400 text-xs">{expanded ? "▲ Tutup" : "▼ Detail"}</td>
      </tr>
      {expanded && staff.incompleteTasks.length > 0 && (
        <tr className="bg-red-50 border-b border-red-100">
          <td colSpan={6} className="px-4 py-4">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Task Belum Selesai ({staff.incompleteTasks.length})
            </p>
            <div className="space-y-3">
              {staff.incompleteTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg p-3 border border-red-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-slate-800 text-sm">{task.title}</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-slate-400 mb-2">
                      Tenggat: {new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-medium">💬 Catatan Superadmin:</p>
                    <textarea
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                      rows={2}
                      placeholder="Tambahkan masukan atau refleksi..."
                      defaultValue={task.kpiNote || ""}
                      onChange={(e) => setEditNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSave(task.id); }}
                      disabled={saving === task.id}
                      className="mt-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving === task.id ? "Menyimpan..." : "Simpan Catatan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
      {expanded && staff.incompleteTasks.length === 0 && (
        <tr className="bg-green-50 border-b border-green-100">
          <td colSpan={6} className="px-4 py-3 text-center text-sm text-green-600 font-medium flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Semua task bulan ini sudah diselesaikan!
          </td>
        </tr>
      )}
    </>
  );
}

export function AdminKpiView({ data, onMonthChange }: {
  data: MonthlyData;
  onMonthChange: (m: string) => void;
}) {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [staffData, setStaffData] = useState(data.staff);

  const handleNoteChange = useCallback((taskId: string, note: string) => {
    setStaffData(prev => prev.map(s => ({
      ...s,
      incompleteTasks: s.incompleteTasks.map(t => t.id === taskId ? { ...t, kpiNote: note } : t)
    })));
  }, []);

  const navigateMonth = (direction: number) => {
    const [year, month] = data.month.split("-").map(Number);
    const d = new Date(year, month - 1 + direction, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const monthLabel = new Date(data.month + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const kontenStaff = staffData.filter(s => s.team === "KONTEN");
  const fundraisingStaff = staffData.filter(s => s.team === "FUNDRAISING");

  const exportPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan KPI - ${monthLabel}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Diekspor pada: ${new Date().toLocaleDateString("id-ID")}`, 14, 27);

    // Team summary
    doc.setFontSize(13);
    doc.text("Ringkasan Tim", 14, 38);
    autoTable(doc, {
      startY: 42,
      head: [["Tim", "Total", "Selesai", "Belum", "Persentase"]],
      body: [
        ["Tim Konten", data.team.konten.total, data.team.konten.completed, data.team.konten.total - data.team.konten.completed, `${data.team.konten.percentage}%`],
        ["Tim Fundraising", data.team.fundraising.total, data.team.fundraising.completed, data.team.fundraising.total - data.team.fundraising.completed, `${data.team.fundraising.percentage}%`],
      ],
      theme: "grid",
    });

    // Per-staff
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastY = (doc as any).lastAutoTable?.finalY + 10 || 80;
    doc.setFontSize(13);
    doc.text("Performa Individu", 14, lastY);
    autoTable(doc, {
      startY: lastY + 4,
      head: [["Nama", "Tim", "Total", "Selesai", "Belum", "%"]],
      body: staffData.map(s => [s.name, s.team, s.total, s.completed, s.incomplete, `${s.percentage}%`]),
      theme: "striped",
    });

    // Incomplete tasks with notes
    const allIncomplete = staffData.flatMap(s =>
      s.incompleteTasks.map(t => [s.name, t.title, t.status, t.kpiNote || "-"])
    );
    if (allIncomplete.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastY2 = (doc as any).lastAutoTable?.finalY + 10 || 140;
      doc.addPage();
      doc.setFontSize(13);
      doc.text("Task Tidak Selesai & Catatan", 14, 20);
      autoTable(doc, {
        startY: 24,
        head: [["Nama Staf", "Task", "Status", "Catatan Superadmin"]],
        body: allIncomplete,
        theme: "grid",
        columnStyles: { 3: { cellWidth: 70 } },
      });
      void lastY2;
    }

    doc.save(`KPI-${data.month}.pdf`);
  };

  return (
    <div className="flex flex-col space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard KPI</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pantau performa tim dan individu per bulan</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800 min-w-32.5 text-center">{monthLabel}</span>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-8 bg-slate-200 mx-1" />
          <button onClick={exportPdf} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={() => setIsManageModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> Kelola Metrik
          </button>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-slate-500" /> Ringkasan Tim - {monthLabel}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TeamSummaryCard label="Tim Konten" data={data.team.konten} />
          <TeamSummaryCard label="Tim Fundraising" data={data.team.fundraising} />
        </div>
      </div>

      {/* Tim Konten Staff Table */}
      {kontenStaff.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2 text-slate-500" /> Performa Individu - Tim Konten
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nama</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-green-600">Selesai</th>
                  <th className="px-4 py-3 text-center font-semibold text-red-500">Belum</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Progress</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-400">Detail</th>
                </tr>
              </thead>
              <tbody>
                {kontenStaff.map(s => <StaffRow key={s.id} staff={s} onNoteChange={handleNoteChange} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tim Fundraising Staff Table */}
      {fundraisingStaff.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2 text-slate-500" /> Performa Individu - Tim Fundraising
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nama</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-green-600">Selesai</th>
                  <th className="px-4 py-3 text-center font-semibold text-red-500">Belum</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Progress</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-400">Detail</th>
                </tr>
              </thead>
              <tbody>
                {fundraisingStaff.map(s => <StaffRow key={s.id} staff={s} onNoteChange={handleNoteChange} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ManageMetricModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} />
    </div>
  );
}
