// ==================== MAP (Leaflet, India-centered) ====================
// Default center: geographic center of India
const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };
const INDIA_DEFAULT_ZOOM = 5;

let reportMapInstance = null;
let reportMarker = null;
let reportLat = null;
let reportLng = null;

let rescuesMapInstance = null;
let rescuesMapMarkers = [];

// ---------- Report screen: tap-to-pin geotagging map ----------
function initReportMap() {
  const mapEl = document.getElementById('reportMap');
  if (!mapEl) return;

  // Clean up any previous instance (screen re-renders create a fresh div)
  if (reportMapInstance) {
    reportMapInstance.remove();
    reportMapInstance = null;
    reportMarker = null;
  }

  reportMapInstance = L.map('reportMap').setView([INDIA_CENTER.lat, INDIA_CENTER.lng], INDIA_DEFAULT_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(reportMapInstance);

  reportMapInstance.on('click', (e) => {
    setReportMarker(e.latlng.lat, e.latlng.lng);
  });
}

function setReportMarker(lat, lng) {
  reportLat = lat;
  reportLng = lng;

  if (reportMarker) {
    reportMarker.setLatLng([lat, lng]);
  } else {
    reportMarker = L.marker([lat, lng], { draggable: true }).addTo(reportMapInstance);
    reportMarker.on('dragend', () => {
      const pos = reportMarker.getLatLng();
      reportLat = pos.lat;
      reportLng = pos.lng;
      updateReportCoordsLabel();
    });
  }

  reportMapInstance.setView([lat, lng], Math.max(reportMapInstance.getZoom(), 12));
  updateReportCoordsLabel();
}

function updateReportCoordsLabel() {
  const label = document.getElementById('reportCoordsLabel');
  if (label && reportLat != null && reportLng != null) {
    label.textContent = `📍 Pinned: ${reportLat.toFixed(4)}, ${reportLng.toFixed(4)}`;
  }
}

// ---------- Rescues screen: map view of all active rescues ----------
function initRescuesMap(rescues) {
  const mapEl = document.getElementById('rescuesMap');
  if (!mapEl) return;

  if (rescuesMapInstance) {
    rescuesMapInstance.remove();
    rescuesMapInstance = null;
    rescuesMapMarkers = [];
  }

  rescuesMapInstance = L.map('rescuesMap').setView([INDIA_CENTER.lat, INDIA_CENTER.lng], INDIA_DEFAULT_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(rescuesMapInstance);

  const bounds = [];

  rescues.forEach((req) => {
    if (typeof req.latitude !== 'number' || typeof req.longitude !== 'number') return;

    const severityColor = req.severity === 'Critical' ? '#c9322b'
      : req.severity === 'Medium' ? '#b54708'
      : '#1e5c3f';

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${severityColor};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker([req.latitude, req.longitude], { icon }).addTo(rescuesMapInstance);
    marker.bindPopup(`
      <strong>${req.animalType} • ${req.condition}</strong><br>
      ${req.location}<br>
      <span style="color:${severityColor};font-weight:600;">${req.severity}</span> · ${req.status}<br>
      <button style="margin-top:6px;padding:4px 10px;border-radius:10px;border:none;background:#1e5c3f;color:white;cursor:pointer;" onclick="window.renderRescueDetails('${req.id}')">View details</button>
    `);

    rescuesMapMarkers.push(marker);
    bounds.push([req.latitude, req.longitude]);
  });

  if (bounds.length > 0) {
    rescuesMapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  }
}
