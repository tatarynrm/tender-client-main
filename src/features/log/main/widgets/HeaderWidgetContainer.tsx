"use client";

import React from "react";
import { DateTimeWidget } from "./DateTimeWidget";
import { WeatherWidget } from "./WeatherWidget";
import { CurrencyWidget } from "./CurrencyWidget";
import { AirAlarmWidget } from "./AirAlarmWidget";
import { FuelWidget } from "./FuelWidget";

export const HeaderWidgetContainer = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 w-full">
      {/* 1. Годинник та Дата */}
      {/* <div className="w-full lg:w-auto">
        <DateTimeWidget />
      </div> */}

      {/* 2. Погода та вибір міст */}
      <div className="w-full lg:w-auto">
        <WeatherWidget />
      </div>

      {/* 3. Курси валют */}
      <div className="w-full lg:w-auto">
        <CurrencyWidget />
      </div>
      {/* <div className="w-full lg:w-auto">
        <FuelWidget />
      </div> */}

      <AirAlarmWidget />
    </div>
  );
};
