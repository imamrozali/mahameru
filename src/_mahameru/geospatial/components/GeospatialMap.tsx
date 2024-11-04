import React, { useState } from "react";
import { Map, Source, Layer, MapProvider } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { useGeospatialMap } from "../hooks/useGeospatialMap";
import { MapControlBuilding } from "../components/MapControlBuilding";

const GeospatialMap: React.FC = () => {
  const { currentStyle, handleStyleChange, getMapStyle, MAP_STYLES, loading } =
    useGeospatialMap();
  const [active, setActive] = useState(true);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Dropdown untuk mengubah gaya peta */}
      <div className="fixed bottom-0 right-0 w-full z-20">
        <select onChange={handleStyleChange} value={currentStyle}>
          {MAP_STYLES.map((style) => (
            <option key={style.key} value={style.value}>
              {style.title}
            </option>
          ))}
        </select>
      </div>

      <MapProvider>
        <Map
          id="map"
          locale="id"
          antialias
          localIdeographFontFamily="sans-serif"
          initialViewState={{ latitude: -6.2, longitude: 106.816666, zoom: 15 }}
          mapLib={maplibregl}
          style={{ width: "100%", height: "100%" }}
          mapStyle={getMapStyle(currentStyle)}
        >
          <MapControlBuilding
            active={active}
            onClick={() => setActive(!active)}
            disabled={false}
          />
          <Source
            id="xyz"
            type="raster"
            tiles={[currentStyle]}
            tileSize={256}
          />
          <Layer id="xyz-layer" type="raster" source="xyz" />
        </Map>
      </MapProvider>

      {loading && (
        <div className="loading-indicator">Loading building data...</div>
      )}
    </div>
  );
};

export default GeospatialMap;
