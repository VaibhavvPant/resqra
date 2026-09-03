const TEAM_MEMBERS = [
  {
    name: "Vaibhav Pant",
    role: "CEO, Project Manager, Leader and backend engineer",
    photo: "images/vaibhav.jpg",
    avatarEmoji: "🧑‍💻",
    bio: "Wanted to bring a change to the society and provide welfare to animals without any personal benefit."
  },
  {
    name: "Ankit Bhandari",
    role: "Backend designer",
    photo: "images/ankit.jpg",
    avatarEmoji: "🎨",
    bio: "Backend development and system design for ResQra."
  },
  {
    name: "Daksh Dhasmana",
    role: "Frontend designer",
    photo: "images/daksh.jpg",
    avatarEmoji: "🐾",
    bio: "Works on the frontend experience and user-facing features."
  },
  {
    name: "Brijesh Singh Negi",
    role: "UI and UX designer, frontend designer and QA tester",
    photo: "images/brijesh.jpg",
    avatarEmoji: "🤝",
    bio: "Designs the UI/UX, contributes to frontend development, and tests the application."
  }
];

function renderTeamPage() {
  const container = document.getElementById('screenContainer');

  container.innerHTML = `
    <button class="btn btn-outline btn-sm" id="backFromTeam"><i class="fas fa-arrow-left"></i> Back</button>
    <h2 style="margin-top:12px;">🐾 Meet the Team</h2>
    <p class="text-muted" style="margin-bottom:16px;">The people behind ResQra</p>
    <div id="teamList"></div>
  `;

  document.getElementById('backFromTeam').addEventListener('click', () => navigateTo('profile'));

  const listEl = document.getElementById('teamList');
  listEl.innerHTML = TEAM_MEMBERS.map(member => `
    <div class="card" style="display:flex; gap:14px; align-items:flex-start;">
      ${
        member.photo
          ? `<img src="${member.photo}" alt="${member.name}" style="width:64px;height:64px;border-radius:20px;object-fit:cover;flex-shrink:0;">`
          : `<div style="width:64px;height:64px;border-radius:20px;background:#eef3ef;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;">${member.avatarEmoji || '👤'}</div>`
      }
      <div>
        <h3 style="margin-bottom:2px;">${member.name}</h3>
        <span class="badge" style="margin-bottom:8px; display:inline-block;">${member.role}</span>
        <p class="text-muted" style="margin-top:6px;">${member.bio}</p>
      </div>
    </div>
  `).join('');
}
