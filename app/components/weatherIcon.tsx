// Day
import DayClear from "../images/day-sunny.svg";
import DayMixed from "../images/day-cloudy.svg";
import DayCloudy from "../images/cloudy.svg";
import DayRainMix from "../images/day-rain-mix.svg";
import DayRain from "../images/rain.svg";

// Night
import NightClear from "../images/night-clear.svg";
import NightMixed from "../images/night-cloudy.svg";
import NightCloudy from "../images/cloudy.svg";
import NightRainMix from "../images/night-rain.svg";
import NightRain from "../images/rain.svg";

const icons = [
  { name: "day-clear", icon: DayClear },
  { name: "day-mixed", icon: DayMixed },
  { name: "day-cloudy", icon: DayCloudy },
  { name: "day-rain-mix", icon: DayRainMix },
  { name: "day-rain", icon: DayRain },

  { name: "night-clear", icon: NightClear },
  { name: "night-mixed", icon: NightMixed },
  { name: "night-cloudy", icon: NightCloudy },
  { name: "night-rain-mix", icon: NightRainMix },
  { name: "night-rain", icon: NightRain },
];

// The 'weather' string that comes from the api has five options:
// clear, mixed, cloudy, rain-mix, rain
export default function WeatherIcon({ weather }: { weather: string }) {
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 5 && currentHour <= 18;

  let name = `${isDay ? "day" : "night"}-${weather}`;
  let found = icons.find((i) => i.name === name);

  return (
    <img
      src={found?.icon}
      alt={found?.name}
      className="inline-block h-7 w-7 text-gray-400"
      aria-hidden="true"
    />
  );
}
