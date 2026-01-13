export const fetchPlanes = async (lat: number, lon: number) => {
  try {
    const radius = 350;
    const proxyUrl = 'https://ncrkplbvvdmhnticqrxw.supabase.co/functions/v1/adsb-proxy';
    const response = await fetch(`${proxyUrl}?lat=${lat}&lon=${lon}&dist=${radius}`);
    const data = await response.json();
    return data.ac.map((plane: any) => ({
      lat: plane.lat,
      lon: plane.lon,
      hex: plane.hex,
      reg: plane.r,
      type: plane.t,
      speed: plane.gs,
      alt: plane.alt_baro,
      direction: plane.track ?? plane.dir ?? 0,
    }));
  } catch (error) {
    console.error('Plane API error:', error);
    return [];
  }
};
