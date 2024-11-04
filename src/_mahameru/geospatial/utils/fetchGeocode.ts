export const fetchGeocodeAddress = async (
  lon: number,
  lat: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );
    if (!response.ok) throw new Error("Geocoding request failed.");
    const geocodeData = await response.json();
    return geocodeData.display_name;
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    return null;
  }
};
