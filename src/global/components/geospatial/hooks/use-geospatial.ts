import { useState } from "react";
import { MapStyle, useMap } from "react-map-gl/maplibre"; // Ensure you import useMap
const MAP_STYLES = [
  {
    key: "defaultSetting",
    value: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    title: "Light (default)",
  },
  {
    key: "nightMapSetting",
    value: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    title: "Dark",
  },
  {
    key: "lightMapSetting",
    value: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    title: "Bright",
  },
  {
    key: "streetMapSetting",
    value: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    title: "Streets",
  },
  {
    key: "satelliteMapSetting",
    value:
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&apistyle=s.t:2|s.e:l|p.v:off,s.t:4|s.e:l|p.v:off",
    title: "Satellite Hybrid",
  },
];

const useGeospatialMap = () => {
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0].value);
  const [mapReady, setMapReady] = useState(false);

  const { current: mapInstance } = useMap();
  const mapCurrent = mapInstance?.getMap() as maplibregl.Map | undefined;

  const getMapStyle = (styleUrl: string): MapStyle => ({
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: { xyz: { type: "raster", tiles: [styleUrl], tileSize: 256 } },
    layers: [
      {
        id: "xyz-layer",
        type: "raster",
        source: "xyz",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  });

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentStyle(event.target.value);
  };

  return {
    currentStyle,
    setCurrentStyle,
    getMapStyle,
    handleStyleChange,
    MAP_STYLES,
    mapReady,
    mapCurrent,
    setMapReady,
  };
};

export { useGeospatialMap };
