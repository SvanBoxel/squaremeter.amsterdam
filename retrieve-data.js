const fetch = require("node-fetch");
const csv = require('csvtojson')
const fs = require('fs');

const neighborhoodGeometryInfoEndpoint = 'https://claircitydata.cbs.nl/dataset/689ded75-1a80-4259-b033-63913573c13a/resource/d02c5f12-1cfa-4d7c-91d3-41af8e4ed634/download/wijken_buurten.csv'
const main = async () => {
  const data = await fetch(neighborhoodGeometryInfoEndpoint);
  const text = await data.text();
  let json = await csv().fromString(text)

  const result = json.map(row => {
    return {
      name: row.subject,
      coordinates: JSON.parse(row.geojson).features[0].geometry.coordinates[0].map(coordinates => {
        return { lat: coordinates[1], lng: coordinates[0] }
      })
    }
  })

  fs.writeFile('./data/neighborhoods.json', JSON.stringify(result), function (err) {
    if (err) return console.log(err);
    console.log('done')
  });
}

main();