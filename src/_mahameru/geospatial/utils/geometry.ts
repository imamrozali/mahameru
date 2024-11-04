interface Polygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

export const calculateCentroid = (polygon: Polygon): [number, number] => {
  const coordinates = polygon.coordinates[0];
  let xSum = 0,
    ySum = 0,
    area = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [x1, y1] = coordinates[i];
    const [x2, y2] = coordinates[i + 1];
    const crossProduct = x1 * y2 - x2 * y1;
    area += crossProduct;
    xSum += (x1 + x2) * crossProduct;
    ySum += (y1 + y2) * crossProduct;
  }

  area *= 0.5;
  if (area === 0) throw new Error("Degenerate polygon");
  return [xSum / (6 * area), ySum / (6 * area)];
};
