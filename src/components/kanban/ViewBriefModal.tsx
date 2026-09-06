"use client";

import { X, Calendar, User, AlignLeft, HardDrive } from "lucide-react";
import { Task } from "@/generated/prisma/client";

interface ViewBriefModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewBriefModal({ task, isOpen, onClose }: ViewBriefModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 line-clamp-1 mr-4 flex items-center">
            <AlignLeft className="w-5 h-5 mr-2 text-blue-600" />
            Detail Task: {task.title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-800 p-1 bg-white rounded-full border border-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {task.status.replace("_", " ")}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kategori Tim</p>
              <p className="text-sm font-medium text-slate-800">{task.team}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Penanggung Jawab (PIC)</p>
              <div className="flex items-center text-sm font-medium text-slate-800">
                <User className="w-4 h-4 mr-1.5 text-slate-400" />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(task as any).assignedTo?.name || <span className="text-slate-400 italic">Belum di-assign</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tenggat Waktu</p>
              <div className="flex items-center text-sm font-medium text-slate-800">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-slate-400 italic">Tidak ada</span>}
              </div>
            </div>
            {task.driveLink && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Folder / File (Google Drive)</p>
                <a 
                  href={task.driveLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline w-fit"
                >
                  <HardDrive className="w-4 h-4 mr-1.5" />
                  Buka Tautan Drive
                </a>
              </div>
            )}
          </div>

          {/* Description Section */}
          {task.description && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">Deskripsi Singkat</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Brief Content Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">Dokumen Brief</h3>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(task as any).brief ? (
              <div 
                className="prose prose-sm sm:prose lg:prose-base max-w-none text-slate-800 prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-md mt-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100"
                dangerouslySetInnerHTML={{ 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  __html: (task as any).brief 
                }}
              />
            ) : (
              <div className="text-center text-slate-400 italic py-6 bg-slate-50/50 rounded-lg border border-slate-100 mt-4">
                Tidak ada dokumen brief terlampir untuk task ini.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t shrink-0 flex justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md bg-white border border-slate-300 shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
