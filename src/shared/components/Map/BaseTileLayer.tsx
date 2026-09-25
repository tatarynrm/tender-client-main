"use client";

import { TileLayer } from "react-leaflet";
import { useTheme } from "next-themes";

// Безключові растрові підкладки Esri. CARTO (basemaps.cartocdn.com) не використовувати:
// без API-ключа на ближчих зумах віддає плитки з водяним знаком «API KEY REQUIRED».
// Увага: в Esri порядок осей {z}/{y}/{x}, піддоменів {s} немає.
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const ESRI_ATTRIBUTION = "Tiles &copy; Esri";

// Стеля Esri Gray Canvas — z16; вище плитки порожні.
const GRAY_CANVAS_MAX_ZOOM = 16;

const BASEMAPS = {
  dark: {
    base: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
  },
  light: {
    base: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
  },
} as const;

/**
 * Підкладка карти за поточною темою: темна → Esri Dark Gray, світла → Esri Light Gray,
 * поверх — прозорий шар підписів міст тієї ж палітри.
 */
export function BaseTileLayer({ crossOrigin }: { crossOrigin?: boolean | "anonymous" }) {
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === "dark" ? BASEMAPS.dark : BASEMAPS.light;

  return (
    <>
      <TileLayer
        url={style.base}
        maxZoom={GRAY_CANVAS_MAX_ZOOM}
        attribution={ESRI_ATTRIBUTION}
        crossOrigin={crossOrigin}
      />
      <TileLayer
        url={style.labels}
        maxZoom={GRAY_CANVAS_MAX_ZOOM}
        crossOrigin={crossOrigin}
        zIndex={2}
      />
    </>
  );
}
