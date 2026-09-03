// ==================== EVENT LISTENERS ====================
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    navigateTo(screen);
  });
});

// Expose functions to window for onclick handlers
window.renderRescueDetails = renderRescueDetails;
window.selectedRequestId = null;

// Auth state observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const userData = await getUserData(user.uid);
    currentUser.role = userData?.role || 'Citizen';
    currentUser.profileImage = userData?.profileImage || '👤';

    if (currentScreen === 'login') {
      document.getElementById('bottomNav').classList.remove('hidden');
      setActiveNav('home');
      renderHome();
    }
  } else {
    if (currentScreen !== 'login') {
      currentUser = null;
      if (rescueListener) rescueListener();
      renderLogin();
    }
  }
});

// Initial render
renderLogin();
console.log('🔥 ResQra initialized with Firebase backend');
