import type { Irrigation, Lawn } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import Table from "~/components/table";

import { deleteLawn } from "~/models/lawn.server";
import { getLawn } from "~/models/lawn.server";
import { requireUserId } from "~/session.server";
import type { PETDATA } from "~/types";
import {
  getPET,
  runModel,
  getToday,
  useUser,
  getForecastData,
  transformForecast,
} from "~/utils";
import Header from "~/components/header";
import {
  createIrrigation,
  deleteIrrigation,
  findIrrigation,
  getIrrigations,
} from "~/models/irrigation.server";

import Graph from "~/components/graph";
import ForecastTable from "~/components/forecastTable";

type LoaderData = {
  lawn: Lawn;
  petData: PETDATA;
  irrigationDates: Irrigation[];
  forecast: any;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.lawnId, "lawnId not found");

  const lawn = await getLawn({ userId, id: params.lawnId });
  if (!lawn) {
    throw new Response("Not Found", { status: 404 });
  }

  const forecast = await getForecastData({
    lat: lawn.lat,
    lon: lawn.lng,
  });

  const irrigationDates = await getIrrigations({ lawnId: lawn.id });
  const petData: PETDATA = await getPET({
    year: lawn.year,
    lat: lawn.lat,
    lon: lawn.lng,
  });

  return json<LoaderData>({ lawn, petData, irrigationDates, forecast });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.lawnId, "lawnId not found");

  let formData = await request.formData();
  let { _action, ...value } = Object.fromEntries(formData);

  if (_action === "delete") {
    await deleteLawn({ userId, id: params.lawnId });
    return redirect("/lawns");
  }

  if (_action === "water") {
    try {
      const date = value.date.toString();
      const sprWater = value.sprWater;
      const found = await findIrrigation({ lawnId: params.lawnId, date });
      if (found) {
        await deleteIrrigation({ lawnId: params.lawnId, date: found.date });
      } else {
        await createIrrigation({
          lawnId: params.lawnId,
          date,
          water: +sprWater,
        });
      }
      return null;
    } catch (error) {
      return json({ error: true });
    }
  }
};

export default function LawnDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const { lawn, petData, irrigationDates, forecast } = data;
  const user = useUser();

  const forecastData = transformForecast(forecast);

  // TODO: check the namber below
  const NUMBER_TO_CHECK: number = 0.2; // was 1.6
  const threshold: number =
    -NUMBER_TO_CHECK * ((lawn.sprRate * lawn.sprDuration) / 60);

  const waterDeficit = runModel(
    petData,
    threshold,
    lawn.waterOrdinance,
    lawn.year,
    irrigationDates
  );

  const todayIdx = waterDeficit.findIndex((d) => d.date === getToday());

  let today;
  let slicedWaterDeficit;
  if (todayIdx > -1) {
    today = waterDeficit[todayIdx];
    slicedWaterDeficit = waterDeficit.slice(todayIdx - 4, todayIdx + 1);
  } else {
    slicedWaterDeficit = waterDeficit;
  }
  const reversedWaterDeficit = slicedWaterDeficit.sort((a, b) =>
    a.date < b.date ? 1 : b.date < a.date ? -1 : 0
  );

  return (
    <>
      <Header lawn={lawn} email={user.email}></Header>
      <Table
        data={reversedWaterDeficit}
        today={today}
        sprWater={lawn.sprWater}
        year={lawn.year}
        waterOrdinance={lawn.waterOrdinance}
        forecast={forecastData}
      ></Table>
      {waterDeficit.length > 7 && <Graph data={waterDeficit}></Graph>}
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <p className="prose">An unexpected error occurred: {error.message}</p>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <p className="prose">Lawn not found</p>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
