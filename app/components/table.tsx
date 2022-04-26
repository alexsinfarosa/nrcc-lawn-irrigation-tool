import { Switch } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import format from "date-fns/format";
import isFuture from "date-fns/isFuture";
import isToday from "date-fns/isToday";
import { useState } from "react";
import type { WaterDeficit } from "~/types";
import WeatherIcon from "./weatherIcon";

export default function Table({
  data,
  today,
  sprWater,
  year,
  waterOrdinance,
  forecastData,
}: {
  data: WaterDeficit[];
  today: WaterDeficit | undefined;
  sprWater: number;
  year: string;
  waterOrdinance: string | null;
  forecastData: any;
}) {
  const isThisYear = new Date().getFullYear().toString() === year;
  const isTodayOdd = new Date().getDate() % 2 === 1;
  const isTodayEven = new Date().getDate() % 2 === 0;
  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {(isTodayOdd && waterOrdinance === "odd") ||
          (isTodayEven && waterOrdinance === "even") ? (
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              Today is Not Allowed To Water - (water ordinance)
            </h2>
          ) : (
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              Today's Recommendation:{" "}
              {today && today.shouldWater ? (
                <span className="inline-flex animate-pulse items-center rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-800">
                  Water
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md bg-amber-100 px-3 py-1 font-medium text-amber-800">
                  Don't water
                </span>
              )}
            </h2>
          )}
        </div>
      </div>
      <div className="-mx-4 mt-8 max-h-[36rem] overflow-hidden overflow-y-auto shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        <table className="max-h-[36rem] min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="sticky top-0 bg-gray-100 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6"
              >
                Date
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-gray-100 bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
              >
                Recommendation
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-gray-100 bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
              >
                Did You Watered?
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 overflow-y-scroll bg-white">
            {data.map((day, i: number) => (
              <Row
                key={day.date}
                index={i}
                day={day}
                waterOrdinance={waterOrdinance}
                isThisYear={isThisYear}
                sprWater={sprWater}
                forecastData={forecastData}
              ></Row>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  day,
  index,
  waterOrdinance,
  isThisYear,
  sprWater,
  forecastData,
}: {
  day: WaterDeficit;
  index: number;
  waterOrdinance: string | null;
  isThisYear: boolean;
  sprWater: number;
  forecastData: any;
}): JSX.Element {
  const streetNumber = Number(day.date.split("-")[2]);
  const isDayOdd = streetNumber % 2 === 1;
  const isDayEven = !isDayOdd;

  let disabled = false;
  if (waterOrdinance === "odd" && isDayOdd) {
    disabled = true;
  }
  if (waterOrdinance === "even" && isDayEven) {
    disabled = true;
  }
  console.log(forecastData);

  return (
    <tr key={day.date} className={index % 2 === 0 ? undefined : "bg-gray-50"}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
        {isToday(new Date(day.date)) ? (
          <span className=" text-base font-bold">Today</span>
        ) : (
          format(new Date(day.date), "MMM d")
        )}

        {isFuture(new Date(day.date)) && (
          <span className="block text-xs font-normal text-gray-500">
            Forecast
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
        {day.shouldWater ? (
          <span className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-800">
            Water
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-amber-100 px-3 py-1 font-medium text-amber-800">
            Don't water
          </span>
        )}
      </td>

      <td
        className={
          "whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500"
        }
      >
        {isThisYear && index < 2 && (
          <span className="inline-flex flex-col items-center px-2 text-sm">
            <WeatherIcon weather={forecastData[index].weather}></WeatherIcon>

            {forecastData[index].weather.includes("rain") && (
              <span className="text-xs text-gray-700">
                {Math.max(...forecastData[index].pop12)}%
              </span>
            )}
          </span>
        )}

        {index >= 2 && (
          <>
            {disabled ? (
              <span className="inline-flex px-3 py-1.5 text-xs font-semibold">
                Water
                <br />
                Ordinance
              </span>
            ) : (
              <Toggle
                watered={day.watered}
                date={day.date}
                sprWater={sprWater}
              ></Toggle>
            )}
          </>
        )}
      </td>
    </tr>
  );
}

function Toggle({
  watered,
  date,
  sprWater,
}: {
  watered: boolean;
  date: string;
  sprWater: number;
}) {
  const fetcher = useFetcher();
  const [enabled, setEnabled] = useState(watered);

  function handleChange(e: any) {
    setEnabled(e);
    fetcher.submit(
      { _action: "water", date, sprWater: sprWater.toString() },
      { method: "post" }
    );
  }

  return (
    <Switch
      checked={enabled}
      onChange={handleChange}
      className={clsx(
        enabled ? "bg-emerald-600" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      )}
    >
      <span className="sr-only">User has Watered</span>
      <span
        className={clsx(
          enabled ? "translate-x-5" : "translate-x-0",
          "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        )}
      >
        <span
          className={clsx(
            enabled
              ? "opacity-0 duration-100 ease-out"
              : "opacity-100 duration-200 ease-in",
            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-gray-400"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={clsx(
            enabled
              ? "opacity-100 duration-200 ease-in"
              : "opacity-0 duration-100 ease-out",
            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-emerald-600"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  );
}
