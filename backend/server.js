import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/adsb", async (req, res) => {
  try {
    const url = "https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json";

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.listen(3001, () =>
  console.log("ADS-B proxy running on http://localhost:3001/adsb")
);