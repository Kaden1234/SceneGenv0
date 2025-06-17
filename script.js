// script.js

// Initialize the map, centered on USA
const map = L.map('map').setView([39.5, -98.35], 5);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// FeatureGroup to store drawn shapes (rectangles)
const drawnItems = new L.FeatureGroup().addTo(map);

// Prepare Leaflet.Draw control but do not add to map until draw mode is toggled on
const drawControl = new L.Control.Draw({
  draw: {
    rectangle: {
      shapeOptions: { color: 'blue' }
    },
    // disable other shapes
    polygon: false,
    polyline: false,
    circle: false,
    marker: false,
    circlemarker: false
  },
  edit: {
    featureGroup: drawnItems,
    edit: true,
    remove: false  // we'll handle erase via our own button
  }
});

// Track whether draw mode is active
let drawingActive = false;

// Get references to buttons (ensure these IDs exist in your HTML)
const drawToggleBtn = document.getElementById('drawToggleBtn');
const eraseBtn = document.getElementById('eraseBtn');
const exportBtn = document.getElementById('exportBtn');

// Toggle draw mode: add/remove the draw control
drawToggleBtn.addEventListener('click', () => {
  if (!drawingActive) {
    map.addControl(drawControl);
    drawToggleBtn.classList.add('active');
  } else {
    map.removeControl(drawControl);
    drawToggleBtn.classList.remove('active');
  }
  drawingActive = !drawingActive;
});

// When a shape is created via Draw, add it to drawnItems, then exit draw mode
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  if (drawingActive) {
    map.removeControl(drawControl);
    drawToggleBtn.classList.remove('active');
    drawingActive = false;
  }
});

// Erase All: clear all drawn shapes
eraseBtn.addEventListener('click', () => {
  drawnItems.clearLayers();
});

// Export Map Data: for each rectangle, compute corners, center, area
exportBtn.addEventListener('click', () => {
  const layers = drawnItems.getLayers();
  if (layers.length === 0) {
    alert('Draw some rectangles first.');
    return;
  }

  const exportArray = [];

  layers.forEach(layer => {
    if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      const northWest = L.latLng(bounds.getNorth(), bounds.getWest());
      const southEast = L.latLng(bounds.getSouth(), bounds.getEast());
      const center = bounds.getCenter();

      // Approximate width/height in meters
      const widthMeters = southWest.distanceTo(southEast);
      const heightMeters = southWest.distanceTo(northWest);
      const areaM2 = widthMeters * heightMeters;

      exportArray.push({
        type: "rectangle",
        corners: {
          northWest: [northWest.lat, northWest.lng],
          northEast: [northEast.lat, northEast.lng],
          southWest: [southWest.lat, southWest.lng],
          southEast: [southEast.lat, southEast.lng]
        },
        center: [center.lat, center.lng],
        areaSquareMeters: areaM2
      });
    }
    else if (layer instanceof L.Polygon) {
      // In case user edited rectangle into polygon or you add polygon support
      const coords = layer.getLatLngs().flat(Infinity).map(ll => [ll.lat, ll.lng]);
      exportArray.push({
        type: "polygon",
        coordinates: coords
      });
    }
    // else: ignore other types
  });

  // Create and download JSON
  const blob = new Blob([JSON.stringify(exportArray, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'map_export.json';
  a.click();
});
