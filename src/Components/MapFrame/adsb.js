import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const lat = event.queryStringParameters?.lat;
    const lon = event.queryStringParameters?.lon;
    const dist = event.queryStringParameters?.dist;

    if (!lat || !lon) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Invalid lat/lon" }),
      };
    }

    const response = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`);
    const data = await response.json();

    return {
      status: 200,
      body: JSON.stringify({data}),
    };
  } catch (error) {
    return {
      status: 500,
      body: JSON.stringify({error: "server error"}),
    }
  }
}