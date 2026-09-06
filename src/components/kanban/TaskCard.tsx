"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/generated/prisma/client";
import { Edit3, Calendar, AlignLeft } from "lucide-react";

export function TaskCard({ 
  task, 
  onEditTask,
  onViewBrief,
  userRole
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any;
  onEditTask?: (task: Task) => void;
  onViewBrief?: (task: Task) => void;
  userRole?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all duration-200 touch-none ${isDragging ? "ring-2 ring-blue-500 shadow-xl opacity-80 scale-105 z-50" : ""}`}
    >
      <div className="flex justify-between items-start mb-2 group">
        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700">
          {task.team}
        </span>
        <div className="flex space-x-1">
          {task.assignedTo && (
             <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded" title="Assignee">
               {task.assignedTo.name}
             </span>
          )}
          {onViewBrief && (
            <button
              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-200 px-2.5 py-1.5 rounded-lg flex items-center shadow-sm active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onViewBrief(task);
              }}
              title="Lihat Detail Task"
            >
              <AlignLeft className="w-3.5 h-3.5 mr-1.5" />
              Detail
            </button>
          )}
          {userRole === "SUPERADMIN" && onEditTask && (
            <button 
              className="text-slate-400 hover:text-white transition-all duration-200 p-1.5 rounded-lg hover:bg-red-500 hover:shadow-sm active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onEditTask(task);
              }}
              title="Edit / Hapus Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-800 mb-2">{task.title}</p>
      
      {task.dueDate && (
        <div className="flex items-center text-xs mt-2 bg-red-50 text-red-600 px-2 py-1 rounded w-fit">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </div>
      )}
    </div>
  );
}
