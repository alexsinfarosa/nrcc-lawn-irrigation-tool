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
const amber500 = "#f59e0b";
const blue500 = "#3b82f6";
const emerald600 = "#059669";

export default function Graph({ data }: { data: any }) {
  const dataLength = data.length >= 30 ? 30 : data.length;

  return (
    <>
      <div className="mt-12 sm:flex sm:items-center">
        <h2 className="font-medium text-gray-900 sm:text-lg sm:leading-6">
          Water Deficit for the last {dataLength} days
        </h2>
      </div>
      <div className="mt-2 h-80 w-full bg-gray-50 sm:-mx-6 sm:mt-6 sm:shadow md:mx-0 md:rounded-lg">
        <ResponsiveContainer>
          <BarChart
            data={data.slice(-30)}
            margin={{
              top: 16,
              right: 16,
              left: -30,
              bottom: 16,
            }}
          >
            <XAxis
              stroke={gray300}
              dataKey="date"
              axisLine={true}
              tick={<CustomXLabel />}
            ></XAxis>
            <YAxis
              stroke={gray300}
              width={100}
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
              {data.slice(-30).map((entry: any, index: number) => {
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.watered
                        ? emerald600
                        : entry.amount < 0
                        ? amber500
                        : blue500
                    }
                  ></Cell>
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-center space-x-2">
        <span className="bg-blue-500 p-1 text-xs font-medium text-white sm:px-2 sm:text-sm">
          Wet
        </span>
        <span className="bg-amber-500 p-1 text-xs font-medium text-white sm:px-2 sm:text-sm">
          Dry
        </span>
        <span className="bg-emerald-600 p-1 text-xs font-medium text-white sm:px-2 sm:text-sm">
          Watered
        </span>
      </div>
    </>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { date, amount, watered } = payload[0].payload;
    return (
      <div className="relative inline-block max-w-xs transform space-y-2 overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
        <p className="text-sm text-gray-500">
          <span className="font-bold">Date: </span>
          {format(new Date(date), "MMM d")}
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
