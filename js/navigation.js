// ==================== NAVIGATION ====================
function setActiveNav(screen) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    const screenName = btn.dataset.screen;
    if (screenName === screen) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function navigateTo(screen) {
  currentScreen = screen;
  setActiveNav(screen);

  if (screen === 'home') renderHome();
  else if (screen === 'rescues') renderRescues();
  else if (screen === 'report') renderReportScreen();
  else if (screen === 'volunteer') renderVolunteerScreen();
  else if (screen === 'profile') renderProfile();
  else if (screen === 'team') renderTeamPage();
}
