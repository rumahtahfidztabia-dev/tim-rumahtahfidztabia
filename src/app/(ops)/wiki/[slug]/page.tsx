import { getWikiPage } from "@/app/actions/wiki-actions";
import { WikiViewer } from "@/components/wiki/WikiViewer";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WikiViewPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();
  
  const resolvedParams = await params;
  const user = session.user as { role: string };
  const page = await getWikiPage(resolvedParams.slug);
  
  if (!page) {
    return notFound();
  }

  return (
    <WikiViewer page={page} userRole={user.role} />
  );
}
