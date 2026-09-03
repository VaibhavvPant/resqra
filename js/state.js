// ==================== APP STATE ====================
let currentUser = null;
let currentScreen = 'login';
let selectedRequestId = null;
let rescueListener = null;
let photoFile = null;
let photoPreviewUrl = null;

const RESCUE_STATUS = ['Pending', 'Accepted', 'Volunteer Assigned', 'Rescue In Progress', 'Rescued'];

// ==================== HELPERS ====================
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'absolute';
  toast.style.bottom = '90px';
  toast.style.left = '20px';
  toast.style.right = '20px';
  toast.style.background = '#1e2d27';
  toast.style.color = 'white';
  toast.style.padding = '12px 18px';
  toast.style.borderRadius = '40px';
  toast.style.fontSize = '0.9rem';
  toast.style.zIndex = '999';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  toast.style.textAlign = 'center';
  document.getElementById('appContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
