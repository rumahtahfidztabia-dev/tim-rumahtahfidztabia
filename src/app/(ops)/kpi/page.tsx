import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { KpiPageClient } from "./KpiPageClient";
import { getMonthlyKpiData, getPersonalMonthlyKpi } from "@/app/actions/kpi-actions";

export default async function KpiPage() {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const userRole = user?.role || "EDITOR";
  const userName = user?.name || "Pengguna";

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const data = userRole === "SUPERADMIN"
    ? await getMonthlyKpiData(currentMonth)
    : await getPersonalMonthlyKpi(currentMonth);

  return (
    <KpiPageClient
      userRole={userRole}
      userName={userName}
      initialData={data}
      initialMonth={currentMonth}
    />
  );
}
