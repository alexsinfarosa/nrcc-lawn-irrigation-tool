import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Graph({ data }: { data: any }) {
  console.log(data);
  return (
    <div className="-mx-4 mt-12 h-96 w-full bg-white sm:-mx-6 sm:shadow md:mx-0 md:rounded-lg">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 20,
          }}
        >
          {/* <XAxis dataKey="date" /> */}
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Bar dataKey="amount">
            {data.map((day: any) => {
              return (
                <Cell
                  key={day.date}
                  fill={day.amount < 0 ? "#f59e0b" : "#0284c7"}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { date, amount, watered } = payload[0].payload;
    return (
      <div className="relative inline-block max-w-xs transform space-y-2 overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
        <p className="text-sm text-gray-500">
          <span className="font-bold">Date: </span>
          {date}
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-bold">Deficit: </span>
          {amount.toFixed(2)} in
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-bold">Did You Water?: </span>
          {watered ? "Yes" : "No"}
        </p>
      </div>
    );
  }
  return null;
}
