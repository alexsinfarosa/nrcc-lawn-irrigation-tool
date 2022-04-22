import format from "date-fns/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

const gray300 = "#d1d5db";
const gray500 = "#6b7280";
// const gray800 = "#1f2937";

export default function Graph({ data }: { data: any }) {
  return (
    <div className="-mx-4 mt-12 h-80 w-full bg-white sm:-mx-6 sm:shadow md:mx-0 md:rounded-lg">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 16,
            right: 0,
            left: -30,
            bottom: 16,
          }}
        >
          <XAxis
            stroke={gray500}
            dataKey="date"
            axisLine={true}
            tick={<CustomXLabel />}
          ></XAxis>
          <YAxis
            stroke={gray500}
            width={110}
            dataKey="amount"
            tick={<CustomYLabel />}
            label={{
              value: "Water Deficit (in)",
              angle: -90,
              position: "center",
              offset: 0,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={gray300} />
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

function CustomXLabel({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        fontSize={11}
        textAnchor="middle"
        fill={gray500}
        transform="rotate(-25)"
      >
        {format(new Date(payload.value), "MMM d")}
      </text>
    </g>
  );
}

function CustomYLabel({ x, y, payload, unit }: any) {
  return (
    <g>
      <text
        x={x}
        y={y}
        dy={5}
        dx={-15}
        fontSize={11}
        textAnchor="middle"
        fill={gray500}
      >
        {payload.value}
        {unit}
      </text>
    </g>
  );
}
