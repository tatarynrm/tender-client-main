"use client";

import React from "react";
import {
  UA_VIEWBOX,
  UA_REGION_PATHS,
  UA_CITY_POINTS,
  UA_REGION_CENTERS,
} from "../data/ukraineGeo";

interface Props {
  /** назва області → активна тривога */
  regions: Record<string, boolean>;
  /** обрана користувачем область (підсвічується) */
  selectedRegion?: string | null;
}

export const UkraineAlertMap = ({ regions, selectedRegion }: Props) => {
  // точки для регіонів без полігонів (м. Київ, Севастополь)
  const pointRegions = Object.keys(UA_CITY_POINTS);

  return (
    <svg
      viewBox={UA_VIEWBOX}
      className="w-full h-full"
      role="img"
      aria-label="Карта повітряних тривог України"
    >
      <defs>
        <filter id="alert-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* області */}
      {Object.entries(UA_REGION_PATHS).map(([name, d]) => {
        const alerted = regions[name];
        const selected = selectedRegion === name;
        return (
          <path
            key={name}
            d={d}
            className={alerted ? "ua-region-alert" : ""}
            fill={alerted ? "#ef4444" : "#e2e8f5"}
            stroke={selected ? "#2563eb" : "#ffffff"}
            strokeWidth={selected ? 2.4 : 1}
            filter={alerted ? "url(#alert-glow)" : undefined}
            opacity={alerted ? 0.95 : 0.9}
          >
            <title>
              {name}
              {alerted ? " — ТРИВОГА" : ""}
            </title>
          </path>
        );
      })}

      {/* маркери для обраного регіону та для регіонів-точок */}
      {pointRegions.map((name) => {
        const [x, y] = UA_CITY_POINTS[name];
        const alerted = regions[name];
        return (
          <circle
            key={name}
            cx={x}
            cy={y}
            r={alerted ? 7 : 4}
            fill={alerted ? "#ef4444" : "#64748b"}
            stroke="#fff"
            strokeWidth={1}
            className={alerted ? "ua-region-alert" : ""}
          />
        );
      })}

      {/* позначка обраного міста */}
      {selectedRegion &&
        (() => {
          const p =
            UA_CITY_POINTS[selectedRegion] ??
            UA_REGION_CENTERS[selectedRegion];
          if (!p) return null;
          const [x, y] = p;
          const alerted = regions[selectedRegion];
          return (
            <g>
              <circle
                cx={x}
                cy={y}
                r={10}
                fill="none"
                stroke={alerted ? "#ef4444" : "#2563eb"}
                strokeWidth={2}
                className="ua-pin-pulse"
              />
              <circle cx={x} cy={y} r={3.5} fill={alerted ? "#ef4444" : "#2563eb"} />
            </g>
          );
        })()}

      <style>{`
        .ua-region-alert { animation: uaAlertPulse 1.3s ease-in-out infinite; }
        @keyframes uaAlertPulse {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.55; }
        }
        .ua-pin-pulse { animation: uaPinPulse 1.6s ease-out infinite; transform-origin: center; transform-box: fill-box; }
        @keyframes uaPinPulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </svg>
  );
};
