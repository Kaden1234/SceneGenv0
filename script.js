let map = L.map('map').setView([39.5, -98.35], 5); // USA center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let drawnBox = null;
let drawControl = new L.Control.Draw({
  draw: {
    polygon: false,
    polyline: false,
    circle: false,
    marker: false,
    circlemarker: false,
    rectangle: {
      shapeOptions: {
        color: 'blue'
      }
    }
  },
  edit: {
    featureGroup: new L.FeatureGroup().addTo(map),
    remove: true
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
  if (drawnBox)
