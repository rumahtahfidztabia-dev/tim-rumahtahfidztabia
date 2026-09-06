import { getWikiTree } from "@/app/actions/wiki-actions";
import { WikiSidebar, WikiNode } from "@/components/wiki/WikiSidebar";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function buildTree(pages: any[]): WikiNode[] {
  const map = new Map<string, WikiNode>();
  const roots: WikiNode[] = [];

  pages.forEach(p => {
    map.set(p.id, { ...p, children: [] });
  });

  pages.forEach(p => {
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(map.get(p.id)!);
    } else {
      roots.push(map.get(p.id)!);
    }
  });

  return roots;
}

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  
  const pages = await getWikiTree();
  const tree = buildTree(pages);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 sm:-m-8">
      {/* Header Mobile / Desktop Top */}
      <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-white shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wiki / Dokumen Internal</h1>
        
        {user?.role === "SUPERADMIN" && (
          <Link href="/wiki/new" className="flex items-center bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-slate-900 text-sm font-medium">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">Buat Halaman Baru</span>
            <span className="inline sm:hidden">Baru</span>
          </Link>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden bg-slate-50">
        <WikiSidebar tree={tree} />
        
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
