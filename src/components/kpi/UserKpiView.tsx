"use client";

import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, TrendingUp, Calendar, Download } from "lucide-react";

type IncompletedTask = {
  id: string;
  title: string;
  dueDate: Date | null;
  status: string;
  kpiNote: string | null;
};

type TrendItem = {
  month: string;
  total: number;
  completed: number;
  percentage: number;
};

type PersonalData = {
  month: string;
  total: number;
  completed: number;
  incomplete: number;
  percentage: number;
  incompleteTasks: IncompletedTask[];
  trend: TrendItem[];
};

function getPercentageColor(pct: number) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-yellow-500";
  return "text-red-500";
}

function getBarColor(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function getMonthLabel(monthStr: string) {
  return new Date(monthStr + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function UserKpiView({ data, userName, onMonthChange }: {
  data: PersonalData;
  userName: string;
  onMonthChange: (m: string) => void;
}) {
  const navigateMonth = (dir: number) => {
    const [y, m] = data.month.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const monthLabel = getMonthLabel(data.month);

  const exportPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`KPI Pribadi - ${userName}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Periode: ${monthLabel}`, 14, 28);
    doc.text(`Diekspor: ${new Date().toLocaleDateString("id-ID")}`, 14, 35);

    autoTable(doc, {
      startY: 42,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Total Task", data.total],
        ["Task Selesai", data.completed],
        ["Task Belum Selesai", data.incomplete],
        ["Persentase Pencapaian", `${data.percentage}%`],
      ],
      theme: "grid",
    });

    if (data.incompleteTasks.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastY = (doc as any).lastAutoTable?.finalY + 10 || 80;
      doc.setFontSize(13);
      doc.text("Task Belum Selesai", 14, lastY);
      autoTable(doc, {
        startY: lastY + 4,
        head: [["Task", "Status", "Catatan Superadmin"]],
        body: data.incompleteTasks.map(t => [t.title, t.status.replace("_", " "), t.kpiNote || "-"]),
        theme: "grid",
        columnStyles: { 2: { cellWidth: 80 } },
      });
    }

    doc.save(`KPI-${userName.replace(" ", "_")}-${data.month}.pdf`);
  };

  const maxBar = Math.max(...data.trend.map(t => t.total), 1);

  return (
    <div className="flex flex-col space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KPI Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pantau capaian task Anda bulan ini, {userName.split(" ")[0]}!</p>
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
        </div>
      </div>

      {/* Main Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-5 flex items-center text-sm uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 mr-2 text-slate-500" /> Capaian Bulan Ini
          </h2>
          <div className="flex items-center gap-8">
            {/* Big percentage */}
            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 shrink-0"
              style={{ borderColor: data.percentage >= 80 ? "#22c55e" : data.percentage >= 50 ? "#eab308" : "#ef4444" }}>
              <span className={`text-3xl font-extrabold ${getPercentageColor(data.percentage)}`}>{data.percentage}%</span>
              <span className="text-xs text-slate-500 mt-1">capaian</span>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Task Selesai</span>
                  <span className="font-bold text-green-600">{data.completed} / {data.total}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-700 ${getBarColor(data.percentage)}`}
                    style={{ width: `${data.percentage}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xl font-extrabold text-slate-800">{data.total}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Total Task</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xl font-extrabold text-green-600">{data.completed}</div>
                  <div className="text-xs text-green-500 mt-0.5">Selesai</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xl font-extrabold text-red-500">{data.incomplete}</div>
                  <div className="text-xs text-red-400 mt-0.5">Belum Selesai</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className={`rounded-xl border shadow-sm p-6 flex flex-col items-center justify-center text-center ${
          data.percentage >= 80 ? "bg-green-50 border-green-200" :
          data.percentage >= 50 ? "bg-yellow-50 border-yellow-200" :
          "bg-red-50 border-red-200"
        }`}>
          {data.percentage >= 80 ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
              <p className="font-bold text-green-700 text-lg">Kerja Bagus!</p>
              <p className="text-green-600 text-sm mt-1">Anda mencapai lebih dari 80% target bulan ini.</p>
            </>
          ) : data.percentage >= 50 ? (
            <>
              <AlertCircle className="w-10 h-10 text-yellow-500 mb-3" />
              <p className="font-bold text-yellow-700 text-lg">Terus Semangat!</p>
              <p className="text-yellow-600 text-sm mt-1">Masih ada {data.incomplete} task yang perlu diselesaikan.</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p className="font-bold text-red-700 text-lg">Perlu Perhatian</p>
              <p className="text-red-600 text-sm mt-1">Capaian bulan ini masih rendah. Cek catatan superadmin di bawah.</p>
            </>
          )}
        </div>
      </div>

      {/* Trend Bar Chart */}
      {data.trend.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-5 flex items-center text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4 mr-2 text-slate-500" /> Tren 5 Bulan Terakhir
          </h2>
          <div className="flex items-end gap-3 h-28">
            {data.trend.map((t) => (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className={`text-xs font-bold ${getPercentageColor(t.percentage)}`}>{t.percentage}%</span>
                <div className="w-full rounded-t-md relative overflow-hidden bg-slate-100 transition-all duration-500"
                  style={{ height: `${Math.max((t.total / maxBar) * 100, 8)}%` }}>
                  <div className={`absolute bottom-0 left-0 right-0 rounded-t-md ${getBarColor(t.percentage)}`}
                    style={{ height: `${t.percentage}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{getMonthLabel(t.month).split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incomplete tasks + notes */}
      {data.incompleteTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center text-sm uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 mr-2 text-red-500" /> Task Belum Selesai - Catatan & Masukan
          </h2>
          <div className="space-y-3">
            {data.incompleteTasks.map(task => (
              <div key={task.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-slate-800">{task.title}</span>
                  <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full ml-2 shrink-0">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                {task.dueDate && (
                  <p className="text-xs text-slate-400 mb-2">
                    Tenggat: {new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
                {task.kpiNote ? (
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-xs font-bold text-slate-500 mb-1">💬 Catatan Superadmin:</p>
                    <p className="text-sm text-slate-700">{task.kpiNote}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada catatan dari Superadmin.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.incompleteTasks.length === 0 && data.total > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-bold text-green-700 text-lg">Luar Biasa!</p>
          <p className="text-green-600">Semua task Anda bulan ini sudah diselesaikan. Pertahankan terus!</p>
        </div>
      )}

      {data.total === 0 && (
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Tidak ada task yang ditugaskan kepada Anda di bulan {monthLabel}.
        </div>
      )}
    </div>
  );
}
