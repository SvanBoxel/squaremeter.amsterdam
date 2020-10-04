const fs = require("fs");
const fetch = require("node-fetch");
const csv = require("csvtojson");

const cityAreaDataInfoEndpoint =
  "https://maps.amsterdam.nl/open_geodata/geojson.php?KAARTLAAG=GEBIED_STADSDELEN&THEMA=gebiedsindeling";
const neighborhoodGeometryInfoEndpoint =
  "https://claircitydata.cbs.nl/dataset/689ded75-1a80-4259-b033-63913573c13a/resource/d02c5f12-1cfa-4d7c-91d3-41af8e4ed634/download/wijken_buurten.csv";

// Try these two data sets if you have time.
// const neighborhoodGeometryInfoEndpoint = "https://maps.amsterdam.nl/open_geodata/geojson.php?KAARTLAAG=GEBIED_BUURTEN&THEMA=gebiedsindeling"
// const priceData = "https://maps.amsterdam.nl/open_geodata/?k=52"

const retrieveAndWriteCityAreaInfo = async () => {
  console.log("⏳ Retrieving city area data...");
  const data = await fetch(cityAreaDataInfoEndpoint);
  const json = await data.json();
  console.log("✅ Retrieved city data");
  console.log("⏳ Saving city data");
  fs.writeFile("./data/cityarea.json", JSON.stringify(json), (err) => {
    if (err) return console.log(err);
    console.log("✅ Saved city data");
  });
};

const retrieveAndWriteNeighborhoodData = async () => {
  console.log("⏳ Retrieving neighborhood data...");
  const data = await fetch(neighborhoodGeometryInfoEndpoint);
  const text = await data.text();
  const json = await csv().fromString(text);

  console.log("⏳ Parsing neighborhood data...");

  const result = json.map((row) => {
    return {
      name: row.subject,
      coordinates: JSON.parse(
        row.geojson
      ).features[0].geometry.coordinates[0].map((coordinates) => {
        return { lat: coordinates[1], lng: coordinates[0] };
      }),
    };
  });

  console.log("✅ Retrieved neighborhood data");
  console.log("⏳ Saving neighborhood data...");

  fs.writeFile("./data/neighborhoods.json", JSON.stringify(result), (err) => {
    if (err) return console.log(err);
    console.log("✅ Saved neighborhood data");
  });
};

(async () => {
  await retrieveAndWriteCityAreaInfo();
  await retrieveAndWriteNeighborhoodData();
})();
