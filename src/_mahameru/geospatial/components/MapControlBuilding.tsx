import React, { useEffect } from "react";
import { useMap } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { fetchGeocodeAddress } from "../utils/fetchGeocode";
import { calculateCentroid } from "../utils/geometry";
import { FeatureCollection } from "geojson";

interface MapControlBuildingProps {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}

interface Polygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

const MapControlBuilding: React.FC<MapControlBuildingProps> = ({
  active,
  onClick,
  disabled,
}) => {
  const { current: mapInstance } = useMap();
  const map = mapInstance?.getMap() as maplibregl.Map | undefined;

  const buildingLayerId = "osmbuildings";
  const buildingLabelLayerId = "osmbuildingslabels";

  useEffect(() => {
    if (!map) return;

    const addBuildingLayer = async () => {
      const zoom = Math.floor(map.getZoom());
      if (zoom < 15 || zoom > 16) return; // Hanya tampilkan layer pada zoom level 15-16

      // Dapatkan batas peta saat ini
      const bounds = map.getBounds();
      const [tileMinX, tileMaxX, tileMinY, tileMaxY] = calculateTileBounds(
        bounds,
        zoom
      );

      const geojsonFeatures = await fetchBuildingData(
        tileMinX,
        tileMaxX,
        tileMinY,
        tileMaxY,
        zoom
      );

      // Buat GeoJSON untuk layer bangunan
      const mergedGeoJSON: FeatureCollection = {
        type: "FeatureCollection",
        features: geojsonFeatures,
      };

      // Tambahkan atau perbarui source
      if (!map.getSource(buildingLayerId)) {
        map.addSource(buildingLayerId, {
          type: "geojson",
          data: mergedGeoJSON,
        });
      } else {
        (map.getSource(buildingLayerId) as maplibregl.GeoJSONSource).setData(
          mergedGeoJSON
        );
      }

      // Tambahkan layer bangunan jika belum ada
      if (!map.getLayer(buildingLayerId)) {
        map.addLayer({
          id: buildingLayerId,
          type: "fill-extrusion",
          source: buildingLayerId,
          paint: {
            "fill-extrusion-opacity": 0.9,
            "fill-extrusion-height": [
              "+",
              ["get", "height"],
              ["get", "levels"],
            ],
            "fill-extrusion-color": [
              "match",
              ["get", "roofMaterial"],
              "metal",
              "#B0C4DE",
              "roof_tiles",
              "#FF6347",
              "concrete",
              "#808080",
              "asphalt",
              "#696969",
              "slate",
              "#708090",
              "thatched",
              "#DEB887",
              "shingles",
              "#A52A2A",
              "glass",
              "#87CEEB",
              "wood",
              "#8B4513",
              "#eeeeee",
            ],
          },
        });

        // Event untuk menampilkan popup pada klik
        map.on("click", buildingLayerId, async (e) => {
          const feature = e.features?.[0];
          if (feature) {
            const lnglat = calculateCentroid(feature.geometry as Polygon);
            const address = await fetchGeocodeAddress(lnglat[0], lnglat[1]);
            new maplibregl.Popup({ offset: 25 })
              .setLngLat(lnglat)
              .setHTML(
                `<div>
                   <strong>${
                     feature.properties?.name || "Building"
                   }</strong><br/>
                   ${address || "Address not found"}
                 </div>`
              )
              .addTo(map);
          }
        });
      }

      // Layer label untuk nama bangunan
      if (!map.getLayer(buildingLabelLayerId)) {
        map.addLayer({
          id: buildingLabelLayerId,
          type: "symbol",
          source: buildingLayerId,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-offset": [0, 1],
          },
          paint: {
            "text-color": "#333333",
            "text-halo-color": "#FFFFFF",
            "text-halo-width": 1,
          },
        });
      }
    };

    const removeBuildingLayer = () => {
      if (map.getLayer(buildingLayerId)) map.removeLayer(buildingLayerId);
      if (map.getLayer(buildingLabelLayerId))
        map.removeLayer(buildingLabelLayerId);
      if (map.getSource(buildingLayerId)) map.removeSource(buildingLayerId);
    };

    if (active) {
      map.on("moveend", addBuildingLayer);
      addBuildingLayer();
    } else {
      removeBuildingLayer();
      map.off("moveend", addBuildingLayer);
    }

    return () => {
      map.off("moveend", addBuildingLayer);
      removeBuildingLayer();
    };
  }, [active]);

  return (
    <button disabled={disabled} onClick={onClick}>
      Toggle Buildings
    </button>
  );
};

// Utilitas untuk menghitung batas tile berdasarkan bound peta
const calculateTileBounds = (bounds: maplibregl.LngLatBounds, zoom: number) => {
  const tileMinX = Math.floor(
    ((bounds.getWest() + 180) / 360) * Math.pow(2, zoom)
  );
  const tileMaxX = Math.floor(
    ((bounds.getEast() + 180) / 360) * Math.pow(2, zoom)
  );
  const tileMinY = Math.floor(
    ((1 -
      Math.log(
        Math.tan((bounds.getNorth() * Math.PI) / 180) +
          1 / Math.cos((bounds.getNorth() * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
  const tileMaxY = Math.floor(
    ((1 -
      Math.log(
        Math.tan((bounds.getSouth() * Math.PI) / 180) +
          1 / Math.cos((bounds.getSouth() * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
  return [tileMinX, tileMaxX, tileMinY, tileMaxY];
};

// Fungsi untuk mengambil data bangunan dari OSM
const fetchBuildingData = async (
  tileMinX: number,
  tileMaxX: number,
  tileMinY: number,
  tileMaxY: number,
  zoom: number
): Promise<GeoJSON.Feature[]> => {
  const features: GeoJSON.Feature[] = [];
  for (let x = tileMinX; x <= tileMaxX; x++) {
    for (let y = tileMinY; y <= tileMaxY; y++) {
      try {
        const response = await fetch(
          `https://data.osmbuildings.org/0.2/59fcc2e8/tile/${zoom}/${x}/${y}.json`
        );
        const tileGeoJSON = await response.json();
        features.push(...tileGeoJSON.features);
      } catch (error) {
        console.error(`Failed to load tile at ${x},${y}:`, error);
      }
    }
  }
  return features;
};

export { MapControlBuilding };
