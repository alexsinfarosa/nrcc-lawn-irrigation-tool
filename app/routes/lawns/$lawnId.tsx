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
import { getPET, runModel, getToday } from "~/utils";
import Header from "~/components/header";
import {
  createIrrigation,
  deleteIrrigation,
  findIrrigation,
  getIrrigations,
} from "~/models/irrigation.server";

type LoaderData = {
  lawn: Lawn;
  petData: PETDATA;
  irrigationDates: Irrigation[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.lawnId, "lawnId not found");

  const lawn = await getLawn({ userId, id: params.lawnId });
  if (!lawn) {
    throw new Response("Not Found", { status: 404 });
  }

  const irrigationDates = await getIrrigations({ lawnId: lawn.id });
  const petData: PETDATA = await getPET({
    year: lawn.year,
    lat: lawn.lat,
    lon: lawn.lng,
  });

  return json<LoaderData>({ lawn, petData, irrigationDates });
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
  }
};

export default function LawnDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const { lawn, petData, irrigationDates } = data;

  const threshold: number = -1.6 * ((lawn.sprRate * lawn.sprDuration) / 60);
  const waterDeficit = runModel(
    petData,
    threshold,
    lawn.waterOrdinance,
    lawn.year,
    irrigationDates
  );

  // console.log({ petData });
  // console.log({ waterDeficit });

  const todayIdx = waterDeficit.findIndex((d) => d.date === getToday());

  let today;
  let slicedWaterDeficit;
  if (todayIdx > -1) {
    today = waterDeficit[todayIdx];
    slicedWaterDeficit = waterDeficit.slice(todayIdx - 5, todayIdx + 3);
  } else {
    slicedWaterDeficit = waterDeficit;
  }
  const reversedWaterDeficit = slicedWaterDeficit.sort((a, b) =>
    a.date < b.date ? 1 : b.date < a.date ? -1 : 0
  );

  return (
    <>
      <Header lawn={lawn}></Header>
      <Table
        data={reversedWaterDeficit}
        today={today}
        sprWater={lawn.sprWater}
        year={lawn.year}
        waterOrdinance={lawn.waterOrdinance}
      ></Table>
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