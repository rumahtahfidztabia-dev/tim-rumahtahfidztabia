import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Clock, CheckCircle, AlertCircle, ListTodo, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null; // Layout will handle redirect
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  const userId = user.id;
  const userRole = user.role;
  const userName = user.name;

  // 1. Fetch User's Active Tasks (Not SELESAI)
  const myActiveTasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: { not: "SELESAI" }
    },
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ],
    take: 5
  });

  const myTasksCount = await prisma.task.count({
    where: { assignedToId: userId, status: { not: "SELESAI" } }
  });

  const myCompletedTasksCount = await prisma.task.count({
    where: { assignedToId: userId, status: "SELESAI" }
  });

  // 2. Determine Team Context based on Role
  let teamContext: "KONTEN" | "FUNDRAISING" | null = null;
  if (userRole === "EDITOR") teamContext = "KONTEN";
  if (userRole === "KEUANGAN") teamContext = "FUNDRAISING";

  // Fetch Team Active Tasks Count
  const teamActiveTasksCount = await prisma.task.count({
    where: {
      team: teamContext || undefined,
      status: { not: "SELESAI" }
    }
  });

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Halo, {userName.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Berikut adalah ringkasan pekerjaan Anda hari ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-600">Task Aktif Saya</h2>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{myTasksCount}</div>
          <p className="text-sm text-slate-500 mt-1">Task perlu dikerjakan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-600">Task Selesai</h2>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{myCompletedTasksCount}</div>
          <p className="text-sm text-slate-500 mt-1">Task diselesaikan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-600">
              {teamContext === "KONTEN" ? "Task Tim Konten" : teamContext === "FUNDRAISING" ? "Task Tim Fundraising" : "Total Task Aktif"}
            </h2>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{teamActiveTasksCount}</div>
          <p className="text-sm text-slate-500 mt-1">Belum Selesai</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* To-Do List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Prioritas Terdekat</h2>
            <Link href="/tasks" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center group">
              Lihat Kanban
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {myActiveTasks.length > 0 ? (
              myActiveTasks.map((task) => (
                <div key={task.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      task.status === "REVIEW" ? "bg-purple-100 text-purple-700" :
                      task.status === "REVISI" ? "bg-red-100 text-red-700" :
                      task.status === "DALAM_PROSES" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {task.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                      {task.team}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-1">{task.title}</h3>
                  {task.dueDate && (
                    <div className="flex items-center text-xs mt-3 font-medium text-red-500">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                      Tenggat: {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle className="w-12 h-12 mb-3 text-slate-200" />
                <p>Tidak ada task aktif untuk Anda.</p>
                <p className="text-xs mt-1">Bagus sekali!</p>
              </div>
            )}
          </div>
        </div>

        {/* Shortcut Action / Placeholder KPI */}
        <div className="bg-linear-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Siap Berkarya Hari Ini?</h2>
            <p className="text-slate-300 mb-8 max-w-sm leading-relaxed">
              Pantau pekerjaan Anda, kelola target KPI, dan sinkronkan kalender konten dengan tim.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/tasks" className="bg-white/10 hover:bg-white/20 border border-white/20 transition-colors p-4 rounded-xl flex items-center">
                <ListTodo className="w-6 h-6 mr-3 text-blue-400" />
                <span className="font-semibold">Kanban Board</span>
              </Link>
              <Link href="/kpi" className="bg-white/10 hover:bg-white/20 border border-white/20 transition-colors p-4 rounded-xl flex items-center">
                <Clock className="w-6 h-6 mr-3 text-orange-400" />
                <span className="font-semibold">Modul KPI</span>
              </Link>
              <Link href="/calendar" className="bg-white/10 hover:bg-white/20 border border-white/20 transition-colors p-4 rounded-xl flex items-center col-span-2">
                <CalendarIcon className="w-6 h-6 mr-3 text-green-400" />
                <span className="font-semibold">Kalender Konten</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
