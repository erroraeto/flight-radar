import fetch from 'node-fetch';

export async function handler(event: any) {
  try {
    const lat = event.queryStringParameters?.lat;
    const lon = event.queryStringParameters?.lon;
    const dist = event.queryStringParameters?.dist || 50;

    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid lat/lon' }),
      };
    }

    const response = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
}
