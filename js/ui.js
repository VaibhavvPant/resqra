// ==================== UI RENDERING ====================
function renderLogin() {
  currentScreen = 'login';
  document.getElementById('bottomNav').classList.add('hidden');
  const container = document.getElementById('screenContainer');
  container.innerHTML = `
    <div class="card" style="margin-top: 30px;">
      <div class="logo-small"><i class="fas fa-paw" style="color:#1e5c3f;"></i> <span>ResQra</span></div>
      <p style="margin-top:5px; color:#6b7f74;">Every Rescue Starts With You.</p>
    </div>
    <div class="card">
      <h2 style="margin-bottom:10px;">Login</h2>
      <label>Email</label>
      <input type="email" id="loginEmail" placeholder="you@example.com" value="demo@resqra.com">
      <label>Password</label>
      <input type="password" id="loginPassword" placeholder="••••••" value="demo123">
      <button class="btn btn-primary btn-block" id="loginBtn"><i class="fas fa-sign-in-alt"></i> Login</button>
      <button class="btn btn-secondary btn-block" id="demoLoginBtn" style="margin-top:12px;"><i class="fas fa-user-check"></i> Continue as Demo User</button>
    </div>
    <div class="card" style="text-align:center;">
      <span class="text-muted">Don't have an account?</span>
      <button class="btn btn-outline btn-sm" id="showSignupBtn" style="margin-left:8px;">Sign up</button>
    </div>
    <div id="signupSection" class="card hidden">
      <h3>Create Account</h3>
      <label>Full Name</label>
      <input type="text" id="signupName" placeholder="Your name">
      <label>Email</label>
      <input type="email" id="signupEmail" placeholder="you@example.com">
      <label>Password</label>
      <input type="password" id="signupPassword" placeholder="Create password">
      <label>Role</label>
      <select id="signupRole">
        <option value="Citizen">Citizen</option>
        <option value="Volunteer">Volunteer</option>
      </select>
      <button class="btn btn-primary btn-block" id="signupBtn"><i class="fas fa-user-plus"></i> Sign up</button>
    </div>
  `;

  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) {
      showToast('Enter email and password');
      return;
    }
    const user = await signIn(email, password);
    if (user) onAuthSuccess(user);
  });

  document.getElementById('demoLoginBtn').addEventListener('click', async () => {
    await signInAsDemo();
  });

  document.getElementById('showSignupBtn').addEventListener('click', () => {
    document.getElementById('signupSection').classList.toggle('hidden');
  });

  document.getElementById('signupBtn').addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    if (!name || !email || !password) {
      showToast('Fill all fields');
      return;
    }
    const user = await signUp(email, password, name, role);
    if (user) onAuthSuccess(user);
  });
}

async function onAuthSuccess(user) {
  currentUser = user;
  const userData = await getUserData(user.uid);
  currentUser.role = userData?.role || 'Citizen';
  currentUser.profileImage = userData?.profileImage || '👤';

  document.getElementById('bottomNav').classList.remove('hidden');
  setActiveNav('home');
  renderHome();
}

function renderHome() {
  const container = document.getElementById('screenContainer');
  const userName = currentUser.displayName?.split(' ')[0] || 'Friend';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h2>Hello 👋</h2>
      <span class="badge"><i class="fas fa-shield-alt"></i> ${currentUser.role}</span>
    </div>
    <p class="text-muted" style="margin-bottom:18px;">Help an animal in need.</p>

    <div class="card emergency-card">
      <p style="font-weight:700; font-size:1.2rem;">🐾 See an animal that needs help?</p>
      <p style="margin:8px 0;">Report it now and connect it with nearby volunteers.</p>
      <button class="btn btn-secondary btn-block" id="reportNowBtn"><i class="fas fa-bullhorn"></i> Report Now</button>
    </div>

    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
      <span class="stat-badge"><i class="fas fa-paw" style="color:#1e5c3f;"></i> <span id="statRescued">0</span> Rescued</span>
      <span class="stat-badge"><i class="fas fa-users"></i> <span id="statVolunteers">0</span> Volunteers</span>
      <span class="stat-badge"><i class="fas fa-hourglass-half"></i> <span id="statOpen">0</span> Open</span>
    </div>

    <h3 style="margin:16px 0 10px;">Nearby rescue cases</h3>
    <div id="nearbyRescues"><div class="loading-spinner"></div> Loading rescues...</div>

    <button class="btn btn-outline btn-sm btn-block" id="viewAllRescuesHome">View all rescues</button>
  `;

  document.getElementById('reportNowBtn').addEventListener('click', () => navigateTo('report'));
  document.getElementById('viewAllRescuesHome').addEventListener('click', () => navigateTo('rescues'));

  // Load stats and nearby rescues
  loadStats();
  loadNearbyRescues();
}

async function loadStats() {
  try {
    const [rescuedCount, volunteersCount, openCount] = await Promise.all([
      db.collection('rescues').where('status', '==', 'Rescued').get(),
      db.collection('users').where('role', '==', 'Volunteer').get(),
      db.collection('rescues').where('status', '==', 'Pending').get()
    ]);

    document.getElementById('statRescued').textContent = rescuedCount.size;
    document.getElementById('statVolunteers').textContent = volunteersCount.size;
    document.getElementById('statOpen').textContent = openCount.size;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function loadNearbyRescues() {
  const container = document.getElementById('nearbyRescues');

  listenToRescues((rescues) => {
    const pending = rescues.filter(r => r.status === 'Pending').slice(0, 3);

    if (pending.length === 0) {
      container.innerHTML = '<p class="text-muted">No active rescue requests nearby</p>';
      return;
    }

    container.innerHTML = pending.map(req => `
      <div class="card" style="padding:14px; cursor:pointer;" onclick="window.selectedRequestId='${req.id}'; window.renderRescueDetails('${req.id}')">
        <div style="display:flex; justify-content:space-between;">
          <span>🐕 ${req.animalType} • ${req.condition}</span>
          <span class="badge severity-${req.severity.toLowerCase()}">${req.severity}</span>
        </div>
        <p><i class="fas fa-map-marker-alt"></i> ${req.location} • <span>${formatTimestamp(req.createdAt)}</span></p>
        <span class="status-chip status-pending">${req.status}</span>
      </div>
    `).join('');
  });
}

let rescuesViewMode = 'list'; // 'list' or 'map'

function renderRescues() {
  const container = document.getElementById('screenContainer');
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2>📍 Rescue Requests</h2>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-sm ${rescuesViewMode === 'list' ? 'btn-primary' : 'btn-outline'}" id="listViewBtn"><i class="fas fa-list"></i></button>
        <button class="btn btn-sm ${rescuesViewMode === 'map' ? 'btn-primary' : 'btn-outline'}" id="mapViewBtn"><i class="fas fa-map"></i></button>
      </div>
    </div>
    <p class="text-muted" style="margin-bottom:12px;">Nearby animals needing help across India</p>
    <div id="rescueViewContainer">
      ${rescuesViewMode === 'map'
        ? '<div id="rescuesMap" style="width:100%; height:400px; border-radius:20px; overflow:hidden;"></div>'
        : '<div id="rescueList"><div class="loading-spinner"></div> Loading...</div>'}
    </div>
  `;

  document.getElementById('listViewBtn').addEventListener('click', () => {
    rescuesViewMode = 'list';
    renderRescues();
  });
  document.getElementById('mapViewBtn').addEventListener('click', () => {
    rescuesViewMode = 'map';
    renderRescues();
  });

  listenToRescues((rescues) => {
    if (rescuesViewMode === 'map') {
      initRescuesMap(rescues);
      return;
    }

    const listContainer = document.getElementById('rescueList');
    if (!listContainer) return;

    if (rescues.length === 0) {
      listContainer.innerHTML = '<p class="text-muted">No rescue requests yet</p>';
      return;
    }

    listContainer.innerHTML = rescues.map(req => `
      <div class="card" style="padding:16px; cursor:pointer;" onclick="window.selectedRequestId='${req.id}'; window.renderRescueDetails('${req.id}')">
        <div style="display:flex; gap:12px; align-items:center;">
          ${req.image ? `<img src="${req.image}" style="width:60px;height:60px;border-radius:20px;object-fit:cover;" alt="animal">` : '<div style="width:60px;height:60px;background:#eef3ef;border-radius:20px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-paw" style="font-size:2rem;color:#6b7f74;"></i></div>'}
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between;">
              <strong>${req.animalType} ${req.condition}</strong>
              <span class="badge severity-${req.severity.toLowerCase()}">${req.severity}</span>
            </div>
            <p class="text-muted"><i class="fas fa-location-dot"></i> ${req.location} • ${formatTimestamp(req.createdAt)}</p>
            <span class="status-chip status-${req.status.toLowerCase().replace(' ', '-')}">${req.status}</span>
          </div>
        </div>
      </div>
    `).join('');
  });
}

function renderRescueDetails(requestId) {
  const container = document.getElementById('screenContainer');
  container.innerHTML = `<div class="loading-spinner"></div> Loading details...`;

  db.collection('rescues').doc(requestId).get().then((doc) => {
    if (!doc.exists) {
      container.innerHTML = '<p>Rescue request not found</p>';
      return;
    }

    const req = { id: doc.id, ...doc.data() };
    selectedRequestId = req.id;

    container.innerHTML = `
      <button class="btn btn-outline btn-sm" id="backToRescues"><i class="fas fa-arrow-left"></i> Back</button>
      <div class="card" style="margin-top:10px;">
        ${req.image ? `<img src="${req.image}" style="width:100%; border-radius:20px; height:180px; object-fit:cover;" alt="animal">` : ''}
        <h2>${req.animalType} • ${req.condition}</h2>
        <span class="badge severity-${req.severity.toLowerCase()}">${req.severity}</span>
        <p>${req.description || 'No description'}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${req.location}</p>
        <p class="text-muted">Reported by ${req.reporterName || 'Unknown'} • ${formatTimestamp(req.createdAt)}</p>
        <p>Status: <span class="status-chip status-${req.status.toLowerCase().replace(' ', '-')}">${req.status}</span></p>
      </div>

      <div class="card">
        <h4>Status Timeline</h4>
        <div class="timeline">
          <div class="timeline-item timeline-done"><span class="timeline-dot"></span> Reported</div>
          <div class="timeline-item ${req.status !== 'Pending' ? 'timeline-done' : ''}"><span class="timeline-dot"></span> Volunteer Assigned</div>
          <div class="timeline-item ${['Rescue In Progress', 'Rescued'].includes(req.status) ? 'timeline-done' : ''}"><span class="timeline-dot"></span> Rescue Started</div>
          <div class="timeline-item ${req.status === 'Rescued' ? 'timeline-done' : ''}"><span class="timeline-dot"></span> Rescued</div>
        </div>
      </div>

      <div id="actionButtons"></div>
    `;

    document.getElementById('backToRescues').addEventListener('click', () => renderRescues());

    const actionContainer = document.getElementById('actionButtons');

    // Volunteer actions
    if (currentUser.role === 'Volunteer' && req.status === 'Pending') {
      actionContainer.innerHTML = `<button class="btn btn-secondary btn-block" id="volunteerBtn"><i class="fas fa-hand-holding-heart"></i> Volunteer for Rescue</button>`;
      document.getElementById('volunteerBtn').addEventListener('click', async () => {
        await volunteerForRescue(req.id);
        renderRescueDetails(req.id);
      });
    }

    // Admin actions
    if (currentUser.role === 'Admin') {
      actionContainer.innerHTML = `
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="acceptBtn">Accept Request</button>
          <button class="btn btn-outline" id="updateStatusBtn">Update Status</button>
          <button class="btn btn-danger" id="removeBtn">Remove</button>
        </div>
      `;

      document.getElementById('acceptBtn').addEventListener('click', async () => {
        await acceptRescue(req.id);
        renderRescueDetails(req.id);
      });

      document.getElementById('updateStatusBtn').addEventListener('click', async () => {
        const currentIndex = RESCUE_STATUS.indexOf(req.status);
        const nextStatus = currentIndex < RESCUE_STATUS.length - 1 ? RESCUE_STATUS[currentIndex + 1] : 'Rescued';
        await updateRescueStatus(req.id, nextStatus);
        renderRescueDetails(req.id);
      });

      document.getElementById('removeBtn').addEventListener('click', async () => {
        if (confirm('Remove this report?')) {
          await removeRescue(req.id);
          renderRescues();
        }
      });
    }

    // Show volunteer assignment
    if (req.volunteerId === currentUser.uid) {
      actionContainer.innerHTML += '<p style="margin-top:8px; color:#1e5c3f;">✅ You are assigned to this rescue.</p>';
    }
  }).catch((error) => {
    console.error('Error loading rescue details:', error);
    container.innerHTML = '<p>Error loading details</p>';
  });
}

function renderReportScreen() {
  const container = document.getElementById('screenContainer');
  photoFile = null;
  photoPreviewUrl = null;
  reportLat = null;
  reportLng = null;

  container.innerHTML = `
    <h2>🚨 Report Animal</h2>
    <p class="text-muted">Fill the details to request rescue</p>
    <div class="card">
      <label>Animal type</label>
      <select id="animalType">
        <option>Dog</option><option>Cat</option><option>Bird</option>
        <option>Cow</option><option>Other</option>
      </select>

      <label>Condition</label>
      <select id="condition">
        <option>Injured</option><option>Sick</option><option>Trapped</option>
        <option>Abandoned</option><option>Accident</option><option>Other</option>
      </select>

      <label>Severity</label>
      <select id="severity">
        <option>Low</option><option>Medium</option><option>Critical</option>
      </select>

      <label>Animal Photo</label>
      <div class="file-upload" id="photoUpload">
        <i class="fas fa-camera"></i>
        <p>Tap to upload photo</p>
        <input type="file" id="photoInput" accept="image/*" style="display:none;">
      </div>
      <div id="photoPreview"></div>

      <label>Description</label>
      <textarea id="description" rows="2" placeholder="Describe what happened and what help the animal needs…"></textarea>

      <label>Location</label>
      <input type="text" id="locationInput" placeholder="e.g. Koramangala, 2km">
      <button class="btn btn-outline btn-sm" id="useLocationBtn" style="margin-bottom:10px;">
        <i class="fas fa-location-crosshairs"></i> Use current location
      </button>

      <label>Pin exact spot on map</label>
      <p class="text-muted" style="margin-bottom:8px;">Tap anywhere on the map to drop a pin, or drag it to adjust.</p>
      <div id="reportMap" style="width:100%; height:220px; border-radius:18px; overflow:hidden; margin-bottom:8px;"></div>
      <p class="text-muted" id="reportCoordsLabel" style="margin-bottom:14px;">📍 No pin dropped yet — defaults to India center</p>

      <button class="btn btn-secondary btn-block" id="submitRescueBtn">
        <i class="fas fa-paw"></i> Submit Rescue Request
      </button>
    </div>
  `;

  // Photo upload handling
  document.getElementById('photoUpload').addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });

  document.getElementById('photoInput').addEventListener('change', (e) => {
    photoFile = e.target.files[0];
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoPreviewUrl = event.target.result;
        document.getElementById('photoPreview').innerHTML = `
          <img src="${photoPreviewUrl}" class="photo-preview" alt="Preview">
          <button class="btn btn-outline btn-sm" id="removePhotoBtn">Remove</button>
        `;
        document.getElementById('removePhotoBtn').addEventListener('click', () => {
          photoFile = null;
          photoPreviewUrl = null;
          document.getElementById('photoPreview').innerHTML = '';
          document.getElementById('photoInput').value = '';
        });
      };
      reader.readAsDataURL(photoFile);
    }
  });

  // Get current location
  document.getElementById('useLocationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        document.getElementById('locationInput').value =
          `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
        setReportMarker(position.coords.latitude, position.coords.longitude);
      }, () => {
        showToast('Unable to get location');
      });
    }
  });

  // Initialize the geotagging map (India-centered, tap-to-pin)
  initReportMap();

  // Submit rescue
  document.getElementById('submitRescueBtn').addEventListener('click', async () => {
    const submitBtn = document.getElementById('submitRescueBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';

    let photoUrl = null;
    if (photoFile) {
      photoUrl = await uploadPhoto(photoFile);
    }

    const rescueData = {
      animalType: document.getElementById('animalType').value,
      condition: document.getElementById('condition').value,
      severity: document.getElementById('severity').value,
      description: document.getElementById('description').value || 'No description',
      image: photoUrl,
      location: document.getElementById('locationInput').value || 'Unknown',
      latitude: reportLat != null ? reportLat : INDIA_CENTER.lat,
      longitude: reportLng != null ? reportLng : INDIA_CENTER.lng
    };

    const rescueId = await submitRescueRequest(rescueData);

    if (rescueId) {
      setTimeout(() => {
        renderHome();
      }, 1500);
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paw"></i> Submit Rescue Request';
    }
  });
}

function renderVolunteerScreen() {
  const container = document.getElementById('screenContainer');
  container.innerHTML = `
    <h2>🤝 Volunteer</h2>
    <p class="text-muted">Available rescue requests</p>
    <div id="volunteerList"><div class="loading-spinner"></div> Loading...</div>
  `;

  listenToRescues((rescues) => {
    const listContainer = document.getElementById('volunteerList');
    const available = rescues.filter(r => r.status === 'Pending');

    if (available.length === 0) {
      listContainer.innerHTML = '<p class="text-muted">No rescue requests available</p>';
      return;
    }

    listContainer.innerHTML = available.map(req => `
      <div class="card">
        <div><strong>${req.animalType}</strong> <span class="badge severity-${req.severity.toLowerCase()}">${req.severity}</span></div>
        <p>📍 ${req.location}</p>
        <p class="text-muted">${formatTimestamp(req.createdAt)}</p>
        <button class="btn btn-primary btn-sm volunteerBtn" data-id="${req.id}">Volunteer</button>
      </div>
    `).join('');

    listContainer.querySelectorAll('.volunteerBtn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await volunteerForRescue(id);
        renderVolunteerScreen();
      });
    });
  });
}

function renderProfile() {
  const container = document.getElementById('screenContainer');

  if (currentUser.role === 'Admin') {
    renderAdminDashboard();
    return;
  }

  container.innerHTML = `
    <div class="card" style="display:flex; align-items:center; gap:16px;">
      <div style="font-size:3rem;">${currentUser.profileImage || '👤'}</div>
      <div>
        <h3>${currentUser.displayName || 'User'}</h3>
        <span class="badge">${currentUser.role}</span>
      </div>
    </div>
    <div class="card">
      <p><i class="fas fa-check-circle"></i> Rescues completed: <span id="userRescues">0</span></p>
      <p><i class="fas fa-file-alt"></i> Reports submitted: <span id="userReports">0</span></p>
      <p><i class="fas fa-clock"></i> Volunteer hours: <span id="userHours">0</span></p>
    </div>
    <button class="btn btn-outline btn-block" id="meetTeamBtn" style="margin-bottom:12px;"><i class="fas fa-people-group"></i> Meet the Team</button>
    <button class="btn btn-outline btn-block" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  `;

  document.getElementById('meetTeamBtn').addEventListener('click', () => navigateTo('team'));
  document.getElementById('logoutBtn').addEventListener('click', signOut);

  // Load user stats
  getUserData(currentUser.uid).then((userData) => {
    if (userData) {
      document.getElementById('userRescues').textContent = userData.rescuesCompleted || 0;
      document.getElementById('userReports').textContent = userData.reportsSubmitted || 0;
      document.getElementById('userHours').textContent = userData.volunteerHours || 0;
    }
  });
}

function renderAdminDashboard() {
  const container = document.getElementById('screenContainer');
  container.innerHTML = `
    <h2>🛠️ Admin Dashboard</h2>
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin:12px 0;">
      <span class="stat-badge">Total: <span id="adminTotal">0</span></span>
      <span class="stat-badge">Pending: <span id="adminPending">0</span></span>
      <span class="stat-badge">Active: <span id="adminActive">0</span></span>
      <span class="stat-badge">Completed: <span id="adminCompleted">0</span></span>
    </div>
    <div id="adminRescueList"><div class="loading-spinner"></div> Loading...</div>
    <button class="btn btn-outline btn-block" id="meetTeamBtn" style="margin-bottom:12px;"><i class="fas fa-people-group"></i> Meet the Team</button>
    <button class="btn btn-outline btn-block" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  `;

  document.getElementById('meetTeamBtn').addEventListener('click', () => navigateTo('team'));
  document.getElementById('logoutBtn').addEventListener('click', signOut);

  listenToRescues((rescues) => {
    const total = rescues.length;
    const pending = rescues.filter(r => r.status === 'Pending').length;
    const active = rescues.filter(r => r.status !== 'Pending' && r.status !== 'Rescued').length;
    const completed = rescues.filter(r => r.status === 'Rescued').length;

    document.getElementById('adminTotal').textContent = total;
    document.getElementById('adminPending').textContent = pending;
    document.getElementById('adminActive').textContent = active;
    document.getElementById('adminCompleted').textContent = completed;

    const listContainer = document.getElementById('adminRescueList');
    listContainer.innerHTML = rescues.map(req => `
      <div class="card" style="padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${req.animalType}</strong> • ${req.condition}
            <p class="text-muted">${req.location} • ${formatTimestamp(req.createdAt)}</p>
          </div>
          <span class="status-chip status-${req.status.toLowerCase().replace(' ', '-')}">${req.status}</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.renderRescueDetails('${req.id}')">View Details</button>
      </div>
    `).join('');
  });
}
