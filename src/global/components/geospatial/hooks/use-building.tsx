import { useEffect } from "react";
import { useMap } from "react-map-gl";
import { FeatureCollection } from "geojson";
import maplibregl from "maplibre-gl";
import React from "react";

interface MapControlBuildingProps {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const MapControlBuilding: React.FC<MapControlBuildingProps> = (
  props
) => {
  const { active, onClick, disabled } = props;

  const { current: mapInstance } = useMap();
  const mapCurrent = mapInstance?.getMap() as maplibregl.Map | undefined;

  const buildingLayerId = "osmbuildings";
  const buildingLabelLayerId = "osmbuildingslabels";
  const fetchGeocodeAddress = async (lon: number, lat: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error("Geocoding request failed.");

      const geocodeData = await response.json();
      console.log("Geocode address:", geocodeData.display_name);
      return geocodeData.display_name;
    } catch (error) {
      console.error("Error fetching geocode data:", error);
    }
  };

  useEffect(() => {
    if (!mapCurrent) return;
    const addBVTText = () => {
      const attributionControl = document.querySelector(
        ".maplibregl-ctrl-attrib-inner"
      );
      if (attributionControl) {
        // Create the anchor element
        const bvtLink = document.createElement("a");
        bvtLink.href = "https://bvarta.com"; // Replace with your URL
        bvtLink.innerText = "| Bhumi Varta Technology"; // Link text
        bvtLink.target = "_blank"; // Open link in a new tab
        bvtLink.rel = "noopener noreferrer"; // Security best practices
        bvtLink.style.marginLeft = "10px"; // Add some left margin
        bvtLink.style.color = "#333"; // Change color as needed
        bvtLink.style.textDecoration = "none"; // Remove underline
        bvtLink.style.fontSize = "12px"; // Set font size

        // Optional: Add hover effects
        bvtLink.onmouseover = () => {
          bvtLink.style.color = "#007BFF"; // Change color on hover
          bvtLink.style.textDecoration = "underline"; // Underline on hover
        };
        bvtLink.onmouseout = () => {
          bvtLink.style.color = "#333"; // Revert color
          bvtLink.style.textDecoration = "none"; // Remove underline
        };

        attributionControl.appendChild(bvtLink);
      }
    };

    // Add the "BVT" text after the map has loaded
    mapCurrent.on("load", addBVTText);

    const addBuildingLayer = async () => {
      const bounds = mapCurrent.getBounds();
      const zoom = Math.floor(mapCurrent.getZoom());
      if (zoom < 15 || zoom > 16 || !bounds) return; // Only fetch and add layer if zoom >= 15

      // Calculate the tile ranges
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

      interface Polygon {
        type: "Polygon";
        coordinates: [number, number][][];
      }

      const calculateCentroid = (polygon: Polygon): [number, number] => {
        const coordinates = polygon.coordinates[0]; // Assumes a single polygon

        let xSum = 0;
        let ySum = 0;
        let area = 0;

        for (let i = 0; i < coordinates.length - 1; i++) {
          const [x1, y1] = coordinates[i];
          const [x2, y2] = coordinates[i + 1];

          const crossProduct = x1 * y2 - x2 * y1;
          area += crossProduct;
          xSum += (x1 + x2) * crossProduct;
          ySum += (y1 + y2) * crossProduct;
        }

        // Area is divided by 2, hence the area should be positive
        area *= 0.5;

        // If area is zero, the polygon is degenerate
        if (area === 0) {
          throw new Error(
            "The polygon is degenerate; no valid centroid exists."
          );
        }

        const centroidX = xSum / (6 * area);
        const centroidY = ySum / (6 * area);

        return [centroidX, centroidY]; // Returns [longitude, latitude]
      };

      // Fetch all tiles within the bounding box
      const geojsonFeatures = [];
      for (let x = tileMinX; x <= tileMaxX; x++) {
        for (let y = tileMinY; y <= tileMaxY; y++) {
          //const url = `https://tiles.streets.gl/vector/${zoom}/${x}/${y}`;
          const url = `https://data.osmbuildings.org/0.2/59fcc2e8/tile/${zoom}/${x}/${y}.json`;
          try {
            const response = await fetch(url);
            const tileGeoJSON = await response.json();
            geojsonFeatures.push(...tileGeoJSON.features); // Merge features from all tiles
          } catch (error) {
            console.error(`Failed to load tile at ${x},${y}:`, error);
          }
        }
      }

      // Create a merged GeoJSON object
      const mergedGeoJSON: FeatureCollection = {
        type: "FeatureCollection",
        features: geojsonFeatures,
      };

      // Add or update source
      if (!mapCurrent.getSource(buildingLayerId)) {
        mapCurrent.addSource(buildingLayerId, {
          type: "geojson",
          data: mergedGeoJSON,
        });
      } else {
        (
          mapCurrent.getSource(
            buildingLayerId
          ) as unknown as maplibregl.GeoJSONSource
        ).setData(mergedGeoJSON);
      }

      // Add building layer if it doesn't exist
      if (!mapCurrent.getLayer(buildingLayerId)) {
        mapCurrent.addLayer({
          id: buildingLayerId,
          type: "fill-extrusion",
          source: buildingLayerId,
          paint: {
            "fill-extrusion-opacity": 0.9,
            "fill-extrusion-height": [
              "+",
              ["coalesce", ["get", "height"], 2],
              ["coalesce", ["get", "levels"], 0],
            ],

            "fill-extrusion-color": [
              "case",
              ["==", ["get", "roofMaterial"], "metal"],
              "#B0C4DE", // light steel blue for metal roofs
              ["==", ["get", "roofMaterial"], "roof_tiles"],
              "#FF6347", // tomato red for tile roofs
              ["==", ["get", "roofMaterial"], "concrete"],
              "#808080", // gray for concrete roofs
              ["==", ["get", "roofMaterial"], "asphalt"],
              "#696969", // dim gray for asphalt roofs
              ["==", ["get", "roofMaterial"], "slate"],
              "#708090", // slate gray for slate roofs
              ["==", ["get", "roofMaterial"], "thatched"],
              "#DEB887", // burlywood for thatched roofs
              ["==", ["get", "roofMaterial"], "shingles"],
              "#A52A2A", // brown for shingled roofs
              ["==", ["get", "roofMaterial"], "glass"],
              "#87CEEB", // sky blue for glass roofs
              ["==", ["get", "roofMaterial"], "wood"],
              "#8B4513", // saddle brown for wood roofs
              "#eeeeee",
            ],
          },
        });
        mapCurrent.on("click", buildingLayerId, async (e) => {
          const features = e.features;
          if (features && features.length > 0) {
            const name = features[0].properties?.name || "Building";
            const type = features[0].properties?.type || "Not specified";
            const lnglat = calculateCentroid(features[0].geometry as Polygon);
            // const centroid = turf.centroid(features[0].geometry as Polygon);
            const address = await fetchGeocodeAddress(lnglat[0], lnglat[1]);
            new maplibregl.Popup({ offset: 25 })
              .setLngLat([lnglat[0], lnglat[1]])
              .setHTML(
                `<div class="popup-content">
                  <strong>${name}</strong>
                  <br/>
                  <span class="popup-address">${
                    address || "Address not found"
                  }</span>
                  <br/>
                  <span class="popup-type">Type: ${type}</span>
                </div>`
              )
              .addTo(mapCurrent);
          }
        });
      }

      if (!mapCurrent.getLayer(buildingLabelLayerId)) {
        mapCurrent.addLayer({
          id: buildingLabelLayerId,
          type: "symbol",
          source: buildingLayerId,
          layout: {
            "text-field": ["get", "name"],
            "text-offset": [0, 0],
            "text-size": 12,
            "text-allow-overlap": false,
            "text-pitch-alignment": "viewport",
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
      if (mapCurrent.getLayer(buildingLayerId)) {
        mapCurrent.removeLayer(buildingLayerId);
      }
      if (mapCurrent.getLayer(buildingLabelLayerId)) {
        mapCurrent.removeLayer(buildingLabelLayerId);
      }
    };

    // Add or remove the building layer based on the state
    if (active) {
      addBuildingLayer();
      mapCurrent.on("moveend", addBuildingLayer); // Update layer data on map movement
    } else {
      removeBuildingLayer();
      mapCurrent.off("moveend", addBuildingLayer);
    }

    // Cleanup on component unmount
    return () => {
      mapCurrent.off("moveend", addBuildingLayer);
      removeBuildingLayer();
      mapCurrent.off("load", addBVTText);
    };
  }, [active]);

  const toggleBuildingVisibility = () => {
    onClick();
  };

  return (
    <div>
      <button disabled={disabled} onClick={toggleBuildingVisibility}>
        hello
      </button>
    </div>
  );
};
