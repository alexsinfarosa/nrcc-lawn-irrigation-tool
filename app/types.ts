export type Location = {
  placeId: string;
  address: string;
  hasWaterOrdinance: boolean;
  lat: string;
  lng: string;
};

type Grass = {
  grass: {
    Lini: number;
    Ldev: number;
    Lmid: number;
    Llate: number;
    Kcini: number;
    Kcmid: number;
    Kcend: number;
  };
};

type SoilMoistureOption = {
  wiltingpoint: number;
  prewiltingpoint: number;
  stressthreshold: number;
  fieldcapacity: number;
  saturation: number;
};

export enum SoilMoistureOptionLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export type MODELDATA = {
  cropinfo: {
    grass: Grass;
  };
  soildata: {
    soilmoistureoptions: {
      low: SoilMoistureOption;
      medium: SoilMoistureOption;
      high: SoilMoistureOption;
    };
    soildrainageoptions: {
      low: { daysToDrainToFcFromSat: number };
      medium: { daysToDrainToFcFromSat: number };
      high: { daysToDrainToFcFromSat: number };
    };
  };
};

export type PETDATA = {
  dates_pet: string[];
  dates_pet_fcst: string[];
  dates_precip: string[];
  dates_precip_fcst: string[];
  first_date: string;
  lat: string;
  lon: string;
  pet: number[];
  pet_fcst: number[];
  precip: number[];
  precip_fcst: number[];
};

export type WaterDeficit = {
  date: string;
  amount: number;
  shouldWater: boolean;
  watered: boolean;
};
