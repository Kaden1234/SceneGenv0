let map = L.map('map').setView([39.5, -98.35], 5); // Center on USA

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let box = null;
let corners = [];

map.on('click', function (e) {
  if (corners.length < 2) {
    corners.push([e.latlng.lat, e.latlng.lng]);
    if (corners.length === 2) {
      drawBox();
    }
  }
});

function drawBox() {
  if (box) map.removeLayer(box);
  box = L.rectangle([corners[0], corners[1]], { color: "blue", weight: 2 }).addTo(map);
}

function exportData() {
  if (corners.length !== 2) {
    alert("Click two corners to define a box first.");
    return;
  }

  let exportObj = {
    bounds: corners,
    elevation: [],   // Placeholder
    water: [],       // Placeholder
    roads: [],       // Placeholder
    buildings: []    // Placeholder
  };

  let blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'map_export.json';
  a.click();
}
