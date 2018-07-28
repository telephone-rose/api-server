const toRad = (num: number) => {
  return (num * Math.PI) / 180;
};

interface ICoordinates {
  longitude: number;
  latitude: number;
}

/**
 * Returns the distance between two points in meters
 */
export default (start: ICoordinates, end: ICoordinates) => {
  const R = 6371000;

  const dLat = toRad(end.latitude - start.latitude);
  const dLon = toRad(end.longitude - start.longitude);
  const lat1 = toRad(start.latitude);
  const lat2 = toRad(end.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
