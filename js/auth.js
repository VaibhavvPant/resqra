// ==================== USER PROFILE HELPERS ====================
async function createUserProfile(user, role) {
  try {
    await db.collection('users').doc(user.uid).set({
      name: user.displayName || 'User',
      email: user.email,
      role: role,
      profileImage: role === 'Volunteer' ? '🧑‍🤝‍🧑' : '🐕',
      rescuesCompleted: 0,
      reportsSubmitted: 0,
      volunteerHours: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('User profile created:', user.uid);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

async function getUserRole(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data().role : 'Citizen';
}

async function getUserData(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// ==================== AUTH FUNCTIONS ====================
async function signUp(email, password, name, role) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: name });
    await createUserProfile(userCredential.user, role);
    showToast('Account created successfully!');
    return userCredential.user;
  } catch (error) {
    console.error('Signup error:', error);
    showToast(error.message);
    return null;
  }
}

async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    showToast('Welcome back!');
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message);
    return null;
  }
}

async function signInAsDemo() {
  try {
    const email = 'demo@resqra.com';
    const password = 'demo123';
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      // Create demo user if doesn't exist
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: 'Demo User' });
      await createUserProfile(userCredential.user, 'Citizen');
    }
    showToast('Logged in as Demo User');
  } catch (error) {
    console.error('Demo login error:', error);
    showToast(error.message);
  }
}

async function signOut() {
  try {
    await auth.signOut();
    currentUser = null;
    if (rescueListener) rescueListener();
    showToast('Logged out');
    renderLogin();
  } catch (error) {
    console.error('Logout error:', error);
    showToast(error.message);
  }
}
