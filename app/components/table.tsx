import { useFetcher } from "@remix-run/react";
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
            {data.map((day, i: number) => (
              <Row
                key={day.date}
                index={i}
                day={day}
                waterOrdinance={waterOrdinance}
                isThisYear={isThisYear}
                sprWater={sprWater}
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
}: {
  day: WaterDeficit;
  index: number;
  waterOrdinance: string | null;
  isThisYear: boolean;
  sprWater: number;
}): JSX.Element {
  const fetcher = useFetcher();
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

  let isWatering = fetcher.submission?.formData.get("date") === day.date;

  return (
    <tr key={day.date} className={index % 2 === 0 ? undefined : "bg-gray-50"}>
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
        {isThisYear && index < 2 && (
          <span className="inline-flex items-center px-3 py-2 text-sm">
            72%
          </span>
        )}

        {index >= 2 && (
          <fetcher.Form method="post">
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
                  "inline-flex w-12 items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4 text-white  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                )}
                aria-label="Water"
                disabled={!isThisYear}
              >
                {isWatering ? (
                  <svg
                    role="status"
                    className="h-4 w-4 animate-spin fill-blue-600 text-white"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    ></path>
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    ></path>
                  </svg>
                ) : day.watered ? (
                  "Yes"
                ) : (
                  "No"
                )}
                <span className="sr-only">, {day.date}</span>
              </button>
            )}
          </fetcher.Form>
        )}
      </td>
    </tr>
  );
}
