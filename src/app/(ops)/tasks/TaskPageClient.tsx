"use client";

import { useState } from "react";
import { TaskBoard } from "@/components/kanban/TaskBoard";
import { CreateTaskModal } from "@/components/kanban/CreateTaskModal";
import { EditTaskModal } from "@/components/kanban/EditTaskModal";
import { ViewBriefModal } from "@/components/kanban/ViewBriefModal";
import { ManageCategoryModal } from "@/components/kanban/ManageCategoryModal";
import { ExcelImportModal } from "@/components/kanban/ExcelImportModal";
import { FileSpreadsheet, MoreVertical, Tags, Plus } from "lucide-react";

import { Task, OpsTaskCategory } from "@/generated/prisma/client";

type Member = { id: string; name: string; avatarUrl?: string | null };

export function TaskPageClient({ initialTasks, members, userRole, categories }: { initialTasks: Task[], members: Member[], userRole: string, categories: OpsTaskCategory[] }) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredTasks = initialTasks.filter(t => {
    const matchAssignee = assigneeFilter === "ALL" || t.assignedToId === assigneeFilter;
    const matchMonth = monthFilter === "ALL" || t.month === monthFilter;
    return matchAssignee && matchMonth;
  });


  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
        <div className="flex items-center space-x-3">
          <input 
            type="month"
            value={monthFilter === "ALL" ? "" : monthFilter}
            onChange={(e) => setMonthFilter(e.target.value || "ALL")}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">Semua User</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {userRole === "SUPERADMIN" && (
            <>
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                  className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 hover:border-slate-400 hover:shadow-sm active:scale-95 transition-all duration-200 shadow-sm flex items-center"
                  title="Opsi Lainnya"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => { setIsExcelModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                      Import Excel
                    </button>
                    <button 
                      onClick={() => { setIsCategoryModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center border-t border-slate-50 transition-colors"
                    >
                      <Tags className="w-4 h-4 mr-2 text-blue-600" />
                      Kelola Kategori
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-800 border border-transparent text-white px-4 py-2 rounded-lg hover:bg-slate-900 hover:shadow-md active:scale-95 transition-all duration-200 text-sm font-semibold shadow-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Buat Task
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <TaskBoard initialTasks={filteredTasks} onEditTask={setEditingTask} onViewBrief={setViewingTask} userRole={userRole} />
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        members={members}
        userRole={userRole}
        categories={categories}
      />
      <EditTaskModal
        key={editingTask?.id || "empty"}
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        members={members}
        userRole={userRole}
        categories={categories}
      />
      <ViewBriefModal
        task={viewingTask}
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
      />
      <ManageCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
      />
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        userRole={userRole}
      />
    </div>
  );
}
