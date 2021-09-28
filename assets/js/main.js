let map;

const AMSTERDAM_BOUNDS = {
  north: 52.5,
  south: 52.0,
  west: 4.7,
  east: 5.1,
};

const DEFAULT_YEAR = 2019;
const data_folder = './data';

const colors = [
  {
    lower_bound: 0,
    higher_bound: 1976,
    color: "#002070",
  },
  {
    lower_bound: 1976,
    higher_bound: 2633,
    color: "#003DD7",
  },
  {
    lower_bound: 2633,
    higher_bound: 3292,
    color: "#0098FF",
  },
  {
    lower_bound: 3292,
    higher_bound: 3950,
    color: "#13FFEB",
  },
  {
    lower_bound: 3950,
    higher_bound: 4609,
    color: "#9AFF00",
  },
  {
    lower_bound: 4609,
    higher_bound: 5267,
    color: "#FFFF00",
  },
  {
    lower_bound: 5267,
    higher_bound: 5926,
    color: "#FF8000",
  },
  {
    lower_bound: 5926,
    higher_bound: 6585,
    color: "#FF0000",
  },
  {
    lower_bound: 6585,
    higher_bound: 7901,
    color: "#990000",
  },
  {
    lower_bound: 7901,
    higher_bound: 8120,
    color: "#4A0606",
  },
    {
    lower_bound: 8120,
    higher_bound: 15000,
    color: "#1A0202",
  },
];



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
    console.log(neighborhood)
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
  // drawNeighborhoods();
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
      json.flat().forEach((area) => {
        const coordinates = (area.COORDS || area.WKT).replace(dataRegex, "|").split("|")
          .filter((el) => el.length > 3)
          .map((coordinate) => {
            const coords = coordinate.split(",");
            let lat = parseFloat(coords[0]);
            let lng = parseFloat(coords[1]);

            if (lat < 10 ) {
              return { lng: lat, lat: lng };
            }

            return { lng, lat };
          });

        const price = area.SELECTIE || Number(area.LABEL.replace(/\D/g, "").substring(0, 4));
        const color = colors.find(
          (color) =>
            price >= color.lower_bound &&
            price <= color.higher_bound
        ).color || "";

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
        addPolygonToMap(pricePolygon, "pricePolygon", { price: area.SELECTIE });
        google.maps.event.addListener(pricePolygon, "mouseover", showData);
      });
    });
}
