const PROXY_URL = process.env.REACT_APP_ADSB_PROXY || "http://localhost:3001/adsb";

export async function fetchPlanesRaw() {
  const res = await fetch(PROXY_URL);
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const data = await res.json();
  return data;
};

export async function fetchPlanes() {
  const data: any = await fetchPlanesRaw();
  const list = data.acList || data?.data || data?.result || [];
  const normalized = list.filter((p: any) => (p.Lat !== undefined && p.Long !== undefined) || (p.latitude !== undefined && p.longitude !== undefined));
  return normalized;
};