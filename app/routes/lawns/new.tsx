import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import * as React from "react";

import { createLawn } from "~/models/lawn.server";
import { requireUserId } from "~/session.server";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import SelectSprinkler from "~/components/select-sprinkler";
import { isInBBOX, placeIdToLatLon } from "~/utils";
import { calculateWaterAmount } from "~/utils";
import { createIrrigation } from "~/models/irrigation.server";

export const meta: MetaFunction = () => {
  return {
    title: "New Lawn",
    description: "Create a new lawn",
  };
};

type ActionData = {
  errors?: {
    name?: string;
    placeId?: string;
    duration?: string;
    rate?: string;
  };
};

export const loader: LoaderFunction = async () => {
  return json({
    GOOGLEPLACES_API: process.env.GOOGLEPLACES_API,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const name = formData.get("name");
  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  const placeId = formData.get("placeId");
  if (typeof placeId !== "string" || placeId.length === 0) {
    return json<ActionData>(
      { errors: { placeId: "Address is required" } },
      { status: 400 }
    );
  }

  const waterOrdinance = formData.get("waterOrdinance");

  const location = await placeIdToLatLon(placeId);
  if (!location) {
    throw new Response("Not Found", { status: 404 });
  }

  const isValidLocation = isInBBOX(location.lat, location.lng);
  if (!isValidLocation) {
    return json<ActionData>(
      { errors: { placeId: "Data is not available at this location" } },
      { status: 400 }
    );
  }

  const irrigationDate = formData.get("irrigationDate");

  let year: string = "";
  if (typeof irrigationDate === "string") {
    if (irrigationDate.length === 0) {
      year = new Date().getFullYear().toString();
    } else {
      year = irrigationDate.slice(0, 4);
    }
  }

  const data = Object.fromEntries(formData.entries());
  if (!data) {
    throw new Response("Not Found", { status: 404 });
  }

  const duration = Number(data.sprDuration);
  const rate = Number(data.sprRate);
  const distributionUniformity = Number(data.sprDistributionUniformity);
  const sprayEfficiencyFactor = Number(data.sprSprayEfficiencyFactor);

  const sprWater = calculateWaterAmount(
    duration,
    rate,
    distributionUniformity,
    sprayEfficiencyFactor
  );

  const lawn = await createLawn({
    name,
    waterOrdinance: JSON.parse(JSON.stringify(waterOrdinance)),
    placeId,
    address: location.address,
    lat: location.lat,
    lng: location.lng,
    year,
    sprName: data.sprName.toString(),
    sprDuration: +data.sprDuration,
    sprRate: +data.sprRate,
    sprDistributionUniformity: +data.sprDistributionUniformity,
    sprSprayEfficiencyFactor: +data.sprSprayEfficiencyFactor,
    sprWater,
    userId,
  });

  if (irrigationDate) {
    await createIrrigation({
      lawnId: lawn.id,
      date: irrigationDate.toString(),
      water: sprWater,
    });
  }

  return redirect(`/lawns/${lawn.id}`);
};

export default function NewFieldPage() {
  const { GOOGLEPLACES_API } = useLoaderData();
  const actionData = useActionData() as ActionData;

  const nameRef = React.useRef<HTMLInputElement>(null);
  const placeIdRef = React.useRef<HTMLInputElement>(null);
  const sprinklerDurationRef = React.useRef<HTMLInputElement>(null);
  const sprinklerRateRef = React.useRef<HTMLInputElement>(null);

  const transition = useTransition();
  const isSaving = transition.submission;

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.placeId) {
      placeIdRef.current?.focus();
    } else if (actionData?.errors?.duration) {
      sprinklerDurationRef.current?.focus();
    } else if (actionData?.errors?.rate) {
      sprinklerRateRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <div className="py-10 px-4 sm:mx-auto sm:max-w-xl sm:py-0 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create New Lawn
        </h1>
      </div>

      <Form
        method="post"
        className="mt-5 w-full space-y-8 px-4 sm:mx-auto sm:max-w-xl sm:px-6 md:px-8"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name:
          </label>
          <div className="mt-1">
            <input
              ref={nameRef}
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Lawn name"
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }
            />
            {actionData?.errors?.name && (
              <div
                className="mt-2 text-sm text-red-600"
                id="irrigation-date-error"
              >
                {actionData.errors.name}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Water Ordinance: (optional)
          </label>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            My property is subject to an odd/even water ordinance.
          </p>
          <fieldset className="mt-4">
            <legend className="sr-only">Water Ordinance</legend>
            <div className="flex items-center space-x-10">
              {[
                { id: "odd", streetNumber: "Odd" },
                { id: "even", streetNumber: "Even" },
              ].map((waterOrdinance) => (
                <div key={waterOrdinance.id} className="mt-1 flex items-center">
                  <input
                    id={waterOrdinance.id}
                    name="waterOrdinance"
                    type="radio"
                    value={waterOrdinance.id}
                    // defaultChecked={waterOrdinance.id === "odd"}
                    className="h-6 w-6 border-gray-300 text-blue-600 focus:ring-blue-500 sm:h-5 sm:w-5"
                    aria-describedby="water-ordinance-description"
                  />
                  <label
                    htmlFor={waterOrdinance.id}
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    {waterOrdinance.streetNumber}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <div>
          <label
            htmlFor="placeId"
            className="block text-sm font-medium text-gray-700"
          >
            Address:
          </label>
          <div className="mt-1">
            <GooglePlacesAutocomplete
              apiKey={GOOGLEPLACES_API}
              selectProps={{
                name: "placeId",
                id: "place-id",
                ref: placeIdRef,
                placeholder: "Search...",
                className:
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                styles: {
                  control: (provided: any) => ({
                    ...provided,
                    borderRadius: "6px",
                  }),
                  placeholder: (provided: any) => ({
                    ...provided,
                    color: "#6b7280", // text-gray-500
                  }),
                  dropdownIndicator: (provided: any) => ({
                    ...provided,
                    color: "#d1d5db", // text-gray-300
                  }),
                },
              }}
              autocompletionRequest={{
                bounds: [
                  { lat: 37.166667, lng: -82.70833 },
                  { lat: 47.625, lng: -66.875 },
                ],
                componentRestrictions: {
                  country: ["us"],
                },
              }}
              minLengthAutocomplete={3}
              aria-invalid={actionData?.errors?.placeId ? true : undefined}
              aria-errormessage={
                actionData?.errors?.placeId ? "place-id-error" : undefined
              }
            />

            {actionData?.errors?.placeId && (
              <div className="mt-2 text-sm text-red-600" id="place-id-error">
                {actionData.errors.placeId}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="irrigation-date"
            className="block text-sm font-medium text-gray-700"
          >
            Last Irrigation: (optional)
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="irrigationDate"
              id="irrigation-date"
              min={`${new Date().getFullYear()}-03-01`}
              max={new Date().toISOString().split("T")[0]}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700">
            Sprinkler Type:
            <p className="mt-1 text-sm leading-5 text-gray-500">
              If you have different types of sprinkler heads, choose the most
              common type for your lawn or a custom type.
            </p>
          </span>
          <SelectSprinkler
            sprinklerDurationRef={sprinklerDurationRef}
            duration={actionData?.errors?.duration}
            sprinklerRateRef={sprinklerRateRef}
            rate={actionData?.errors?.rate}
          ></SelectSprinkler>
        </div>

        <p className="mt-1 text-center text-sm leading-5 text-gray-500">
          This tool will work with multiple zones if sprinkler heads are similar
          throughout your yard. If you have different sprinker types, you can
          set up multiple lawns (i.e. zones).
        </p>

        <div className="">
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mx-auto sm:w-1/2"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </>
  );
}
