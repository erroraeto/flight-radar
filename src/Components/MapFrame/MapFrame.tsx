import React from 'react';
import './MapFrame.sass';
import { Map, Map as MapLibreMap, GeolocateControl, NavigationControl, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MapFrame = () => {
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const userPos = React.useRef<{ lat: number; lon: number } | null>(null);

  React.useEffect(() => {
    if (!mapContainer.current) return;

    const map = (mapRef.current = new Map({
      container: mapContainer.current,
      style: 'https://americanamap.org/style.json',
      center: [37.6176, 55.7558],
      zoom: 5,
      maxZoom: 18,
    }));

    map.addControl(new NavigationControl());

    map.addControl(
      new GeolocateControl({
        trackUserLocation: true
      })
    );

    map.on('load', () => {
      map.addSource('planes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'planes-layer',
        type: 'symbol',
        source: 'planes',
        layout: {
          'icon-image': 'oneway_black',
          'icon-size': 1.3,
          'icon-allow-overlap': true,
          'icon-rotate': ['get', 'direction'],
          'icon-rotation-alignment': 'map',
        },
      });

      initUserLocation();
    });
  }, []);

  const initUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      startAutoUpdate(55.7558, 37.6176);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        userPos.current = { lat, lon };

        mapRef.current?.setCenter([lon, lat]);
        mapRef.current?.setZoom(9);

        startAutoUpdate(lat, lon);
      },
      () => {
        console.warn("Geolocation denied, using fallback");
        startAutoUpdate(55.7558, 37.6176);
      }
    );
  };

  const startAutoUpdate = (lat: number, lon: number) => {
    updatePlanes(lat, lon);
    setInterval(() => updatePlanes(lat, lon), 2000);
  };

  const fetchPlanes = async (lat: number, lon: number) => {
    try {
      const radius = 350;
      const response = await fetch(`https://api.airplanes.live/v2/point/${lat}/${lon}/${radius}`);

      const data = await response.json();

      return data.ac.map((plane: any) => ({
        lat: plane.lat,
        lon: plane.lon,
        alt: plane.alt_baro,
        speed: plane.gs,
        track: plane.track,
        callsign: plane.flight,
        icao: plane.hex,
        type: plane.t,
      }));
    } catch (error) {
      console.error("Plane API error:", error);
      return [];
    }
  };

  const updatePlanes = async (lat: number, lon: number) => {
    const rawPlanes = await fetchPlanes(lat, lon);
    if (!mapRef.current) return;

    const geojson: any = {
      type: "FeatureCollection",
      features: rawPlanes
        .filter( (p: any) => p.lat && p.lon)
        .map( (p: any) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [p.lon, p.lat],
          },
          properties: {
            direction: p.track ?? 0,
            flight: p.callsign,
            type: p.type,
            icao: p.icao
          },
        }))
    };

    const source = mapRef.current.getSource("planes") as GeoJSONSource;
    source.setData(geojson);
  };



  return <div className="map-frame" ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
};
