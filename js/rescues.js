// ==================== FIRESTORE OPERATIONS ====================
async function submitRescueRequest(data) {
  try {
    showToast('Submitting rescue request...');
    const docRef = await db.collection('rescues').add({
      ...data,
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName || 'User',
      volunteerId: null,
      volunteerName: null,
      status: 'Pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update user's report count
    await db.collection('users').doc(currentUser.uid).update({
      reportsSubmitted: firebase.firestore.FieldValue.increment(1)
    });

    const requestId = docRef.id.slice(0, 6).toUpperCase();
    showToast(`Rescue request #${requestId} submitted!`);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting rescue:', error);
    showToast('Error submitting request');
    return null;
  }
}

async function uploadPhoto(file) {
  if (!file) return null;
  try {
    const storageRef = storage.ref(`animal-photos/${Date.now()}-${file.name}`);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

async function volunteerForRescue(rescueId) {
  try {
    await db.collection('rescues').doc(rescueId).update({
      volunteerId: currentUser.uid,
      volunteerName: currentUser.displayName || 'Volunteer',
      status: 'Volunteer Assigned',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('You are assigned to this rescue!');
  } catch (error) {
    console.error('Error volunteering:', error);
    showToast('Error volunteering');
  }
}

async function updateRescueStatus(rescueId, newStatus) {
  try {
    await db.collection('rescues').doc(rescueId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast(`Status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Error updating status');
  }
}

async function acceptRescue(rescueId) {
  try {
    await db.collection('rescues').doc(rescueId).update({
      status: 'Accepted',
      acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Rescue request accepted');
  } catch (error) {
    console.error('Error accepting rescue:', error);
    showToast('Error accepting rescue');
  }
}

async function removeRescue(rescueId) {
  try {
    await db.collection('rescues').doc(rescueId).delete();
    showToast('Report removed');
  } catch (error) {
    console.error('Error removing rescue:', error);
    showToast('Error removing report');
  }
}

// ==================== REAL-TIME LISTENERS ====================
function listenToRescues(callback) {
  if (rescueListener) rescueListener();

  rescueListener = db.collection('rescues')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const rescues = [];
      snapshot.forEach((doc) => {
        rescues.push({ id: doc.id, ...doc.data() });
      });
      callback(rescues);
    }, (error) => {
      console.error('Error listening to rescues:', error);
      showToast('Error loading rescues');
    });
}
