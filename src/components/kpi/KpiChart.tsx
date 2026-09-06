"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface KpiChartProps {
  current: number;
  target: number;
}

export function KpiChart({ current, target }: KpiChartProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const isOver = current > target;
  const remaining = Math.max(target - current, 0);

  const data = [
    { name: "Selesai", value: isOver ? target : current },
    { name: "Sisa Target", value: remaining },
  ];

  // Colors: Green for progress, gray for remaining. If over target, we can use a vibrant color.
  const COLORS = ["#10b981", "#e2e8f0"];
  
  if (percentage < 50) {
    COLORS[0] = "#ef4444"; // Red if low
  } else if (percentage < 80) {
    COLORS[0] = "#eab308"; // Yellow if medium
  } else {
    COLORS[0] = "#22c55e"; // Green if good
  }

  return (
    <div className="relative h-40 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [value, ""]}
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-slate-800">{percentage}%</span>
        {isOver && <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Tercapai</span>}
      </div>
    </div>
  );
}
