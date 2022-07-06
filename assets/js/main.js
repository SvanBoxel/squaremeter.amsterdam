let map;
let selectedYear;

const DEFAULT_YEAR = 2021;
const data_folder = './data';

const AMSTERDAM_BOUNDS = {
  north: 52.5,
  south: 52.0,
  west: 4.7,
  east: 5.1,
};

const yearData = {
  2018: [
    { lower_bound: 0,  higher_bound: 1926, color: "#002070" },
    { lower_bound: 1924,  higher_bound: 2565, color: "#003DD7" },
    { lower_bound: 2565, higher_bound: 3207, color: "#0098FF" },
    { lower_bound: 3207, higher_bound: 3949, color:  "#09c2eb"},
    { lower_bound: 3949, higher_bound: 3848, color: "#11FFEB" },
    { lower_bound: 3848, higher_bound: 4490, color: "#9AFF00" },
    { lower_bound: 4490, higher_bound: 5131, color: "#FFFF00" },
    { lower_bound: 5131, higher_bound: 6415, color: "#FF8000" },
    { lower_bound: 6415, higher_bound: 7698, color: "#FF0000" },
    { lower_bound: 7698, higher_bound: 15000, color: "#990000" }
  ],
  2019: [
    { lower_bound: 1975,  higher_bound: 2632, color: "#003DD7" },
    { lower_bound: 2632, higher_bound: 3291, color: "#0098FF" },
    { lower_bound: 3291, higher_bound: 3949, color: "#09c2eb"},
    { lower_bound: 3949, higher_bound: 4608, color: "#13FFEB" },
    { lower_bound: 4608, higher_bound: 5266, color: "#9AFF00" },
    { lower_bound: 5266, higher_bound: 5925, color: "#FFFF00" },
    { lower_bound: 5925, higher_bound: 6484, color: "#FF8000" },
    { lower_bound: 6484, higher_bound: 7900, color: "#FF0000" },
    { lower_bound: 7900, higher_bound: 15000, color: "#990000" }
  ],
  2020: [
    { lower_bound: 1999, higher_bound: 2666, color: "#002070" },
    { lower_bound: 2666, higher_bound: 3333, color: "#003DD7" },
    { lower_bound: 3333, higher_bound: 4000, color: "#0098FF" },
    { lower_bound: 4000, higher_bound: 4667, color: "#13FFEB" },
    { lower_bound: 4667, higher_bound: 5333, color: "#9AFF00" },
    { lower_bound: 5333, higher_bound: 6000, color: "#FFFF00" },
    { lower_bound: 6000, higher_bound: 6667, color: "#FF8000" },
    { lower_bound: 6667, higher_bound: 8001, color: "#FF0000" },
    { lower_bound: 8001, higher_bound: 9999, color: "#990000" },
    { lower_bound: 9999, higher_bound: 20000, color:"#820099" }
  ],
  2021: [
    { lower_bound: 2738, higher_bound: 3422, color: "#003DD7"},
    { lower_bound: 3422, higher_bound: 4107, color: "#0098FF" },
    { lower_bound: 4107, higher_bound: 4792, color: "#13FFEB" },
    { lower_bound: 4792, higher_bound: 5476, color: "#9AFF00" },
    { lower_bound: 5476, higher_bound: 6160, color: "#FFFF00" },
    { lower_bound: 6160, higher_bound: 6846, color: "#FF8000" },
    { lower_bound: 6846, higher_bound: 8215, color: "#FF0000" },
    { lower_bound: 8215, higher_bound: 10269, color: "#990000" },
    { lower_bound: 10269, higher_bound: 20000, color: "#820099" }
  ],  
}

const items = [
  {
    name: "stroofwafels",
    asset: "./assets/img/stroopwafel.png",
    area: Math.pow(0.085 / 2, 2) * Math.PI,
  },
  {
    name: "croquettes",
    asset: "./assets/img/kroket.png",
    area: 0.105 * 0.035,
  },
  {
    name: "Delft blue tiles",
    asset: "./assets/img/tegel.png",
    area: 0.11 * 0.11,
  },
  {
    name: "tompouces",
    asset: "./assets/img/tompouce.png",
    area: 0.1 * 0.05,
  },
];

const priceBlock = document.getElementById("price");
const neighborhoodBlock = document.getElementById("neighborhood");
const hundredBuysYouBlock = document.getElementById("hundredBuysYou");
const visualisationBlock = document.getElementById("visualisation");
const polygons = [];


function getPriceDataSources(year = DEFAULT_YEAR) {
  return Array(10).fill(null).map((val, index) => {
    return `${data_folder}/prices_${year}/price_data_${String(index+1).padStart(2, '0')}.json`;
  })
}

function addPolygonToMap(polygon, type, properties) {
  polygon.type = type;
  Object.keys(properties).forEach(
    (property) => (polygon[property] = properties[property])
  );
  polygons.push(polygon);
  polygon.setMap(map);
}

function showData(e) {
  const results = polygons.filter((polygon) =>
    google.maps.geometry.poly.containsLocation(e.latLng, polygon)
  );
  const area = results.find((result) => result.type === "cityArea");
  const neighborhood = results
    .reverse()
    .find((result) => result.type === "neighborhood");
  
  const price = results.find((result) => result.type === "pricePolygon");

  neighborhoodBlock.innerText = `${neighborhood.name} (${area.name})`;
  visualisationBlock.innerText = "";
  hundredBuysYouBlock.innerText = "";

  if (price) {
    const hundredBuysYou = ((1 / parseInt(price.price)) * 100).toFixed(3);
    const item = items[Math.floor(Math.random() * items.length)];
    const itemCount = hundredBuysYou / item.area;
    const visualisationArray = [];

    for (let i = 1; i <= Math.ceil(itemCount); i++) {
      const image = document.createElement("img");
      image.src = item.asset;
      image.classList.add("item");
      visualisationArray.push(image);

      if (i === Math.ceil(itemCount)) {
        image.style.width = `${(itemCount % 1) * 100}px`;
      }
    }

    priceBlock.innerHTML = `You pay <strong>€${price.price}</strong> per square meter.`;
    hundredBuysYouBlock.innerText = `€100 buys you an area of ${hundredBuysYou}m2 or:`;
    visualisationArray.forEach((element) => {
      visualisationBlock.append(element);
    });
    const visualisationInfo = document.createElement("p");
    visualisationInfo.innerHTML = `An area the size of ${(
      hundredBuysYou / item.area
    ).toFixed(3)} ${item.name}.`;
    visualisationBlock.append(visualisationInfo);
  } else {
    priceBlock.innerText = "Square meter price unknown.";
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    fullscreenControl: false,
    center: {
      lat: 52.35,
      lng: 4.9,
    },
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    restriction: {
      latLngBounds: AMSTERDAM_BOUNDS,
      strictBounds: false,
    },
  });
  drawCityArea();
  drawNeighborhoods();
  const dataSources = getPriceDataSources();
  drawPricePolygons(dataSources);
}

function drawCityArea() {
  fetch("./data/cityarea.json")
    .then((data) => data.json())
    .then((json) => {
      json.features.forEach((area) => {
        const coordinates = area.geometry.coordinates[0].map((coo) => ({
          lat: coo[1],
          lng: coo[0],
        }));
        const cityArea = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: "#ff0000",
          strokeOpacity: 0.25,
          strokeWeight: 1,
          fillColor: "#0000ff",
          fillOpacity: 0,
        });

        addPolygonToMap(cityArea, "cityArea", {
          name: area.properties.Stadsdeel,
        });
      });
    });
}

function drawNeighborhoods() {
  fetch("./data/neighborhoods.json")
    .then((data) => data.json())
    .then((json) => {
      json.forEach((area) => {
        const coordinates = area.coordinates;
        const neighborhood = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: "#0000ff",
          strokeOpacity: 0.25,
          strokeWeight: 1,
          fillOpacity: 0,
        });

        addPolygonToMap(neighborhood, "neighborhood", { name: area.name });
      });
    });
}

const dataRegex = /(],\[)|(\[{2,4})|(]{2,3})/g;
function drawPricePolygons(dataSources) {
  Promise.all(dataSources.map((url) => fetch(url)))
    .then((promiseData) => Promise.all(promiseData.map((data) => data.json())))
    .then((json) => {
      priceData = json.flat().map((area) => {
        if (area.LABEL == "&lt; 1925") {
          area.price = 1924
        } else {
          area.price = area.SELECTIE || Number(area.LABEL.match(/^\d+|\d+\b|\d+(?=\w)/g)[0])
        }

        return area;
      });

 
      const year = selectedYear || DEFAULT_YEAR
      console.log(priceData)
      generateCSSGradient(yearData[year].map(({color}) => color))
      document.getElementById("priceMax").innerText = htmlDecode(priceData.reduce((max, area) => max.price > area.price ? max : area).LABEL);
      document.getElementById("priceMin").innerText = htmlDecode(priceData.reduce((max, area) => max.price < area.price ? max : area).LABEL);


      priceData.forEach((area) => {
        // Geo string is differently formatted per data
        const coordinates = (area.COORDS || area.WKT).replace(dataRegex, "|").split("|")
          .filter((el) => el.length > 3)
          .map((coordinate) => {
            const coords = coordinate.split(",");

            // Lat lng order differs per data set
            let lat = parseFloat(coords[0]);
            let lng = parseFloat(coords[1]);

            if (lat < 10 ) {
              return { lng: lat, lat: lng };
            }

            return { lng, lat };
          });

        const color = yearData[year].find(
          ({lower_bound, higher_bound}) =>
            area.price >= lower_bound &&
            area.price <= higher_bound
        ).color;

        const pricePolygonOptions = {
          paths: coordinates,
          strokeColor: color,
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: color || '#ffffff',
          fillOpacity: 0.6,
          zIndex: 100,
        };

        const pricePolygon = new google.maps.Polygon(pricePolygonOptions);
        addPolygonToMap(pricePolygon, "pricePolygon", { price: area.price, label: area.LABEL }); 
        google.maps.event.addListener(pricePolygon, "mouseover", showData);
      });


    });
}

function generateCSSGradient(colors) {
  const toValue = (color, index) => `${color} ${100/(colors.length) * (index + 1)}%,`

  const value = `
  linear-gradient(
    to bottom, 
    ${colors.map(toValue).join(``).slice(0, -1)}
  )`

  document.getElementById("priceGradient").style.backgroundImage = value;
}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}

document.getElementById("updateYear").onchange = function(){
  var value = document.getElementById("updateYear").value;
  selectedYear = value;
  const oldPolygons = [...polygons]

  const dataSources = getPriceDataSources(value);
  for (polygon of oldPolygons) {
    polygon.setMap(null)
  }

  drawPricePolygons(dataSources);
};