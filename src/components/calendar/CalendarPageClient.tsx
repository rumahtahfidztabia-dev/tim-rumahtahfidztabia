"use client";

import { useState } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/id';
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CalendarGrid } from "./CalendarGrid";
import { CreateTaskModal } from "../kanban/CreateTaskModal";
import { EditTaskModal } from "../kanban/EditTaskModal";
import { useRouter } from "next/navigation";
import { Task } from "@/generated/prisma/client";

dayjs.locale('id');

export function CalendarPageClient({ 
  initialTasks, 
  members,
  categories,
  currentMonthParam,
  userRole
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialTasks: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  currentMonthParam: string; // YYYY-MM
  userRole: string;
}) {
  const router = useRouter();
  
  const initialDate = dayjs(currentMonthParam + "-01").isValid() 
    ? dayjs(currentMonthParam + "-01").toDate() 
    : new Date();
    
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handlePrevMonth = () => {
    const newDate = dayjs(currentDate).subtract(1, 'month').toDate();
    setCurrentDate(newDate);
    updateUrl(newDate);
  };

  const handleNextMonth = () => {
    const newDate = dayjs(currentDate).add(1, 'month').toDate();
    setCurrentDate(newDate);
    updateUrl(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const newDate = dayjs(e.target.value + "-01").toDate();
    setCurrentDate(newDate);
    updateUrl(newDate);
  };

  const updateUrl = (date: Date) => {
    const monthStr = dayjs(date).format('YYYY-MM');
    router.push(`/calendar?month=${monthStr}`);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
    setTimeout(() => setSelectedDate(null), 200);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setTimeout(() => setSelectedTask(null), 200);
  };

  const defaultDueDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : "";

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          Kalender Deadline Task
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 bg-white rounded-md border border-slate-300 p-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input 
              type="month"
              value={dayjs(currentDate).format('YYYY-MM')}
              onChange={handleMonthChange}
              className="px-2 py-1 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
            />
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {userRole === "SUPERADMIN" && (
            <button 
              onClick={() => handleDateClick(new Date())}
              className="flex items-center bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 text-sm font-medium w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Buat Task Baru
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-150 relative">
        <CalendarGrid 
          currentDate={currentDate} 
          tasks={initialTasks} 
          onDateClick={handleDateClick}
          onTaskClick={handleTaskClick}
          userRole={userRole}
        />
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        members={members}
        categories={categories}
        userRole={userRole}
        defaultDueDate={defaultDueDate}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        task={selectedTask}
        members={members}
        categories={categories}
        userRole={userRole}
      />
    </div>
  );
}
