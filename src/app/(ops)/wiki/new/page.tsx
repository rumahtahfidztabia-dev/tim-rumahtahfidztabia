import { getWikiTree } from "@/app/actions/wiki-actions";
import { WikiEditor } from "@/components/wiki/WikiEditor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

// Re-use buildTree to pass flattened options
function buildTree(pages: any[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];
  pages.forEach(p => map.set(p.id, { ...p, children: [] }));
  pages.forEach(p => {
    if (p.parentId && map.has(p.parentId)) map.get(p.parentId)!.children.push(map.get(p.id)!);
    else roots.push(map.get(p.id)!);
  });
  return roots;
}

export default async function WikiNewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();
  
  const pages = await getWikiTree();
  const tree = buildTree(pages);

  return <WikiEditor tree={tree} />;
}
