// ============================================
// STORY BRAIN - Shared State Management
// Centralized localStorage persistence and utilities
// ============================================

// Default initial state structure
const DEFAULT_STATE = {
  projects: [],
  currentProjectId: null,
  characters: [],
  plotThreads: [],
  scenes: [],
  worldData: [],
  archivedProjects: [],
  archivedCharacters: [],
  archivedWorldEntries: [],
  archivedPlotThreads: [],
  trashedProjects: [],
  trashedCharacters: [],
  trashedWorldEntries: [],
  trashedPlotThreads: [],
  settings: {
    darkMode: false,
    autoSave: true,
    wordTarget: 50000
  }
};

// Global state object
let state = { ...DEFAULT_STATE };

// ============================================
// CORE STATE FUNCTIONS
// ============================================

// Load state from localStorage
function loadState() {
  try {
    const savedState = localStorage.getItem('storyBrainState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Merge with defaults to ensure all fields exist
      state = { ...DEFAULT_STATE, ...parsed };
    } else {
      // Initialize with sample data for demo
      initializeSampleData();
    }
  } catch (error) {
    console.error('Error loading state:', error);
    initializeSampleData();
  }
  return state;
}

// Save current state to localStorage
function saveState() {
  try {
    localStorage.setItem('storyBrainState', JSON.stringify(state));
    // Dispatch event for other pages/tabs to sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'storyBrainState',
      newValue: JSON.stringify(state)
    }));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// Initialize with sample data for first-time users
function initializeSampleData() {
  const sampleProject = {
    id: 'sample1',
    title: 'The Last Ember',
    wordCount: 4280,
    targetWordCount: 50000,
    status: 'active',
    manuscriptContent: `Chapter 1: The Awakening\n\nThe city of Verenthia had always been a place of shadows, but tonight, the darkness felt alive. Elara pressed herself against the cold stone wall, her heart pounding like a war drum in her chest.\n\n"The Inquisitors are coming," she whispered to herself. "They're always coming."\n\nShe had stolen the ember—a small, pulsating crystal that held the last remnants of magic in a world that had burned all its witches. Now, with it pressed against her skin, she could feel the ancient power humming through her veins, begging to be released.\n\nFootsteps echoed in the alley behind her. Three pairs. Maybe four. She didn't dare look back.\n\n*Run*, the crystal seemed to whisper. *You know what you must become.*`,
    lastEdited: new Date().toISOString()
  };
  
  const sampleCharacters = [
    {
      id: 'char1',
      name: 'Elara Vance',
      role: 'Protagonist',
      wants: 'To restore magic to the world',
      needs: 'To trust others and accept help',
      fear: 'Becoming like the witches she read about—alone and hunted',
      secret: 'Her grandmother was the last Archmage, executed by the Inquisition',
      contradiction: 'Desperate for connection but pushes everyone away',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'char2',
      name: 'Kaelen Ashworth',
      role: 'Mentor',
      wants: 'To protect Elara at any cost',
      needs: 'To forgive himself for past failures',
      fear: 'Watching another apprentice die',
      secret: 'He helped create the Inquisition before defecting',
      contradiction: 'Preaches caution but takes reckless risks',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'char3',
      name: 'Sister Moraine',
      role: 'Antagonist',
      wants: 'To eradicate all magic from the realm',
      needs: 'To confront her own magical heritage',
      fear: 'Losing control of the Inquisition',
      secret: 'She possesses dormant magical abilities',
      contradiction: 'Destroys magic but secretly studies ancient texts',
      updatedAt: new Date().toISOString()
    }
  ];
  
  const samplePlotThreads = [
    {
      id: 'thread1',
      name: 'The Ember\'s Secret',
      description: 'The crystal contains more than just magic—it holds the consciousness of the last Archmage',
      status: 'developing',
      linkedCharacters: 'Elara, Kaelen',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'thread2',
      name: 'The Inquisition Betrayal',
      description: 'A faction within the Inquisition wants to use magic, not destroy it',
      status: 'introduced',
      linkedCharacters: 'Sister Moraine',
      updatedAt: new Date().toISOString()
    }
  ];
  
  const sampleWorldData = [
    {
      id: 'world1',
      type: 'location',
      title: 'Verenthia',
      description: 'A sprawling city of spires and slums, where the Inquisition watches from every shadow. Once a center of magical learning, now a monument to suppression.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'world2',
      type: 'rules',
      title: 'The Ember Magic System',
      description: 'Magic is channeled through Ember crystals, which amplify latent abilities. Users must balance control with surrender—too much control limits power, too much surrender risks possession.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'world3',
      type: 'history',
      title: 'The Burning Years',
      description: 'A decade-long purge when the Inquisition hunted and executed all known magic users. Thousands died. The last Archmage fell in the final siege of Verenthia.',
      updatedAt: new Date().toISOString()
    }
  ];
  
  state = {
    ...DEFAULT_STATE,
    projects: [sampleProject],
    currentProjectId: sampleProject.id,
    characters: sampleCharacters,
    plotThreads: samplePlotThreads,
    worldData: sampleWorldData,
    scenes: []
  };
  
  saveState();
}

// ============================================
// DARK MODE - CSS Variables Theme
// Colors based on the provided design tokens
// ============================================

// Initialize dark mode when page loads
function initDarkMode() {
  const savedMode = localStorage.getItem('darkMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = savedMode === 'true' || (savedMode === null && prefersDark);
  
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  updateDarkModeButton();
}

// Toggle dark mode on/off
function toggleDarkMode() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
    showNotification('☀️ Light mode enabled', 'info');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
    showNotification('🌙 Dark mode enabled', 'info');
  }
  updateDarkModeButton();
}

// Update the button icon based on current mode
function updateDarkModeButton() {
  const buttons = document.querySelectorAll('.dark-mode-toggle');
  const isDark = document.documentElement.classList.contains('dark');
  
  buttons.forEach(btn => {
    btn.innerHTML = isDark ? 
      '<span class="material-symbols-outlined">light_mode</span>' : 
      '<span class="material-symbols-outlined">dark_mode</span>';
  });
}

// Add dark mode styles
function addDarkModeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Dark mode styles - keep your existing styles here */
    .dark {
      color-scheme: dark;
    }
    .dark body {
      background-color: #121212 !important;
      color: #E8E8E8 !important;
    }
    .dark .bg-white {
      background-color: #1E1E1E !important;
    }
    .dark .border {
      border-color: #2A2A2A !important;
    }
    /* Add more dark mode styles as needed */
  `;
  document.head.appendChild(style);
}

// Simple notification helper
function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 animate-slide-in ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    'bg-primary text-white'
  }`;
  notif.innerHTML = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// ============================================
// FIREBASE CLOUD SYNC
// ============================================

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgzqTB1zJokBz1hXWMo-JpmzIoIpYn3lE",
  authDomain: "story-brain-ec07c.firebaseapp.com",
  projectId: "story-brain-ec07c",
  storageBucket: "story-brain-ec07c.firebasestorage.app",
  messagingSenderId: "244917769549",
  appId: "1:244917769549:web:ddbb7c7390a5776c185304",
  measurementId: "G-TNRYJGZTQ9"
};

let firebaseApp = null;
let db = null;
let auth = null;
let currentUser = null;

// Initialize Firebase
async function initFirebase() {
  // Check if Firebase is already loaded
  if (typeof firebase === 'undefined') {
    console.warn('⚠️ Firebase SDK not loaded. Make sure to add the Firebase scripts to your HTML.');
    return false;
  }
  
  try {
    // Initialize Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    
    // Enable offline persistence
    await db.enablePersistence({ synchronizeTabs: true });
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        updateAuthUI();
        await loadFromCloud();
      } else {
        currentUser = null;
        updateAuthUI();
      }
    });
    
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase init failed:', error);
    return false;
  }
}

// Sign up with email
async function signUp(email, password) {
  if (!auth) await initFirebase();
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    updateAuthUI();
    await syncToCloud();
    showNotification('✅ Account created! Your data is now in the cloud.', 'success');
    return true;
  } catch (error) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email is already registered. Try signing in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters.';
    }
    showNotification(message, 'error');
    return false;
  }
}

// Sign in
async function signIn(email, password) {
  if (!auth) await initFirebase();
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    updateAuthUI();
    await loadFromCloud();
    showNotification('✅ Signed in! Your data has been loaded from the cloud.', 'success');
    return true;
  } catch (error) {
    let message = 'Sign in failed. Check your email and password.';
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email. Create one first.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password. Try again.';
    }
    showNotification(message, 'error');
    return false;
  }
}

// Sign out
async function signOut() {
  if (!auth) return;
  
  try {
    await auth.signOut();
    currentUser = null;
    updateAuthUI();
    showNotification('Signed out. Your data is still saved locally.', 'info');
  } catch (error) {
    showNotification('Sign out failed: ' + error.message, 'error');
  }
}

// Sync to Firebase Cloud
async function syncToCloud() {
  if (!currentUser || !db) {
    showNotification('Please sign in first to sync to cloud.', 'error');
    return false;
  }
  
  try {
    await db.collection('user_data').doc(currentUser.uid).set({
      data: JSON.stringify(state),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastSync: new Date().toISOString()
    });
    showNotification('☁️ Synced to cloud!', 'success');
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    showNotification('Sync failed: ' + error.message, 'error');
    return false;
  }
}

// Load from Firebase Cloud
async function loadFromCloud() {
  if (!currentUser || !db) return false;
  
  try {
    const doc = await db.collection('user_data').doc(currentUser.uid).get();
    
    if (doc.exists) {
      const cloudData = JSON.parse(doc.data().data);
      // Merge cloud data with current state
      state = { ...state, ...cloudData };
      saveState();
      showNotification('📥 Loaded from cloud!', 'success');
      // Trigger page refresh to show new data
      window.dispatchEvent(new CustomEvent('storyBrainStateUpdated'));
      return true;
    } else {
      // First time user - sync current data to cloud
      await syncToCloud();
    }
  } catch (error) {
    console.error('Load failed:', error);
    showNotification('Load failed: ' + error.message, 'error');
    return false;
  }
  return false;
}

// Auto-sync on state changes (debounced)
let syncTimeout;
function autoSyncToCloud() {
  if (!currentUser) return;
  
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncToCloud();
  }, 3000); // Wait 3 seconds after last change to sync
}

// Override saveState to auto-sync
const originalSaveState = saveState;
window.saveState = function() {
  originalSaveState();
  autoSyncToCloud();
};

// Update UI to show login/sync buttons
function updateAuthUI() {
  const authButtons = document.getElementById('authButtons');
  if (!authButtons) return;
  
  if (currentUser) {
    const displayName = currentUser.email.split('@')[0];
    authButtons.innerHTML = `
      <span class="text-sm text-gray-600 dark:text-gray-300 mr-2 hidden md:inline">👤 ${displayName}</span>
      <button id="syncCloudBtn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Sync to cloud">
        <span class="material-symbols-outlined">cloud_sync</span>
      </button>
      <button id="signOutBtn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Sign out">
        <span class="material-symbols-outlined">logout</span>
      </button>
    `;
    
    document.getElementById('syncCloudBtn')?.addEventListener('click', () => syncToCloud());
    document.getElementById('signOutBtn')?.addEventListener('click', signOut);
  } else {
    authButtons.innerHTML = `
      <button id="showAuthModalBtn" class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
        Sign In / Sign Up
      </button>
    `;
    document.getElementById('showAuthModalBtn')?.addEventListener('click', showAuthModal);
  }
}

// Show login/signup modal
function showAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
}

async function handleAuth() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const isSignUp = document.getElementById('authMode').value === 'signup';
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'error');
    return;
  }
  
  if (isSignUp) {
    await signUp(email, password);
  } else {
    await signIn(email, password);
  }
  
  closeAuthModal();
}

// ============================================
// PROJECT MANAGEMENT FUNCTIONS
// ============================================

// Get current active project
function getCurrentProject() {
  if (!state.currentProjectId) return null;
  return state.projects.find(p => p.id === state.currentProjectId) || null;
}

// Update current project data
function updateProject(projectId, updates) {
  const index = state.projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    state.projects[index] = { ...state.projects[index], ...updates, lastEdited: new Date().toISOString() };
    saveState();
    return true;
  }
  return false;
}

// Create new project
function createProject(title, targetWordCount = 50000) {
  const newProject = {
    id: Date.now().toString(),
    title: title || `New Project ${state.projects.length + 1}`,
    wordCount: 0,
    targetWordCount: targetWordCount,
    status: 'active',
    manuscriptContent: '',
    lastEdited: new Date().toISOString()
  };
  state.projects.push(newProject);
  state.currentProjectId = newProject.id;
  saveState();
  return newProject;
}

// Delete project (move to trash)
function deleteProject(projectId) {
  const project = state.projects.find(p => p.id === projectId);
  if (project) {
    state.projects = state.projects.filter(p => p.id !== projectId);
    state.trashedProjects = state.trashedProjects || [];
    state.trashedProjects.push({ ...project, trashedAt: new Date().toISOString() });
    if (state.currentProjectId === projectId) state.currentProjectId = null;
    saveState();
  }
}

// Move to Trash
function moveToTrash(type, id) {
  let item = null;
  switch(type) {
    case 'project':
      item = state.projects.find(p => p.id === id);
      if (item) {
        state.projects = state.projects.filter(p => p.id !== id);
        state.trashedProjects = state.trashedProjects || [];
        state.trashedProjects.push({ ...item, trashedAt: new Date().toISOString() });
        if (state.currentProjectId === id) state.currentProjectId = null;
      }
      break;
    case 'character':
      item = state.characters.find(c => c.id === id);
      if (item) {
        state.characters = state.characters.filter(c => c.id !== id);
        state.trashedCharacters = state.trashedCharacters || [];
        state.trashedCharacters.push({ ...item, trashedAt: new Date().toISOString() });
      }
      break;
    case 'world':
      item = state.worldData.find(w => w.id === id);
      if (item) {
        state.worldData = state.worldData.filter(w => w.id !== id);
        state.trashedWorldEntries = state.trashedWorldEntries || [];
        state.trashedWorldEntries.push({ ...item, trashedAt: new Date().toISOString() });
      }
      break;
    case 'thread':
      item = state.plotThreads.find(t => t.id === id);
      if (item) {
        state.plotThreads = state.plotThreads.filter(t => t.id !== id);
        state.trashedPlotThreads = state.trashedPlotThreads || [];
        state.trashedPlotThreads.push({ ...item, trashedAt: new Date().toISOString() });
      }
      break;
  }
  if (item) {
    saveState();
    return true;
  }
  return false;
}

function restoreFromArchive(type, id) {
  let item = null;
  switch(type) {
    case 'project':
      item = state.archivedProjects?.find(p => p.id === id);
      if (item) {
        state.archivedProjects = state.archivedProjects.filter(p => p.id !== id);
        state.projects.push(item);
      }
      break;
    case 'character':
      item = state.archivedCharacters?.find(c => c.id === id);
      if (item) {
        state.archivedCharacters = state.archivedCharacters.filter(c => c.id !== id);
        state.characters.push(item);
      }
      break;
    case 'world':
      item = state.archivedWorldEntries?.find(w => w.id === id);
      if (item) {
        state.archivedWorldEntries = state.archivedWorldEntries.filter(w => w.id !== id);
        state.worldData.push(item);
      }
      break;
    case 'thread':
      item = state.archivedPlotThreads?.find(t => t.id === id);
      if (item) {
        state.archivedPlotThreads = state.archivedPlotThreads.filter(t => t.id !== id);
        state.plotThreads.push(item);
      }
      break;
  }
  if (item) {
    saveState();
    return true;
  }
  return false;
}

function restoreFromTrash(type, id) {
  let item = null;
  switch(type) {
    case 'project':
      item = state.trashedProjects?.find(p => p.id === id);
      if (item) {
        state.trashedProjects = state.trashedProjects.filter(p => p.id !== id);
        state.projects.push(item);
      }
      break;
    case 'character':
      item = state.trashedCharacters?.find(c => c.id === id);
      if (item) {
        state.trashedCharacters = state.trashedCharacters.filter(c => c.id !== id);
        state.characters.push(item);
      }
      break;
    case 'world':
      item = state.trashedWorldEntries?.find(w => w.id === id);
      if (item) {
        state.trashedWorldEntries = state.trashedWorldEntries.filter(w => w.id !== id);
        state.worldData.push(item);
      }
      break;
    case 'thread':
      item = state.trashedPlotThreads?.find(t => t.id === id);
      if (item) {
        state.trashedPlotThreads = state.trashedPlotThreads.filter(t => t.id !== id);
        state.plotThreads.push(item);
      }
      break;
  }
  if (item) {
    saveState();
    return true;
  }
  return false;
}

function permanentDelete(type, id) {
  switch(type) {
    case 'project':
      state.trashedProjects = state.trashedProjects?.filter(p => p.id !== id);
      break;
    case 'character':
      state.trashedCharacters = state.trashedCharacters?.filter(c => c.id !== id);
      break;
    case 'world':
      state.trashedWorldEntries = state.trashedWorldEntries?.filter(w => w.id !== id);
      break;
    case 'thread':
      state.trashedPlotThreads = state.trashedPlotThreads?.filter(t => t.id !== id);
      break;
  }
  saveState();
  showNotification('Item permanently deleted', 'success');
  return true;
}

function emptyTrash() {
  if (confirm('⚠️ PERMANENT DELETE: This will delete ALL items in trash forever. This cannot be undone. Continue?')) {
    state.trashedProjects = [];
    state.trashedCharacters = [];
    state.trashedWorldEntries = [];
    state.trashedPlotThreads = [];
    saveState();
    showNotification('Trash emptied', 'success');
    return true;
  }
  return false;
}

// ============================================
// CHARACTER MANAGEMENT FUNCTIONS
// ============================================

function addCharacter(character) {
  const newCharacter = {
    id: Date.now().toString(),
    ...character,
    updatedAt: new Date().toISOString()
  };
  state.characters.push(newCharacter);
  saveState();
  return newCharacter;
}

function updateCharacter(characterId, updates) {
  const index = state.characters.findIndex(c => c.id === characterId);
  if (index !== -1) {
    state.characters[index] = { ...state.characters[index], ...updates, updatedAt: new Date().toISOString() };
    saveState();
    return true;
  }
  return false;
}

function deleteCharacter(characterId) {
  state.characters = state.characters.filter(c => c.id !== characterId);
  saveState();
}

// ============================================
// PLOT THREAD MANAGEMENT
// ============================================

function addPlotThread(thread) {
  const newThread = {
    id: Date.now().toString(),
    ...thread,
    updatedAt: new Date().toISOString()
  };
  state.plotThreads.push(newThread);
  saveState();
  return newThread;
}

function updatePlotThread(threadId, updates) {
  const index = state.plotThreads.findIndex(t => t.id === threadId);
  if (index !== -1) {
    state.plotThreads[index] = { ...state.plotThreads[index], ...updates, updatedAt: new Date().toISOString() };
    saveState();
    return true;
  }
  return false;
}

// ============================================
// WORLD DATA MANAGEMENT
// ============================================

function addWorldEntry(entry) {
  const newEntry = {
    id: Date.now().toString(),
    ...entry,
    updatedAt: new Date().toISOString()
  };
  state.worldData.push(newEntry);
  saveState();
  return newEntry;
}

function updateWorldEntry(entryId, updates) {
  const index = state.worldData.findIndex(w => w.id === entryId);
  if (index !== -1) {
    state.worldData[index] = { ...state.worldData[index], ...updates, updatedAt: new Date().toISOString() };
    saveState();
    return true;
  }
  return false;
}

// ============================================
// SCENE MANAGEMENT
// ============================================

function addScene(scene) {
  const newScene = {
    id: Date.now().toString(),
    ...scene,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.scenes.push(newScene);
  saveState();
  return newScene;
}

// ============================================
// AI-READY GENERATION FUNCTIONS (Placeholders)
// ============================================

// Scene engine placeholder
function generateSceneIdeas(description, characters = []) {
  const ideas = [
    `🎬 Open with: ${description.substring(0, 50)}... The atmosphere should immediately establish the emotional stakes. Consider starting with sensory details that reflect the characters' inner states.`,
    `💥 Conflict injection: Introduce a misunderstanding or reveal a hidden agenda. One character has been keeping a secret that now threatens to surface.`,
    `❤️ Emotional beat: A moment of vulnerability. Someone shows weakness or unexpected strength, revealing a new dimension to their character.`,
    `🌀 Plot twist: An external event interrupts the scene—a messenger arrives, a storm hits, or an antagonist appears earlier than expected.`,
    `⚡ Escalation: Raise the stakes by introducing a time limit or a consequence for failure.`,
    `🔮 Resolution: End with a decision or discovery that propels the story forward.`
  ];
  return ideas;
}

// I'm Stuck placeholder
function generateTwists(lastEvent, characters = [], plotThreads = []) {
  const twists = [
    `🔀 Plot Twist: The character you trust most has been working against you the entire time.`,
    `💔 Emotional Twist: A deep secret from someone's past is revealed, changing how everyone sees them.`,
    `🌀 Reality Twist: What your character believes to be true about the world is fundamentally wrong.`
  ];
  
  const escalations = [
    `⚡ Raise Stakes: Add a time limit—if they don't succeed by dawn, something terrible happens.`,
    `⚡ Introduce Danger: A new threat emerges that's more dangerous than the original conflict.`,
    `⚡ Complicate Relationships: Someone they love is now directly in danger because of their actions.`
  ];
  
  const wildcard = `🌀 Wildcard: A seemingly minor character from earlier returns with crucial information that changes everything.`;
  
  return { twists, escalations, wildcard };
}

// Deepen character placeholder
function deepenCharacter(character) {
  const traits = [
    `has a secret hobby that contradicts their public persona`,
    `maintains a relationship with someone the reader would never expect`,
    `carries guilt from a past decision that mirrors the current conflict`,
    `possesses a skill that seems useless but will become crucial later`,
    `believes in something that puts them at odds with everyone they care about`
  ];
  
  const randomTrait = traits[Math.floor(Math.random() * traits.length)];
  return `${character.name} ${randomTrait}. This adds layers to their motivation and creates potential for rich dramatic irony.`;
}

// Make character messier placeholder
function makeMessier(character) {
  const flaws = [
    `jealousy that clouds their judgment at critical moments`,
    `a tendency to lie even when the truth would serve them better`,
    `addiction to a vice that others would judge harshly`,
    `cowardice that surfaces when courage is most needed`,
    `pride that prevents them from asking for help or admitting mistakes`
  ];
  
  const randomFlaw = flaws[Math.floor(Math.random() * flaws.length)];
  return `${character.name} now struggles with ${randomFlaw}. This creates internal conflict and opportunities for character growth.`;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Calculate total words across all projects
function getTotalWords() {
  return state.projects.reduce((total, project) => total + (project.wordCount || 0), 0);
}

// Get project statistics
function getProjectStats() {
  const totalProjects = state.projects.length;
  const activeProjects = state.projects.filter(p => p.status === 'active').length;
  const completedProjects = state.projects.filter(p => p.wordCount >= p.targetWordCount).length;
  const totalWords = getTotalWords();
  
  return { totalProjects, activeProjects, completedProjects, totalWords };
}

// Export all data
function exportAllData() {
  return JSON.stringify(state, null, 2);
}

// Import data (merge or replace)
function importData(jsonData, replace = false) {
  try {
    const imported = JSON.parse(jsonData);
    if (replace) {
      state = { ...DEFAULT_STATE, ...imported };
    } else {
      // Merge arrays
      state.projects = [...state.projects, ...(imported.projects || [])];
      state.characters = [...state.characters, ...(imported.characters || [])];
      state.plotThreads = [...state.plotThreads, ...(imported.plotThreads || [])];
      state.worldData = [...state.worldData, ...(imported.worldData || [])];
    }
    saveState();
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

// Clear all data (with confirmation)
function resetAllData() {
  if (confirm('⚠️ WARNING: This will delete ALL your data. This cannot be undone. Continue?')) {
    state = { ...DEFAULT_STATE };
    saveState();
    window.location.reload();
  }
}

// Escape HTML for safe display
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

// Load state when script loads
loadState();

// Initialize dark mode
initDarkMode();
addDarkModeStyles();

// Initialize Firebase (add this to start cloud sync)
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});

// Listen for storage events to sync across tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'storyBrainState' && e.newValue) {
    try {
      state = { ...DEFAULT_STATE, ...JSON.parse(e.newValue) };
      // Trigger a custom event for pages to refresh
      window.dispatchEvent(new CustomEvent('storyBrainStateUpdated'));
    } catch (error) {
      console.error('Error syncing state:', error);
    }
  }
});

// Make functions globally available
window.state = state;
window.loadState = loadState;
window.saveState = saveState;
window.getCurrentProject = getCurrentProject;
window.updateProject = updateProject;
window.createProject = createProject;
window.deleteProject = deleteProject;
window.addCharacter = addCharacter;
window.updateCharacter = updateCharacter;
window.deleteCharacter = deleteCharacter;
window.addPlotThread = addPlotThread;
window.updatePlotThread = updatePlotThread;
window.addWorldEntry = addWorldEntry;
window.updateWorldEntry = updateWorldEntry;
window.addScene = addScene;
window.generateSceneIdeas = generateSceneIdeas;
window.generateTwists = generateTwists;
window.deepenCharacter = deepenCharacter;
window.makeMessier = makeMessier;
window.getTotalWords = getTotalWords;
window.getProjectStats = getProjectStats;
window.exportAllData = exportAllData;
window.importData = importData;
window.resetAllData = resetAllData;
window.escapeHtml = escapeHtml;
window.moveToTrash = moveToTrash;
window.restoreFromArchive = restoreFromArchive;
window.restoreFromTrash = restoreFromTrash;
window.permanentDelete = permanentDelete;
window.emptyTrash = emptyTrash;
window.toggleDarkMode = toggleDarkMode;
window.initDarkMode = initDarkMode;
window.showNotification = showNotification;
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.syncToCloud = syncToCloud;
window.loadFromCloud = loadFromCloud;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleAuth = handleAuth;
