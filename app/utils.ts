import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";
import { MODEL_DATA } from "./constants";
import type { Irrigation } from "./models/irrigation.server";
import type { PETDATA } from "./types";
import { SoilMoistureOptionLevel } from "./types";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export async function placeIdToLatLon(placeId: string): Promise<{
  address: string;
  lat: number;
  lng: number;
}> {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${process.env.GOOGLEPLACES_API}`
  );
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return {
    address: data.results[0].formatted_address,
    lat: data.results[0].geometry.location.lat,
    lng: data.results[0].geometry.location.lng,
  };
}

// Brian's code
function getPotentialDailyDrainage(soilcap: SoilMoistureOptionLevel): number {
  // -----------------------------------------------------------------------------------------
  // Calculate potential daily drainage of soil
  //
  // soilcap : soil water capacity : string ('high', 'medium', 'low')
  // -----------------------------------------------------------------------------------------
  const { soilmoistureoptions, soildrainageoptions } = MODEL_DATA.soildata;
  return (
    (soilmoistureoptions[soilcap].saturation -
      soilmoistureoptions[soilcap].fieldcapacity) /
    soildrainageoptions[soilcap].daysToDrainToFcFromSat
  );
}

function getTawForPlant(soilcap: SoilMoistureOptionLevel): number {
  // -----------------------------------------------------------------------------------------
  // Calculate total available water (TAW) for plant, defined here as:
  // soil moisture at field capacity minus soil moisture at wilting point
  //
  // soilcap : soil water capacity : string ('high', 'medium', 'low')
  // -----------------------------------------------------------------------------------------
  const { soilmoistureoptions } = MODEL_DATA.soildata;
  return (
    soilmoistureoptions[soilcap].fieldcapacity -
    soilmoistureoptions[soilcap].wiltingpoint
  );
}

function getWaterStressCoeff(Dr: number, TAW: number): number {
  // -----------------------------------------------------------------------------------------
  // Calculate coefficient for adjusting ET when accounting for decreased ET during water stress conditions.
  // Refer to FAO-56 eq 84, pg 169
  // Dr  : the antecedent water deficit (in)
  // TAW : total available (in) water for the plant (soil moisture at field capacity minus soil moisture at wilting point).
  // p   : at what fraction between field capacity and wilting point do we start applying this water stress factor.
  // Ks  : water stress coefficient
  // -----------------------------------------------------------------------------------------
  let Ks = null;
  const p = 0.5;
  Dr = -1 * Dr;
  Ks = Dr <= p * TAW ? 1 : (TAW - Dr) / ((1 - p) * TAW);
  Ks = Math.max(Ks, 0);
  return Ks;
}

export function runWaterDeficitModel(
  precip: number[],
  pet: number[],
  initDeficit: number = 0,
  soilcap: SoilMoistureOptionLevel.MEDIUM
  // croptype: string = "grass"
) {
  // -----------------------------------------------------------------------------------------
  // Calculate daily water deficit (inches) from daily precipitation, evapotranspiration, soil drainage and runoff.
  //
  // The water deficit is calculated relative to field capacity (i.e. the amount of water available to the plant).
  // Therefore, the water deficit is:
  //    - zero when soil moisture is at field capacity
  //    - a negative value when soil moisture is between field capacity and the wilting point
  //    - a positive value when soil moisture is between field capacity and saturation
  //    - bounded below by the wilting point ( = soil moisture at wilting point minus soil moisture at field capacity )
  //    - bounded above by saturation ( = soil moisture at saturation minus soil moisture at field capacity)
  //
  //  precip       : daily precipitation array (in) : (NRCC ACIS grid 3)
  //  pet          : daily potential evapotranspiration array (in) : (grass reference PET obtained from NRCC MORECS model output)
  //  initDeficit  : water deficit used to initialize the model
  //  startDate    : date of model initialization
  //  plantingDate : date crop was planted
  //  soilcap      : soil water capacity ('high','medium','low')
  //  croptype     : type of crop
  //
  // -----------------------------------------------------------------------------------------

  // a running tally of the deficit
  let deficit = null;

  // days since planting, for help in determining the plant's current growth stage
  // let daysSincePlanting = null;
  // Total water available to plant
  let TAW = null;
  // water stress coefficient
  let Ks = null;
  // crop coefficient
  let Kc = null;

  // values of model components for a single day
  let totalDailyDrainage = null;
  let totalDailyRunoff = null;
  let totalDailyPrecip = null;
  let totalDailyPET = null;
  let dailyPotentialDrainageRate = null;

  // hourly rates of model components
  let hourlyPrecip = null;
  let hourlyPET = null;
  let hourlyDrainage = null;
  let hourlyPotentialDrainage = null;

  // OUTPUT VARS
  // arrays holding daily values of model components
  // deficitDaily is water deficit calculation we are looking for.
  // Other variables are just for potential water balance verification, etc, if the user chooses.
  let deficitDaily = [];
  let deficitDailyChange = [];
  let drainageDaily = [];
  let runoffDaily = [];
  let precipDaily = [];
  let petDaily = [];

  // Initialize deficit
  //   : to zero if saturated soil after irrigation)
  //   : to last observed deficit if running for forecasts
  deficit = initDeficit;

  // the first elements in our output arrays. It include the water deficit initialization. Others will populate starting Day 2.
  deficitDaily.push(deficit);
  deficitDailyChange.push(null);
  drainageDaily.push(null);
  runoffDaily.push(null);
  petDaily.push(null);
  precipDaily.push(null);

  // Calculate daily drainage rate that occurs when soil water content is between saturation and field capacity
  dailyPotentialDrainageRate = getPotentialDailyDrainage(soilcap);

  // Need to know the number of days since planting for crop coefficient calculation
  // If the number is negative, assuming Kc = Kcini for bare soil and single crop coeff method (FAO-56)
  // daysSincePlanting =  Math.floor(( Date.parse(startDate) - Date.parse(plantingDate) ) / 86400000);

  // Loop through all days, starting with the second day (we already have the deficit for the initial day from model initialization)
  for (var idx = 1; idx < pet.length; idx++) {
    // increment as we advance through the growth stages of the plant
    // daysSincePlanting += 1

    // Calculate Ks, the water stress coefficient, using antecedent deficit
    TAW = getTawForPlant(soilcap);
    Ks = getWaterStressCoeff(deficitDaily[idx - 1], TAW);
    // Calculate Kc, the crop coefficient, using the days since planting
    Kc = 1;

    // Vars to hold the daily tally for components of the water balance model daily - mostly for calc verification
    // Initialize the daily totals here.
    totalDailyDrainage = 0;
    totalDailyRunoff = 0;
    // We already know what the daily total is for Precip and ET
    totalDailyPET = -1 * pet[idx] * Kc * Ks;
    totalDailyPrecip = precip[idx];

    // Convert daily rates to hourly rates. For this simple model, rates are constant throughout the day.
    // For drainage : this assumption is okay
    // For precip   : this assumption is about all we can do without hourly observations
    // For PET      : this assumption isn't great. Something following diurnal cycle would be best.
    // For runoff   : not necessary. hourly runoff is determined without limits below.
    // ALL HOURLY RATES POSITIVE
    hourlyPrecip = totalDailyPrecip / 24;
    hourlyPET = (-1 * totalDailyPET) / 24;
    hourlyPotentialDrainage = dailyPotentialDrainageRate / 24;

    for (var hr = 1; hr <= 24; hr++) {
      // Calculate hourly drainage estimate. It is bounded by the potential drainage rate and available
      // water in excess of the field capacity. We assume drainage does not occur below field capacity.
      if (deficit > 0) {
        hourlyDrainage = Math.min(deficit, hourlyPotentialDrainage);
      } else {
        hourlyDrainage = 0;
      }
      totalDailyDrainage -= hourlyDrainage;

      // calculate runoff for bookkeeping purposes
      // runoff is essentially calculated as the amount of water 'deficit' in excess of saturation
      // runoff is applied to the model by setting saturation bounds, below
      totalDailyRunoff -= Math.max(
        deficit +
          hourlyPrecip -
          hourlyPET -
          hourlyDrainage -
          (MODEL_DATA.soildata.soilmoistureoptions[soilcap].saturation -
            MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity),
        0
      );

      // Adjust deficit based on hourly water budget.
      // deficit is bound by saturation (soil can't be super-saturated). This effectively reduces deficit by hourly runoff as well.
      deficit = Math.min(
        deficit + hourlyPrecip - hourlyPET - hourlyDrainage,
        MODEL_DATA.soildata.soilmoistureoptions[soilcap].saturation -
          MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity
      );

      // deficit is bound by wilting point, but calculations should never reach wilting point based on this model. We bound it below for completeness.
      // In the real world, deficit is able to reach wilting point. The user should note that deficit values NEAR the wilting point
      // from this model should be interpreted as 'danger of wilting exists'.
      deficit = Math.max(
        deficit,
        -1 *
          (MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity -
            MODEL_DATA.soildata.soilmoistureoptions[soilcap].wiltingpoint)
      );
    }

    deficitDailyChange.push(deficit - deficitDaily[deficitDaily.length - 1]);
    deficitDaily.push(deficit);
    drainageDaily.push(totalDailyDrainage);
    runoffDaily.push(totalDailyRunoff);
    petDaily.push(totalDailyPET);
    precipDaily.push(totalDailyPrecip);
  }

  // console.log("INSIDE WATER DEFICIT MODEL");

  return {
    // deficitDailyChange: deficitDailyChange,
    deficitDaily,
    // drainageDaily: drainageDaily,
    // runoffDaily: runoffDaily,
    // petDaily: petDaily,
    // precipDaily,
  };
}

export async function getPET({
  year,
  lat,
  lon,
}: {
  year: string;
  lat: number;
  lon: number;
}) {
  // Dates range is 03/01 to 10/31
  const res = await fetch(
    `${process.env.PROXYIRRIGATION}?lat=${lat.toFixed(2)}&lon=${lon.toFixed(
      2
    )}&year=${year}`
  );

  if (res.status !== 200) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
}

export function runModel(
  data: PETDATA,
  threshold: number,
  waterOrdinance: string | null,
  year: string,
  irrigationDates: Irrigation[]
) {
  // using only last 30 days of data or less
  const precip = [...data.precip, ...data.precip_fcst];
  const pet = [...data.pet, ...data.pet_fcst];
  const dates = [...data.dates_precip, ...data.dates_precip_fcst].map(
    (date) => {
      const d = date.split("/");
      return `${year}-${d[0]}-${d[1]}`;
    }
  );

  // user irrigation dates are added to precipitation
  irrigationDates.forEach((irrigation) => {
    const idx = dates.indexOf(irrigation.date);
    if (idx !== -1) {
      precip[idx] += irrigation.water;
    }
  });

  const initialDeficit = 0;
  const soilcap = SoilMoistureOptionLevel.MEDIUM;
  const { deficitDaily } = runWaterDeficitModel(
    precip,
    pet,
    initialDeficit,
    soilcap
  );

  // date format from date picker is (yyyy-mm-dd)
  const today = getToday();

  let dayPlus = 1;
  if (waterOrdinance === "on") dayPlus = 2;

  return dates.map((date, idx) => {
    let shouldWater = deficitDaily[idx] < threshold;

    if (date === today) {
      if (
        deficitDaily[idx] < threshold &&
        deficitDaily[idx + dayPlus] < threshold
      ) {
        shouldWater = true;
      }
    }

    let watered: boolean = false;
    const irriDates = irrigationDates.map((d) => d.date);
    if (irriDates.includes(date)) watered = true;

    return {
      date,
      amount: +deficitDaily[idx].toFixed(3),
      shouldWater,
      watered,
    };
  });
}

export function getToday(): string {
  const ddd = new Date();
  const yyyy = ddd.getFullYear().toString().padStart(4, "0");
  const mm = (ddd.getMonth() + 1).toString().padStart(2, "0");
  const dd = ddd.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isInBBOX(lat: number, lon: number): boolean {
  return (
    lat >= 37.166667 && lat <= 47.625 && lon >= -82.70833 && lon <= -66.875
  );
}

export function calculateWaterAmount(
  duration: number,
  rate: number,
  distributionUniformity: number,
  sprayEfficiencyFactor: number
): number {
  if (
    duration > 0 &&
    rate > 0 &&
    distributionUniformity > 0 &&
    sprayEfficiencyFactor > 0
  ) {
    return Number(
      (
        (duration / 60) *
        (rate / (1 / (0.4 + 0.6 * distributionUniformity))) *
        sprayEfficiencyFactor
      ).toFixed(4)
    );
  } else {
    return 0;
  }
}
