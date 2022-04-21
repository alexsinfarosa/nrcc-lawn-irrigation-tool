import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import clsx from "clsx";

// images url
import fixedSpray from "../images/fixed-spray.png";
import kcRotor from "../images/kc-rotor.png";
import rotaryNozzle from "../images/rotary-nozzle.png";
import manualNozzle from "../images/manual-nozzle.png";

const SPRINKLER_LIST = [
  {
    id: "0",
    name: "Custom Nozzle",
    imgUrl: "",
    rate: 1, // in/hr
    duration: 1, // min
    distributionUniformity: 1,
    sprayEfficiencyFactor: 1,
  },
  {
    id: "1",
    name: "Fixed Spray Nozzle",
    imgUrl: fixedSpray,
    rate: 1.5, // in/hr
    duration: 19, // min
    distributionUniformity: 0.7,
    sprayEfficiencyFactor: 0.75,
  },
  {
    id: "2",
    name: "Rotor Nozzle",
    imgUrl: kcRotor,
    rate: 0.75,
    duration: 28,
    distributionUniformity: 0.8,
    sprayEfficiencyFactor: 0.95,
  },
  {
    id: "3",
    name: "Manual Nozzle",
    imgUrl: manualNozzle,
    rate: 1,
    duration: 24,
    distributionUniformity: 0.75,
    sprayEfficiencyFactor: 0.86,
  },
  {
    id: "4",
    name: "Hi Efficiency Nozzle",
    imgUrl: rotaryNozzle,
    rate: 0.5,
    duration: 40,
    distributionUniformity: 0.8,
    sprayEfficiencyFactor: 1,
  },
];

export default function SelectSprinkler({
  duration,
  rate,
  sprinklerDurationRef,
  sprinklerRateRef,
}: {
  duration: string | undefined;
  rate: string | undefined;
  sprinklerDurationRef: React.RefObject<HTMLInputElement>;
  sprinklerRateRef: React.RefObject<HTMLInputElement>;
}) {
  const [val, setVal] = useState(SPRINKLER_LIST[1]);

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setVal({ ...val, [name]: +value });
  }

  return (
    <div>
      <input type="hidden" name="sprId" value={val.id} />
      <input type="hidden" name="sprName" value={val.name} />
      <input type="hidden" name="sprDuration" value={val.duration} />
      <input type="hidden" name="sprRate" value={val.rate} />
      <input
        type="hidden"
        name="sprDistributionUniformity"
        value={val.distributionUniformity}
      />
      <input
        type="hidden"
        name="sprSprayEfficiencyFactor"
        value={val.sprayEfficiencyFactor}
      />
      <Listbox value={val} onChange={setVal}>
        {({ open }) => (
          <>
            {/* <Listbox.Label className="block text-sm font-medium text-gray-700">
              Sprinkler Type:
              <div className="font-light text-gray-500 ">
                if you have different types of sprinkler heads, choose the most
                common type for your lawn
              </div>
            </Listbox.Label> */}
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                <span className="flex items-center">
                  {val?.name === "Custom Nozzle" ? (
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                      <span className="text-3xl font-medium leading-none text-white">
                        C
                      </span>
                    </span>
                  ) : (
                    <img
                      src={val.imgUrl}
                      alt={val.name}
                      className="h-16 w-16 flex-shrink-0 rounded-full"
                    />
                  )}
                  <div>
                    <span className="ml-3 block truncate">
                      Type: {val.name}
                    </span>
                    {val?.name !== "Custom Nozzle" && (
                      <span className="ml-3 block truncate">
                        Duration: {val.duration} (min)
                      </span>
                    )}
                    {val?.name !== "Custom Nozzle" && (
                      <span className="ml-3 block truncate">
                        Rate: {val.rate} (in/hr)
                      </span>
                    )}
                  </div>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <SelectorIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {SPRINKLER_LIST.map((sprinkler) => (
                    <Listbox.Option
                      key={sprinkler.name}
                      className={({ active }) =>
                        clsx(
                          active ? "bg-blue-600 text-white" : "text-gray-900",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      refName="sprinker-type"
                      value={sprinkler}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            {sprinkler.name === "Custom Nozzle" ? (
                              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-400">
                                <span className="text-3xl font-medium leading-none text-white">
                                  C
                                </span>
                              </span>
                            ) : (
                              <img
                                src={sprinkler.imgUrl}
                                alt={sprinkler.name}
                                className="h-16 w-16 flex-shrink-0 rounded-full"
                              />
                            )}
                            <div>
                              <span
                                className={clsx(
                                  selected ? "font-semibold" : "font-normal",
                                  "ml-3 block truncate"
                                )}
                              >
                                Type: {sprinkler.name}
                              </span>
                              {sprinkler?.name !== "Custom Nozzle" && (
                                <span
                                  className={clsx(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  Duration: {sprinkler.duration} (min)
                                </span>
                              )}
                              {sprinkler?.name !== "Custom Nozzle" && (
                                <span
                                  className={clsx(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  Rate: {sprinkler.rate} (in/hr)
                                </span>
                              )}
                            </div>
                          </div>

                          {selected ? (
                            <span
                              className={clsx(
                                active ? "text-white" : "text-blue-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>

      {val?.name === "Custom Nozzle" && (
        <fieldset className="mt-11 block rounded-md border bg-gray-50 px-4 py-6">
          <legend className="sr-only">Custom Nozzle</legend>
          <div className="w-full space-y-4 sm:mx-auto sm:max-w-xs">
            <div className="text-center text-sm text-gray-500">
              Customize Application Duration and Rate
            </div>

            <div className="">
              <label
                htmlFor="custom-sprinkler-duration"
                className="block text-left text-sm font-medium text-gray-700"
              >
                Duration:{" "}
                <span className="text-xs text-gray-500">(0-90 min)</span>
              </label>
              <div className="mt-1">
                <input
                  ref={sprinklerDurationRef}
                  type="number"
                  step="any"
                  min={0}
                  max={90}
                  name="duration"
                  onChange={handleOnChange}
                  id="sprinklerDuration"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  aria-invalid={duration ? true : undefined}
                  aria-errormessage={
                    duration ? "sprinkler-duration-error" : undefined
                  }
                />

                {duration && (
                  <div
                    className="mt-2 text-sm text-red-600"
                    id="sprinkler-duration-error"
                  >
                    {duration}
                  </div>
                )}
              </div>
            </div>

            <div className="">
              <label
                htmlFor="sprinklerRate"
                className="block text-sm font-medium text-gray-700 sm:mt-0"
              >
                Rate:{" "}
                <span className="text-xs text-gray-500">(0-2.0 in/hr)</span>
              </label>
              <div className="mt-1">
                <input
                  ref={sprinklerRateRef}
                  type="number"
                  step="any"
                  min={0}
                  max={2.0}
                  name="rate"
                  onChange={handleOnChange}
                  id="custom-sprinkler-rate"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  aria-invalid={rate ? true : undefined}
                  aria-errormessage={rate ? "sprinkler-rate-error" : undefined}
                />

                {rate && (
                  <div
                    className="mt-2 text-sm text-red-600"
                    id="sprinkler-rate-error"
                  >
                    {rate}
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
}
