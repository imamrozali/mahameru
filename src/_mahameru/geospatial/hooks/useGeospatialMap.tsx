import { useState } from "react";
import { MapStyle } from "react-map-gl/maplibre";
import { MAP_STYLES } from "../constants/MapStyles";

const useGeospatialMap = () => {
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0].value);
  const [loading] = useState(false);

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

  return { currentStyle, handleStyleChange, getMapStyle, MAP_STYLES, loading };
};

export { useGeospatialMap };
