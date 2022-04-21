import { Form } from "@remix-run/react";
import clsx from "clsx";
import type { WaterDeficit } from "~/types";

export default function Table({
  data,
  today,
  sprWater,
  year,
  waterOrdinance,
}: {
  data: WaterDeficit[];
  today: WaterDeficit | undefined;
  sprWater: number;
  year: string;
  waterOrdinance: string | null;
}) {
  const isThisYear = new Date().getFullYear().toString() === year;

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            Recommendation for Today:{" "}
            {today && today.shouldWater ? (
              <span className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-800">
                Water
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-1 font-medium text-yellow-800">
                Don't water
              </span>
            )}
          </h2>
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
                Did You Water?
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 overflow-y-scroll bg-white">
            {data.map((day, i: number) => {
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

              return (
                <tr
                  key={day.date}
                  className={i % 2 === 0 ? undefined : "bg-gray-50"}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {day.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                    {day.shouldWater ? "water" : "Don't water"}
                  </td>

                  <td
                    className={
                      "whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500"
                    }
                  >
                    {isThisYear && i < 2 && (
                      <span className="inline-flex items-center px-3 py-2 text-sm">
                        72%
                      </span>
                    )}

                    {i >= 2 && (
                      <Form method="post">
                        <input type="hidden" name="date" value={day.date} />
                        <input type="hidden" name="sprWater" value={sprWater} />
                        {disabled ? (
                          <span className="inline-flex px-3 py-1.5 text-sm font-medium">
                            {" "}
                            -{" "}
                          </span>
                        ) : (
                          <button
                            type="submit"
                            name="_action"
                            value="water"
                            className={clsx(
                              day.watered
                                ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                                : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
                              "inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm  focus:outline-none focus:ring-2 focus:ring-offset-2"
                            )}
                            disabled={!isThisYear}
                          >
                            {day.watered ? "Yes" : "No"}
                            <span className="sr-only">, {day.date}</span>
                          </button>
                        )}
                      </Form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
