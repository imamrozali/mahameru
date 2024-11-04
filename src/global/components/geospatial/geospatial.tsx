import React, { useEffect } from "react";
import { Map, Source, Layer, MapProvider } from "react-map-gl/maplibre";
import { useGeospatialMap } from "./hooks/use-geospatial";
import { MapControlBuilding } from "./hooks/use-building";
import maplibregl, { LngLatLike } from "maplibre-gl";
import useRoute from "./hooks/use-route";

const GeospatialMap = () => {
  const {
    currentStyle,
    handleStyleChange,
    getMapStyle,
    setMapReady,
    MAP_STYLES,
    mapReady,
    mapCurrent,
  } = useGeospatialMap();
  const [active, setActive] = React.useState(true);

  // Use state for start and end coordinates
  const [start, setStart] = React.useState<LngLatLike>([106.827153, -6.17511]); // Monumen Nasional
  const [end, setEnd] = React.useState<LngLatLike>([106.853019, -6.125372]);

  // Use the custom hook with the current state
  const route = useRoute({
    initialStart: start,
    initialEnd: end,
    mapReady,
    mapCurrent,
  });

  // Optional: log coordinates whenever start or end changes
  useEffect(() => {
    if (!mapReady) return;

    console.log(`Start: ${JSON.stringify(route.start)}`);
    setStart([106.827153, -6.17511]);
    setEnd([106.853019, -6.125372]);
    console.log(`End: ${JSON.stringify(route.end)}`);
  }, [mapReady]);

  const logCoordinates = (coordinates: LngLatLike) => {
    if (Array.isArray(coordinates)) {
      console.log(`Longitude: ${coordinates[0]}, Latitude: ${coordinates[1]}`);
    } else {
      console.log(
        `Longitude: ${
          "lng" in coordinates ? coordinates.lng : coordinates.lon
        }, Latitude: ${coordinates.lat}`
      );
    }
  };

  logCoordinates(start);
  logCoordinates(end);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="fixed bottom-0 right-0 w-full z-20">
        <select onChange={handleStyleChange} value={currentStyle}>
          {MAP_STYLES.map((style) => (
            <option key={style.key} value={style.value}>
              {style.title}
            </option>
          ))}
        </select>
        <p>Start: {JSON.stringify(start)}</p>
        <p>End: {JSON.stringify(end)}</p>
      </div>
      <MapProvider>
        <Map
          onLoad={() => setMapReady(true)}
          id="map"
          locale={"id"}
          antialias={true}
          localIdeographFontFamily={"sans-serif"}
          initialViewState={{
            latitude: -6.2,
            longitude: 106.816666,
            zoom: 15.0,
          }}
          mapLib={maplibregl}
          style={{ width: "100%", height: "100%" }}
          mapStyle={getMapStyle(currentStyle)}
          // onMove={(evt) => setViewport({ ...evt.viewState })}
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
    </div>
  );
};

export { GeospatialMap };
