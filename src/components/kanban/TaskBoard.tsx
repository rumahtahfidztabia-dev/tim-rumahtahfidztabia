"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCorners, 
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { updateTaskStatusAndOrder } from "@/app/actions/task-actions";
import { Task } from "@/generated/prisma/client";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const COLUMNS = [
  { id: "BRIEF", title: "Brief" },
  { id: "DALAM_PROSES", title: "Dalam Proses" },
  { id: "REVIEW", title: "Review" },
  { id: "REVISI", title: "Revisi" },
  { id: "SELESAI", title: "Selesai" },
];

export function TaskBoard({ 
  initialTasks, 
  onEditTask,
  onViewBrief,
  userRole = "EDITOR"
}: { 
  initialTasks: Task[];
  onEditTask?: (task: Task) => void;
  onViewBrief?: (task: Task) => void;
  userRole?: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [prevInitialTasks, setPrevInitialTasks] = useState<Task[]>(initialTasks);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement to start drag (helps avoid accidental clicks)
      },
    })
  );

  if (!isMounted) {
    return (
      <div className="flex space-x-6 h-full min-h-125">
        {COLUMNS.map((col) => {
          const colTasks = initialTasks.filter(t => t.status === col.id);
          return <KanbanColumn key={col.id} column={col} tasks={colTasks} onEditTask={onEditTask} onViewBrief={onViewBrief} userRole={userRole} />;
        })}
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const overIndex = prev.findIndex(t => t.id === overId);
        
        if (prev[activeIndex].status !== prev[overIndex].status) {
          if (prev[overIndex].status === "SELESAI" && userRole !== "SUPERADMIN") {
            MySwal.fire({
              icon: "error",
              title: "Akses Ditolak",
              text: "Hanya Super Admin yang dapat memindahkan task ke kolom Selesai.",
              confirmButtonColor: "#3b82f6"
            });
            return prev;
          }
          const newTasks = [...prev];
          newTasks[activeIndex].status = prev[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        if (overId === "SELESAI" && userRole !== "SUPERADMIN") {
          MySwal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: "Hanya Super Admin yang dapat memindahkan task ke kolom Selesai.",
            confirmButtonColor: "#3b82f6"
          });
          return prev;
        }
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const newTasks = [...prev];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newTasks[activeIndex].status = overId as any;
        return arrayMove(newTasks, activeIndex, newTasks.length - 1);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { over } = event;
    if (!over) return;

    const updates = tasks.map((task, index) => ({
      id: task.id,
      status: task.status,
      order: index
    }));

    try {
      await updateTaskStatusAndOrder(updates);
    } catch (e) {
      console.error("Failed to update task", e);
      setTasks(initialTasks);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-6 h-full min-h-125">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return <KanbanColumn key={col.id} column={col} tasks={colTasks} onEditTask={onEditTask} onViewBrief={onViewBrief} userRole={userRole} />;
        })}
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
