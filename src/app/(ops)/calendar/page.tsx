import { getCalendarTasks } from "@/app/actions/calendar-actions";
import { getTeamMembers } from "@/app/actions/task-actions";
import { getOpsTaskCategories } from "@/app/actions/task-category-actions";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";
import dayjs from "dayjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Kalender Konten | Tabia Team",
  description: "Kalender penjadwalan konten dan task Rumah Tahfidz Tabia",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const userRole = user?.role || "EDITOR";

  const resolvedSearchParams = await searchParams;
  const currentMonth = resolvedSearchParams.month || dayjs().format('YYYY-MM');
  
  // Calculate start and end date of the view
  // We need to fetch items from the start of the first week to the end of the last week of the month
  const startOfMonth = dayjs(currentMonth + "-01").startOf('month');
  const endOfMonth = dayjs(currentMonth + "-01").endOf('month');
  
  const startDate = startOfMonth.startOf('week').toDate();
  const endDate = endOfMonth.endOf('week').toDate();

  const [tasks, members, categories] = await Promise.all([
    getCalendarTasks(startDate, endDate),
    getTeamMembers(),
    getOpsTaskCategories()
  ]);

  return (
    <CalendarPageClient 
      initialTasks={tasks} 
      members={members} 
      categories={categories}
      currentMonthParam={currentMonth}
      userRole={userRole}
    />
  );
}
