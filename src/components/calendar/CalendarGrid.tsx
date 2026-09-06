/* eslint-disable @next/next/no-img-element */
"use client";

import dayjs from "dayjs";
import 'dayjs/locale/id';
import clsx from "clsx";

dayjs.locale('id');

interface CalendarGridProps {
  currentDate: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  onDateClick: (date: Date) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTaskClick: (task: any) => void;
  userRole?: string;
}

const statusColors: Record<string, string> = {
  BRIEF: "bg-slate-100 text-slate-700 border-slate-200",
  DALAM_PROSES: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  REVISI: "bg-orange-50 text-orange-700 border-orange-200",
  SELESAI: "bg-green-50 text-green-700 border-green-200",
};

export function CalendarGrid({ currentDate, tasks = [], onDateClick, onTaskClick, userRole }: CalendarGridProps) {
  const startOfMonth = dayjs(currentDate).startOf('month');
  const endOfMonth = dayjs(currentDate).endOf('month');
  
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');
  
  const days = [];
  let day = startDate;
  
  while (day.isBefore(endDate)) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const getTasksForDate = (date: dayjs.Dayjs) => {
    return (tasks || []).filter(task => {
      if (!task.dueDate) return false;
      return dayjs(task.dueDate).isSame(date, 'day');
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
          <div key={d} className="py-2 text-center text-sm font-semibold text-slate-700 bg-slate-50">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 border-l border-slate-200 bg-slate-200 gap-px">
        {days.map((date, idx) => {
          const isCurrentMonth = date.isSame(currentDate, 'month');
          const isToday = date.isSame(dayjs(), 'day');
          const dateTasks = getTasksForDate(date);
          
          return (
            <div 
              key={idx} 
              className={clsx(
                "min-h-30 bg-white p-1 hover:bg-slate-50 transition-colors flex flex-col",
                !isCurrentMonth && "bg-slate-50 opacity-50",
                userRole === "SUPERADMIN" && "cursor-pointer"
              )}
              onClick={() => {
                if (userRole === "SUPERADMIN") onDateClick(date.toDate());
              }}
            >
              <div className="flex justify-between items-center p-1">
                <span className={clsx(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isToday ? "bg-blue-600 text-white" : "text-slate-700"
                )}>
                  {date.date()}
                </span>
                {dateTasks.length > 0 && (
                  <span className="text-xs text-slate-400">{dateTasks.length} task</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 mt-1 p-1">
                {dateTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={clsx(
                      "text-xs p-1.5 rounded-md border cursor-pointer hover:opacity-80 transition-opacity flex flex-col gap-1",
                      statusColors[task.status] || "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                    title={task.title}
                  >
                    <div className="font-semibold truncate leading-tight">
                      {task.title}
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {task.assignedTo.avatarUrl ? (
                          <img src={task.assignedTo.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-600 uppercase">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-[10px] truncate opacity-80">{task.assignedTo.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
