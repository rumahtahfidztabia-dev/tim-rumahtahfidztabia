"use client";

import { useState, useRef } from "react";
import { X, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { bulkImportTasks } from "@/app/actions/task-actions";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export function ExcelImportModal({ isOpen, onClose, userRole }: ExcelImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Judul Task", "Deskripsi", "Tim", "Email Assignee", "Batas Waktu"],
      ["Desain Banner Ramadhan", "Ukuran 1080x1080px", "KONTEN", "editor@example.com", "2026-10-15"],
      ["Follow up Donatur VIP", "Telepon bapak Budi", "FUNDRAISING", "keuangan@example.com", "2026-10-16"],
    ]);
    
    // Add some column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 40 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Task");
    XLSX.writeFile(wb, "Template_Import_Task_Kanban.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      const tasksToImport = rawData.map((row) => ({
        title: row["Judul Task"] as string,
        description: (row["Deskripsi"] as string) || undefined,
        team: row["Tim"]?.toString().toUpperCase() as "KONTEN" | "FUNDRAISING",
        assigneeEmail: (row["Email Assignee"] as string) || undefined,
        dueDate: (row["Batas Waktu"] as string) || undefined,
      })).filter(t => t.title && (t.team === "KONTEN" || t.team === "FUNDRAISING"));

      if (tasksToImport.length === 0) {
        throw new Error("Tidak ada data valid yang ditemukan. Pastikan format sesuai template.");
      }
      
      // Filter based on role if needed. E.g., Editor can only upload KONTEN
      const filteredTasks = tasksToImport.filter(t => {
        if (userRole === "EDITOR" && t.team !== "KONTEN") return false;
        if (userRole === "KEUANGAN" && t.team !== "FUNDRAISING") return false;
        return true;
      });

      if (filteredTasks.length < tasksToImport.length) {
        const result = await MySwal.fire({
          title: "Beberapa Task Dihapus",
          text: `Anda hanya dapat mengimpor task untuk tim Anda. ${tasksToImport.length - filteredTasks.length} task dari tim lain akan diabaikan. Lanjutkan?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, Lanjutkan",
          cancelButtonText: "Batal"
        });
        if (!result.isConfirmed) {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      }

      const res = await bulkImportTasks(filteredTasks);
      
      MySwal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `${res.count} task berhasil diimpor.`,
        timer: 3000,
        showConfirmButton: false
      });
      
      onClose();
    } catch (error: unknown) {
      MySwal.fire({
        icon: "error",
        title: "Gagal Mengimpor",
        text: error instanceof Error ? error.message : "Terjadi kesalahan saat memproses file Excel.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
            Import Task Masal
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0 text-blue-600" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Cara Penggunaan:</p>
              <ol className="list-decimal pl-4 space-y-1 text-blue-700">
                <li>Unduh template Excel terlebih dahulu.</li>
                <li>Isi data task (Pastikan judul & tim terisi).</li>
                <li>Gunakan email staf yang valid untuk Assignee.</li>
                <li>Unggah kembali file tersebut ke sini.</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex-1 flex justify-center items-center px-4 py-3 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 mr-2 text-slate-500" />
              Unduh Template
            </button>
            
            <div className="flex-1 relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? "Memproses..." : "Pilih File Excel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
