import { getTasks, getTeamMembers } from "@/app/actions/task-actions";
import { getOpsTaskCategories } from "@/app/actions/task-category-actions";
import { TaskPageClient } from "./TaskPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role || "EDITOR";
  let teamContext: "KONTEN" | "FUNDRAISING" | undefined;
  if (userRole === "EDITOR") teamContext = "KONTEN";
  else if (userRole === "KEUANGAN") teamContext = "FUNDRAISING";

  const initialTasks = await getTasks(teamContext);
  const members = await getTeamMembers();
  const categories = await getOpsTaskCategories();

  return <TaskPageClient initialTasks={initialTasks} members={members} userRole={userRole} categories={categories} />;
}
