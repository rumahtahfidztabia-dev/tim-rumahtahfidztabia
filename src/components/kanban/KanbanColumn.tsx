"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";

import { Task } from "@/generated/prisma/client";

export function KanbanColumn({ 
  column, 
  tasks,
  onEditTask,
  onViewBrief,
  userRole
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any; 
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onViewBrief?: (task: Task) => void;
  userRole?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className={`flex flex-col w-80 bg-slate-100 rounded-lg p-4 shrink-0 transition-colors ${isOver ? "bg-slate-200" : ""}`}>
      <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
        {column.title}
        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
          {tasks.length}
        </span>
      </h3>
      
      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-37.5">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEditTask={onEditTask} onViewBrief={onViewBrief} userRole={userRole} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
