// soildata:
// soil moisture and drainage characteristics for different levels of soil water capacity
export const MODEL_DATA = {
  cropinfo: {
    grass: {
      Lini: 0,
      Ldev: 0,
      Lmid: 240,
      Llate: 0,
      Kcini: 1.0,
      Kcmid: 1.0,
      Kcend: 1.0,
    },
  },
  soildata: {
    soilmoistureoptions: {
      low: {
        wiltingpoint: 1.0,
        prewiltingpoint: 1.15,
        stressthreshold: 1.5,
        fieldcapacity: 2.0,
        saturation: 5.0,
      },
      medium: {
        wiltingpoint: 2.0 / 3,
        prewiltingpoint: 2.225 / 3,
        stressthreshold: 2.8 / 3,
        fieldcapacity: 3.5 / 3,
        saturation: 5.5 / 3,
      },
      high: {
        wiltingpoint: 3.0,
        prewiltingpoint: 3.3,
        stressthreshold: 4.0,
        fieldcapacity: 5.0,
        saturation: 6.5,
      },
    },
    soildrainageoptions: {
      low: { daysToDrainToFcFromSat: 0.125 },
      medium: { daysToDrainToFcFromSat: 1.0 },
      high: { daysToDrainToFcFromSat: 2.0 },
    },
  },
};
const { medium } = MODEL_DATA.soildata.soilmoistureoptions;

// const noDeficit = medium.saturation - medium.fieldcapacity;
export const DEFICIT_STRESS = medium.prewiltingpoint - medium.fieldcapacity;
export const DEFICIT_NO_STRESS = medium.stressthreshold - medium.fieldcapacity;
