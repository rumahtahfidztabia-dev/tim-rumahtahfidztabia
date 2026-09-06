"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { addCustomTableRow, updateCustomTableRow, deleteCustomTableRow } from "@/app/actions/custom-table-actions";
import { useRouter } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";

interface TableData {
  id: string;
  fields: { id: string; name: string; type: string; options?: Prisma.JsonValue }[];
  rows: { id: string; data: Prisma.JsonValue }[];
}

export function DynamicTableGrid({ tableData }: { tableData: TableData }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const fields = tableData.fields;
  const rows = tableData.rows;

  const handleEditClick = (row: { id: string; data: Prisma.JsonValue }) => {
    setIsEditing(row.id);
    setEditFormData((row.data as Record<string, unknown>) || {});
  };

  const handleAddClick = () => {
    setIsEditing("NEW");
    setEditFormData({});
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditFormData({});
  };

  const handleChange = (fieldId: string, value: string | number) => {
    setEditFormData({ ...editFormData, [fieldId]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing === "NEW") {
        await addCustomTableRow(tableData.id, editFormData as Prisma.InputJsonObject);
      } else if (isEditing) {
        await updateCustomTableRow(isEditing, tableData.id, editFormData as Prisma.InputJsonObject);
      }
      setIsEditing(null);
      setEditFormData({});
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowId: string) => {
    if (!confirm("Yakin ingin menghapus baris ini?")) return;
    try {
      await deleteCustomTableRow(rowId, tableData.id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const renderCellInput = (field: { id: string; type: string; options?: Prisma.JsonValue }) => {
    const val = (editFormData[field.id] as string | number) || "";
    switch (field.type) {
      case "NUMBER":
        return (
          <input
            type="number"
            value={val}
            onChange={(e) => handleChange(field.id, Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border rounded bg-white text-slate-900"
          />
        );
      case "DATE":
        return (
          <input
            type="date"
            value={val}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded bg-white text-slate-900"
          />
        );
      case "SELECT":
        const options = field.options && typeof field.options === "string" ? JSON.parse(field.options) : [];
        return (
          <select
            value={val}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded bg-white text-slate-900"
          >
            <option value="">- Pilih -</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded bg-white text-slate-900"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-slate-50">
        <h3 className="font-semibold text-slate-800">Data Tabel</h3>
        <button 
          onClick={handleAddClick}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded"
        >
          <Plus className="w-4 h-4 mr-1" /> Tambah Baris
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-150">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wider">
              {fields.map((f) => (
                <th key={f.id} className="p-3 font-medium border-r last:border-r-0">{f.name}</th>
              ))}
              <th className="p-3 font-medium w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {isEditing === "NEW" && (
              <tr className="bg-blue-50/30">
                {fields.map((f) => (
                  <td key={f.id} className="p-2 border-r last:border-r-0">
                    {renderCellInput(f)}
                  </td>
                ))}
                <td className="p-2 text-center whitespace-nowrap">
                  <button onClick={handleSave} disabled={loading} className="text-green-600 hover:text-green-700 p-1">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1 ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 group">
                {isEditing === row.id ? (
                  // Edit Mode
                  <>
                    {fields.map((f) => (
                      <td key={f.id} className="p-2 border-r last:border-r-0">
                        {renderCellInput(f)}
                      </td>
                    ))}
                    <td className="p-2 text-center whitespace-nowrap">
                      <button onClick={handleSave} disabled={loading} className="text-green-600 hover:text-green-700 p-1">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1 ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  // View Mode
                  <>
                    {fields.map((f) => {
                      const rowDataObj = row.data as Record<string, unknown>;
                      const val = rowDataObj?.[f.id] as string | undefined;
                      return (
                        <td key={f.id} className="p-3 border-r last:border-r-0 text-slate-700 truncate max-w-50" title={val}>
                          {val || "-"}
                        </td>
                      );
                    })}
                    <td className="p-2 text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(row)} className="text-blue-600 hover:text-blue-700 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-600 p-1 ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {rows.length === 0 && isEditing !== "NEW" && (
              <tr>
                <td colSpan={fields.length + 1} className="p-8 text-center text-slate-500 italic">
                  Belum ada data. Klik &quot;Tambah Baris&quot; untuk mulai mengisi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
