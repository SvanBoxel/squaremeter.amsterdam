console.log(1);
let map;
    
const AMSTERDAM_BOUNDS = {
  north: 52.5,
  south: 52.0,
  west: 4.7,
  east: 5.1,
};

const priceBlock = document.getElementById('price');
const cityAreaBlock = document.getElementById('cityarea');
const neighborhoodBlock = document.getElementById('neighborhood');
const polygons = [];

function resetInfo() {
  cityAreaBlock.innerText = "";
  neighborhoodBlock.innerText= "";
  priceBlock.innerText = "";
} 

function initMap() {
  console.log(2)
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 52.35, lng: 4.9},
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    restriction: {
      latLngBounds: AMSTERDAM_BOUNDS,
      strictBounds: false,
    },
  });
  
  drawCityArea();
  drawNeighborhoods();
  drawPricePolygons();
}

function drawCityArea() {
  fetch('./data/cityarea.json')
  .then(data => data.json())
  .then(json => {
    json.features.forEach(area => {
      const coordinates = area.geometry.coordinates[0].map(coo => ({ lat: coo[1], lng: coo[0] }))
      const cityArea = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: '#ff0000',
        strokeOpacity: 0.25,
        strokeWeight: 1,
        fillColor: '#0000ff',
        fillOpacity: 0
      });

      cityArea.name = area.properties.Stadsdeel;
      cityArea.type = 'cityArea'
      polygons.push(cityArea)
      cityArea.setMap(map);
    })
  })
}

const price_data = [
  './data/prices_2018/price_data_01.json',
  './data/prices_2018/price_data_02.json',
  './data/prices_2018/price_data_03.json',
  './data/prices_2018/price_data_04.json',
  './data/prices_2018/price_data_05.json',
  './data/prices_2018/price_data_06.json',
  './data/prices_2018/price_data_07.json',
  './data/prices_2018/price_data_08.json',
  './data/prices_2018/price_data_09.json',
  './data/prices_2018/price_data_10.json'
];
const colors = [
  {
    lower_bound: 0,
    higher_bound: 1925,
    color: '#002070'
  },
  {
    lower_bound: 1925,
    higher_bound: 2566,
    color: '#003DD7'
  },
  {
    lower_bound: 2566,
    higher_bound: 3208,
    color: '#0098FF'
  },
  {
    lower_bound: 3208,
    higher_bound: 3489,
    color: '#13FFEB'
  },
  {
    lower_bound: 3489,
    higher_bound: 4491,
    color: '#9AFF00'
  },
  {
    lower_bound: 4491,
    higher_bound: 5132,
    color: '#FFFF00'
  },
  {
    lower_bound: 5132,
    higher_bound: 5774,
    color: '#FF8000'
  },
  {
    lower_bound: 5774,
    higher_bound: 6416,
    color: '#FF0000'
  },
  {
    lower_bound: 6416,
    higher_bound: 7699,
    color: '#990000'
  },
  {
    lower_bound: 7699,
    higher_bound: 12000,
    color: '#4A0606'
  }
]

function drawNeighborhoods() {
  fetch('./data/neighborhoods.json')
  .then(data => data.json())
  .then(json => {
    json.forEach(area => {
      const coordinates = area.coordinates;
      const neighborhood = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: '#0000ff',
        strokeOpacity: 0.25,
        strokeWeight: 1,
        fillOpacity: 0
      });
      
      neighborhood.name = area.name;
      neighborhood.type = 'neighborhood'
      polygons.push(neighborhood)
      neighborhood.setMap(map);

//          google.maps.event.addListener(neighborhood, 'mouseover', resetInfo)
    })
  })
}

function drawPricePolygons() {
  Promise.all(price_data.map(url => fetch(url)))
  .then(promiseData => Promise.all(promiseData.map(data => data.json())))
  .then(json => {
    json
    .flat()
    .forEach(area => {
      const coordinates = area.COORDS
      .split('|')
      .filter((el) => el != "")
      .map(coordinate => {
        const [lng, lat] = coordinate.split(',');
        return { lng: parseFloat(lng), lat: parseFloat(lat) };
      })
      
      const { color } = colors.find((color) => area.SELECTIE >= color.lower_bound && area.SELECTIE <= color.higher_bound);

      pricePolygonOptions = {
        paths: coordinates,
        strokeColor: color,
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.6,
        zIndex: 100
      }

      const pricePolygon = new google.maps.Polygon(pricePolygonOptions);
      
      pricePolygon.price = area.SELECTIE;
      pricePolygon.type = 'pricePolygon'
      polygons.push(pricePolygon)
      pricePolygon.setMap(map);

      google.maps.event.addListener(pricePolygon, 'mouseover', (e) => {
        const results = polygons.filter(polygon =>  google.maps.geometry.poly.containsLocation(e.latLng, polygon))
       
        const area = results.find(result => result.type === 'cityArea')
        const neighborhood = results.reverse().find(result => result.type === 'neighborhood')
        const price = results.find(result => result.type === 'pricePolygon')

        cityAreaBlock.innerText = area.name;
        neighborhoodBlock.innerText= neighborhood.name;
        priceBlock.innerText = price ? price.price : "Unknown"
      })
    })
  })
}