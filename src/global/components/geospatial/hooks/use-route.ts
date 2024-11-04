import { useEffect, useState } from "react";
import { LngLatLike } from "maplibre-gl";
import { useMap } from "react-map-gl";

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

interface UseRouteProps {
  initialStart: LngLatLike;
  initialEnd: LngLatLike;
  mapReady: boolean;
  mapCurrent?: maplibregl.Map;
}

interface UseRouteReturn {
  start: LngLatLike;
  end: LngLatLike;
  setStart: React.Dispatch<React.SetStateAction<LngLatLike>>;
  setEnd: React.Dispatch<React.SetStateAction<LngLatLike>>;
}

const useRoute = ({
  initialStart,
  initialEnd,
  mapReady = false,
  mapCurrent = undefined,
}: UseRouteProps): UseRouteReturn => {
  const { current: mapInstance } = useMap();

  const [start, setStart] = useState<LngLatLike>(initialStart);
  const [end, setEnd] = useState<LngLatLike>(initialEnd);
  const routeLayerId = "route-layer";

  const fetchRoute = async (start: LngLatLike, end: LngLatLike) => {
    try {
      const osrmUrl = `${OSRM_BASE_URL}/${(start as number[]).join(",")};${(
        end as number[]
      ).join(",")}?overview=full&geometries=geojson`;

      const response = await fetch(osrmUrl);
      if (!response.ok) throw new Error("Route fetching request failed.");

      const data = await response.json();
      console.log(data, "Fetched route data");

      if (!data.routes || data.routes.length === 0) {
        console.error("No routes found");
        return null;
      }

      return data.routes[0].geometry;
    } catch (error) {
      console.error("Error fetching route data:", error);
      return null;
    }
  };

  const updateRouteLayer = async () => {
    if (!mapInstance) return;
    console.log(mapCurrent, "mapCurrent");

    const routeCoordinates = await fetchRoute(start, end);
    if (routeCoordinates) {
      if (mapInstance.getSource(routeLayerId)) {
        (
          mapCurrent?.getSource(routeLayerId) as maplibregl.GeoJSONSource
        ).setData({
          type: "Feature",
          geometry: routeCoordinates,
          properties: {},
        });
      } else {
        mapCurrent?.addSource(routeLayerId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: routeCoordinates,
            properties: {},
          },
        });

        mapCurrent?.addLayer({
          id: routeLayerId,
          type: "line",
          source: routeLayerId,
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#ff7e5f",
            "line-width": 4,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (mapReady) {
      updateRouteLayer(); // Call the route updating function if map is ready
    }
  }, [mapReady, mapCurrent, start, end]); // Dependencies for re-running the effect

  return { start, end, setStart, setEnd };
};

export default useRoute;
