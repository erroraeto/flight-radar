import React from 'react';
import './MapFrame.sass';
import { Map, Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
// import { Map, Map as MapLibreMap, GeolocateControl, NavigationControl, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// export const MapFrame = () => {
//   const mapContainer = React.useRef<HTMLDivElement | null>(null);
//   const mapRef = React.useRef<MapLibreMap | null>(null);
//
//   React.useEffect(() => {
//     // if (mapRef.current || !mapContainer.current) return;
//     if (!mapContainer.current) return;
//
//     const map = mapRef.current = new Map({
//       container: mapContainer.current,
//       style: 'https://americanamap.org/style.json',
//       center: [15, 30],
//       zoom: 1.4,
//       maxZoom: 18,
//       maxPitch: 85,
//     });
//
//     map.addControl(
//       new GeolocateControl({
//         fitBoundsOptions: { maxZoom: 20 },
//         positionOptions: { enableHighAccuracy: true },
//         trackUserLocation: true,
//       }),
//     );
//     map.addControl(new NavigationControl());
//
//     map.on('load', () => {
//       fetchPlanes();
//     });
//   }, []);
//
//   const fetchPlanes = async () => {
//     const url = 'https://flight-radar1.p.rapidapi.com/flights/list-by-airline?airline=AXM';
//     const options = {
//       method: 'GET',
//       headers: {
//         'x-rapidapi-key': 'd6f394051bmsh7dd37d398817e93p1fa0a4jsn89e2993a4a51',
//         'x-rapidapi-host': 'flight-radar1.p.rapidapi.com',
//       },
//     };
//
//     try {
//       const response = await fetch(url, options);
//       const data = await response.json();
//
//       if (!data.aircraft || !mapRef.current) return;
//
//       const geojson = {
//         type: 'FeatureCollection',
//         features: data.result.map((plane: any) => ({
//           type: 'Feature',
//           geometry: {
//             type: 'Point',
//             coordinates: [plane[3], plane[2]], // lon, lat
//           },
//           properties: {
//             icao: plane[0],
//             direction: plane[4],
//             altitude: plane[5],
//             speed: plane[6],
//             type: plane[9],
//             reg: plane[10],
//             origin: plane[12],
//             destination: plane[13],
//             flight: plane[14],
//             callsign: plane[17],
//             airline: plane[19],
//           },
//         })),
//     };
//
//       updatePlanesLayer(geojson);
//     } catch (e) {
//       throw new Error(`API error: ${String(e)}`);
//     }
//   };
//
//   const updatePlanesLayer = (geojson: any) => {
//     const map = mapRef.current!;
//
//     if (map.getSource('planes')) {
//       (map.getSource('planes') as GeoJSONSource).setData(geojson);
//       return;
//     }
//     map.addSource("planes", {
//       type: "geojson",
//       data: {
//         type: "FeatureCollection",
//         features: []
//       }
//     });
//     // Слой отображения самолётов
//     map.addLayer({
//       id: "planes-layer",
//       type: "symbol",
//       source: "planes",
//       layout: {
//         "icon-image": "airport-15",
//         "icon-size": 1.2,
//         "icon-allow-overlap": true,
//         "icon-rotate": ["get", "direction"],
//         "icon-rotation-alignment": "map"
//       }
//     });
//   };
//
//   return <div className="map-frame" ref={mapContainer} />;
// };

export const MapFrame = () => {
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  // const icao: any[] = [];

  // React.useEffect(() => {
  //   if (!mapContainer.current) return;
  //
  //   const map = mapRef.current = new Map({
  //     container: mapContainer.current,
  //     style: 'https://americanamap.org/style.json',
  //     center: [15, 30],
  //     zoom: 1.4,
  //     maxZoom: 18,
  //     maxPitch: 85,
  //   });
  //
  //   map.addControl(
  //     new GeolocateControl({
  //       fitBoundsOptions: { maxZoom: 20 },
  //       positionOptions: { enableHighAccuracy: true },
  //       trackUserLocation: true,
  //     }),
  //   );
  //   map.addControl(new NavigationControl());
  //
  //   map.on('load', () => {
  //     // Источник данных для самолётов
  //     map.addSource("planes", {
  //       type: "geojson",
  //       data: {
  //         type: "FeatureCollection",
  //         features: []
  //       }
  //     });
  //
  //     // Слой для отображения самолётов
  //     map.addLayer({
  //       id: "planes-layer",
  //       type: "symbol",
  //       source: "planes",
  //       layout: {
  //         "icon-image": "oneway_black",  // стандартная иконка
  //         "icon-size": 1.2,
  //         "icon-allow-overlap": true,
  //         "icon-rotate": ["get", "direction"], // направление
  //         "icon-rotation-alignment": "map"
  //       }
  //     });
  //
  //     fetchPlanes();
  //     setInterval(fetchPlanes, 2000); // обновление каждые 10 секунд
  //   });
  // }, []);
  //
  // const fetchICAO = async () => {
  //   const url = 'https://flight-radar1.p.rapidapi.com/airlines/list';
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       'x-rapidapi-key': 'd6f394051bmsh7dd37d398817e93p1fa0a4jsn89e2993a4a51',
  //       'x-rapidapi-host': 'flight-radar1.p.rapidapi.com'
  //     }
  //   };
  //
  //   try {
  //     const response = await fetch(url, options);
  //     const data = await response.json();
  //     data.rows.forEach((row: any) => {
  //       if (icao.length > 20) return;
  //       icao.push(row.ICAO);
  //     });
  //     console.log(icao.join(','));
  //   } catch (e) {
  //     throw new Error(`API error: ${String(e)}`);
  //   }
  // };
  // fetchICAO();
  //
  // const fetchPlanes = async () => {
  //   const url = `https://flight-radar1.p.rapidapi.com/flights/list-by-airline?airline=KZN`;
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       'x-rapidapi-key': 'd6f394051bmsh7dd37d398817e93p1fa0a4jsn89e2993a4a51',
  //       'x-rapidapi-host': 'flight-radar1.p.rapidapi.com'
  //     }
  //   };
  //
  //   try {
  //     const response = await fetch(url, options);
  //     const data = await response.json();
  //     if (!data.aircraft || !mapRef.current) return;
  //
  //
  //     const geojson: any = {
  //       type: 'FeatureCollection',
  //       features: data.aircraft
  //         .filter((plane: any[]) => plane[3] && plane[2])
  //         .map((plane: any[]) => ({
  //           type: 'Feature',
  //           geometry: {
  //             type: 'Point',
  //             coordinates: [plane[3], plane[2]],
  //           },
  //           properties: {
  //             direction: plane[4] || 0,
  //             flight: plane[14],
  //             reg: plane[10],
  //             type: plane[9],
  //             airline: plane[19],
  //           },
  //         })),
  //     };
  //
  //     const source = mapRef.current.getSource('planes') as GeoJSONSource;
  //     source.setData(geojson);
  //   } catch (e) {
  //     throw new Error(`API error: ${String(e)}`);
  //   }
  // };

  React.useEffect(() => {
    if (!mapContainer.current) return;

    const map = (mapRef.current = new Map({
      container: mapContainer.current,
      style: 'https://americanamap.org/style.json',
      center: [10, 30],
      zoom: 2,
      maxZoom: 18,
    }));

    map.on('load', () => {
      // Добавляем источник
      map.addSource('planes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Слой самолётов
      map.addLayer({
        id: 'planes-layer',
        type: 'symbol',
        source: 'planes',
        layout: {
          'icon-image': 'airport-15',
          'icon-size': 1.3,
          'icon-allow-overlap': true,
          'icon-rotate': ['get', 'direction'],
          'icon-rotation-alignment': 'map',
        },
      });

      fetchPlanes();
      setInterval(fetchPlanes, 5000);
    });
  }, []);

  const fetchPlanes = async () => {
    const url = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json';
    const options = { method: 'GET' };

    try {
      // const res = await fetch(url);
      const res = await fetch(url, options);
      const data = await res.json();

      if (!data.acList || !mapRef.current) return;

      const planes = data.acList.filter((p: any) => p.Lat && p.Long);

      const geojson: any = {
        type: 'FeatureCollection',
        features: planes.map((p: any) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [p.Long, p.Lat],
          },
          properties: {
            callsign: p.Call,
            direction: p.Trak || 0,
            altitude: p.Alt,
            speed: p.Spd,
            type: p.Type,
            from: p.From,
            to: p.To,
          },
        })),
      };

      const source = mapRef.current.getSource('planes') as GeoJSONSource;
      source.setData(geojson);
    } catch (err) {
      throw new Error(`ADS-B API error: ${String(err)}`);
    }
  };

  return <div className="map-frame" ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
};
