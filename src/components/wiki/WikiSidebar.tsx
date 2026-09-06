"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, FileText, Folder } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export type WikiNode = {
  id: string;
  slug: string;
  title: string;
  parentId: string | null;
  children: WikiNode[];
};

function WikiTreeItem({ node, level = 0 }: { node: WikiNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const isActive = pathname === `/wiki/${node.slug}`;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={clsx(
          "flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-slate-100 transition-colors group cursor-pointer",
          isActive && "bg-blue-50 text-blue-700 font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="w-4.5" /> // spacer
        )}
        
        <Link href={`/wiki/${node.slug}`} className="flex-1 flex items-center gap-2 truncate">
          {hasChildren ? (
             <Folder className={clsx("w-4 h-4", isActive ? "text-blue-500" : "text-slate-400")} />
          ) : (
             <FileText className={clsx("w-4 h-4", isActive ? "text-blue-500" : "text-slate-400")} />
          )}
          <span className={clsx("text-sm truncate", !isActive && "text-slate-700")}>{node.title}</span>
        </Link>
      </div>
      
      {hasChildren && isOpen && (
        <div>
          {node.children.map(child => (
            <WikiTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function WikiSidebar({ tree }: { tree: WikiNode[] }) {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto p-4 hidden md:flex flex-col shrink-0">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="font-bold text-slate-800">Dokumen</h2>
      </div>
      
      {tree.length === 0 ? (
        <div className="text-sm text-slate-500 italic text-center py-4">Belum ada halaman.</div>
      ) : (
        <div className="space-y-0.5">
          {tree.map(node => (
            <WikiTreeItem key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
