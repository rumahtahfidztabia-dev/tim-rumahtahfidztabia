"use client";

import { useState, useTransition } from "react";
import { AdminKpiView } from "@/components/kpi/AdminKpiView";
import { UserKpiView } from "@/components/kpi/UserKpiView";
import { getMonthlyKpiData, getPersonalMonthlyKpi } from "@/app/actions/kpi-actions";

type Props = {
  userRole: string;
  userName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
  initialMonth: string;
};

export function KpiPageClient({ userRole, userName, initialData, initialMonth }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (newMonth: string) => {
    startTransition(async () => {
      if (userRole === "SUPERADMIN") {
        const fresh = await getMonthlyKpiData(newMonth);
        setData(fresh);
      } else {
        const fresh = await getPersonalMonthlyKpi(newMonth);
        setData(fresh);
      }
    });
  };

  return (
    <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
      {userRole === "SUPERADMIN" ? (
        <AdminKpiView data={data} onMonthChange={handleMonthChange} />
      ) : (
        <UserKpiView data={data} userName={userName} onMonthChange={handleMonthChange} />
      )}
    </div>
  );
}
