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

// Add dark mode styles with CSS variables
function addDarkModeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ============================================
       DARK MODE - CSS Variables Theme - COMPLETE COVERAGE
       Based on provided design tokens
    ============================================ */
    
    .dark {
      /* Base colors */
      --clr-dark-a0: #000000;
      --clr-light-a0: #ffffff;
      
      /* Theme primary colors - Soft lavender */
      --clr-primary-a0: #b47db8;
      --clr-primary-a10: #bd8bc0;
      --clr-primary-a20: #c599c8;
      --clr-primary-a30: #cea7cf;
      --clr-primary-a40: #d6b6d7;
      --clr-primary-a50: #dec4df;
      
      /* Theme surface colors - Dark charcoal */
      --clr-surface-a0: #121212;
      --clr-surface-a10: #282828;
      --clr-surface-a20: #3f3f3f;
      --clr-surface-a30: #575757;
      --clr-surface-a40: #717171;
      --clr-surface-a50: #8b8b8b;
      
      /* Theme tonal surface colors - Warm gray */
      --clr-surface-tonal-a0: #201c20;
      --clr-surface-tonal-a10: #353135;
      --clr-surface-tonal-a20: #4b474b;
      --clr-surface-tonal-a30: #625f62;
      --clr-surface-tonal-a40: #7a777a;
      --clr-surface-tonal-a50: #939193;
      
      /* Status colors */
      --clr-success-a0: #22946e;
      --clr-success-a10: #47d5a6;
      --clr-success-a20: #9ae8ce;
      --clr-warning-a0: #a87a2a;
      --clr-warning-a10: #d7ac61;
      --clr-warning-a20: #ecd7b2;
      --clr-danger-a0: #9c2121;
      --clr-danger-a10: #d94a4a;
      --clr-danger-a20: #eb9e9e;
      --clr-info-a0: #21498a;
      --clr-info-a10: #4077d1;
      --clr-info-a20: #92b2e5;
    }
    
    /* Apply CSS variables to ALL elements */
    .dark {
      color-scheme: dark;
    }
    
    /* Base Background - COMPLETE COVERAGE */
    .dark body,
    .dark .bg-\[#FDF9F4\],
    .dark .bg-background,
    .dark [class*="bg-\[#FDF9F4\]"],
    .dark [class*="bg-\[\#FDF9F4\]"] {
      background-color: var(--clr-surface-a0) !important;
    }
    
    /* Header/Top Bar - Fix the beige header issue */
    .dark header,
    .dark .sticky.top-0,
    .dark .sticky,
    .dark [class*="backdrop-blur"],
    .dark .bg-\[#FDF9F4\]\/80,
    .dark .bg-white\/80,
    .dark [class*="bg-white\/80"] {
      background-color: var(--clr-surface-a0) !important;
      backdrop-filter: blur(8px) !important;
      border-bottom-color: var(--clr-surface-a20) !important;
    }
    
    /* All background colors - COMPREHENSIVE COVERAGE */
    .dark .bg-white,
    .dark .bg-surface,
    .dark .bg-surface-container,
    .dark .bg-surface-container-low,
    .dark .bg-surface-container-lowest,
    .dark .bg-surface-container-high,
    .dark .bg-surface-container-highest,
    .dark .rounded-xl,
    .dark .rounded-2xl,
    .dark [class*="bg-white"],
    .dark [class*="bg-gray-50"],
    .dark [class*="bg-gray-100"],
    .dark [class*="bg-gray-200"],
    .dark [class*="bg-gray-300"],
    .dark [class*="bg-gray-400"] {
      background-color: var(--clr-surface-a10) !important;
    }
    
    /* Cards and containers */
    .dark .bg-white\/90,
    .dark .bg-white\/80,
    .dark .bg-white\/70,
    .dark .bg-white\/60,
    .dark .bg-white\/50,
    .dark .bg-white\/40,
    .dark .bg-white\/30,
    .dark .bg-white\/20,
    .dark .bg-white\/10 {
      background-color: rgba(40, 40, 40, 0.95) !important;
    }
    
    /* Elevated surfaces */
    .dark .shadow-sm,
    .dark .shadow-md,
    .dark .shadow-lg,
    .dark .card-hover:hover {
      background-color: var(--clr-surface-a20) !important;
    }
    
    /* Borders - All borders */
    .dark .border,
    .dark .border-t,
    .dark .border-b,
    .dark .border-l,
    .dark .border-r,
    .dark .border-[#EADDF0],
    .dark .border-gray-200,
    .dark .border-gray-300,
    .dark [class*="border-"] {
      border-color: var(--clr-surface-a20) !important;
    }
    
    /* TEXT COLORS - ALL TEXT */
    .dark .text-gray-800,
    .dark .text-gray-700,
    .dark .text-gray-900,
    .dark .text-on-surface,
    .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6,
    .dark .font-bold,
    .dark .font-semibold,
    .dark .font-headline,
    .dark .text-2xl,
    .dark .text-3xl,
    .dark .text-xl,
    .dark .text-lg,
    .dark [class*="text-gray-800"],
    .dark [class*="text-gray-700"] {
      color: var(--clr-light-a0) !important;
    }
    
    .dark .text-gray-600,
    .dark .text-gray-500,
    .dark .text-on-surface-variant,
    .dark p:not(.text-primary),
    .dark .text-sm:not(.text-primary),
    .dark [class*="text-gray-600"],
    .dark [class*="text-gray-500"] {
      color: var(--clr-surface-a50) !important;
    }
    
    .dark .text-gray-400,
    .dark .text-gray-300,
    .dark [class*="text-gray-400"],
    .dark [class*="text-gray-300"] {
      color: var(--clr-surface-a40) !important;
    }
    
    /* PRIMARY COLOR */
    .dark .bg-primary {
      background-color: var(--clr-primary-a0) !important;
    }
    
    .dark .bg-primary\/10 {
      background-color: rgba(180, 125, 184, 0.12) !important;
    }
    
    .dark .bg-primary\/20 {
      background-color: rgba(180, 125, 184, 0.2) !important;
    }
    
    .dark .text-primary {
      color: var(--clr-primary-a30) !important;
    }
    
    .dark .hover\:bg-primary\/10:hover {
      background-color: rgba(180, 125, 184, 0.18) !important;
    }
    
    .dark .border-primary {
      border-color: var(--clr-primary-a0) !important;
    }
    
    /* SECONDARY COLOR */
    .dark .bg-secondary {
      background-color: var(--clr-surface-tonal-a20) !important;
    }
    
    .dark .text-secondary {
      color: var(--clr-primary-a20) !important;
    }
    
    /* Stats Cards and Info Sections */
    .dark .bg-\[#FAF2FE\],
    .dark .bg-gray-50,
    .dark .bg-gray-100,
    .dark [class*="bg-\[#FAF2FE\]"] {
      background-color: var(--clr-surface-tonal-a0) !important;
    }
    
    /* Buttons */
    .dark button:not(.bg-primary):not(.bg-red-500):not(.bg-green-500):not(.bg-blue-500) {
      background-color: var(--clr-surface-a10) !important;
      color: var(--clr-light-a0) !important;
      border: 1px solid var(--clr-surface-a20) !important;
    }
    
    .dark button:not(.bg-primary):not(.bg-red-500):not(.bg-green-500):not(.bg-blue-500):hover {
      background-color: var(--clr-surface-a20) !important;
    }
    
    /* Input Fields */
    .dark input,
    .dark textarea,
    .dark select {
      background-color: var(--clr-surface-tonal-a0) !important;
      border-color: var(--clr-surface-a20) !important;
      color: var(--clr-light-a0) !important;
    }
    
    .dark input:focus,
    .dark textarea:focus,
    .dark select:focus {
      border-color: var(--clr-primary-a0) !important;
      outline: none !important;
      box-shadow: 0 0 0 2px rgba(180, 125, 184, 0.2) !important;
    }
    
    .dark input::placeholder,
    .dark textarea::placeholder {
      color: var(--clr-surface-a40) !important;
    }
    
    /* Sidebar */
    .dark aside,
    .dark .fixed.left-0,
    .dark [class*="fixed left-0"] {
      background-color: var(--clr-dark-a0) !important;
      border-right-color: var(--clr-surface-a10) !important;
    }
    
    .dark nav a {
      color: var(--clr-surface-a50) !important;
    }
    
    .dark nav a:hover {
      background-color: var(--clr-surface-a10) !important;
      color: var(--clr-light-a0) !important;
    }
    
    .dark nav a.bg-primary\/10 {
      background-color: rgba(180, 125, 184, 0.12) !important;
      color: var(--clr-primary-a30) !important;
    }
    
    /* Modals */
    .dark .fixed.bg-white,
    .dark .modal-content,
    .dark [class*="fixed"] > .bg-white {
      background-color: var(--clr-surface-a10) !important;
      border-color: var(--clr-surface-a20) !important;
    }
    
    /* Progress Bars */
    .dark .bg-gray-100,
    .dark .bg-gray-200 {
      background-color: var(--clr-surface-a20) !important;
    }
    
    .dark .bg-primary.rounded-full {
      background-color: var(--clr-primary-a0) !important;
    }
    
    /* Status Badges */
    .dark .bg-green-100 {
      background-color: rgba(34, 148, 110, 0.2) !important;
      color: var(--clr-success-a10) !important;
    }
    
    .dark .bg-green-50 {
      background-color: rgba(34, 148, 110, 0.15) !important;
    }
    
    .dark .text-green-600,
    .dark .text-green-500 {
      color: var(--clr-success-a10) !important;
    }
    
    .dark .bg-amber-100 {
      background-color: rgba(168, 122, 42, 0.2) !important;
      color: var(--clr-warning-a10) !important;
    }
    
    .dark .bg-red-100 {
      background-color: rgba(156, 33, 33, 0.2) !important;
      color: var(--clr-danger-a10) !important;
    }
    
    .dark .bg-red-50 {
      background-color: rgba(156, 33, 33, 0.15) !important;
    }
    
    .dark .text-red-600,
    .dark .text-red-500 {
      color: var(--clr-danger-a10) !important;
    }
    
    .dark .bg-blue-100 {
      background-color: rgba(33, 73, 138, 0.2) !important;
      color: var(--clr-info-a10) !important;
    }
    
    /* Links */
    .dark a:not(.text-primary) {
      color: var(--clr-surface-a50) !important;
    }
    
    .dark a:not(.text-primary):hover {
      color: var(--clr-primary-a30) !important;
    }
    
    /* Quill Editor */
    .dark .ql-toolbar {
      background-color: var(--clr-surface-a10) !important;
      border-color: var(--clr-surface-a20) !important;
    }
    
    .dark .ql-toolbar button .ql-stroke {
      stroke: var(--clr-surface-a50) !important;
    }
    
    .dark .ql-toolbar button .ql-fill {
      fill: var(--clr-surface-a50) !important;
    }
    
    .dark .ql-toolbar button:hover .ql-stroke,
    .dark .ql-toolbar button:hover .ql-fill {
      stroke: var(--clr-primary-a30) !important;
      fill: var(--clr-primary-a30) !important;
    }
    
    .dark .ql-editor {
      background-color: var(--clr-surface-a10) !important;
      color: var(--clr-light-a0) !important;
    }
    
    .dark .ql-picker {
      color: var(--clr-surface-a50) !important;
    }
    
    .dark .ql-picker-options {
      background-color: var(--clr-surface-a20) !important;
      color: var(--clr-light-a0) !important;
    }
    
    /* Toast Notifications */
    .dark .bg-green-500 {
      background-color: var(--clr-success-a0) !important;
      color: var(--clr-light-a0) !important;
    }
    
    .dark .bg-red-500 {
      background-color: var(--clr-danger-a0) !important;
      color: var(--clr-light-a0) !important;
    }
    
    .dark .bg-blue-500 {
      background-color: var(--clr-info-a0) !important;
      color: var(--clr-light-a0) !important;
    }
    
    /* Scrollbar */
    .dark ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    .dark ::-webkit-scrollbar-track {
      background: var(--clr-surface-a0);
    }
    
    .dark ::-webkit-scrollbar-thumb {
      background: var(--clr-surface-a30);
      border-radius: 5px;
    }
    
    .dark ::-webkit-scrollbar-thumb:hover {
      background: var(--clr-surface-a40);
    }
    
    /* Dropdown menus */
    .dark select option {
      background-color: var(--clr-surface-a20);
      color: var(--clr-light-a0);
    }
    
    /* Icons */
    .dark .material-symbols-outlined {
      color: inherit;
    }
    
    /* Dividers */
    .dark hr {
      border-color: var(--clr-surface-a20) !important;
    }
    
    /* Cards with hover effects */
    .dark .card-hover:hover,
    .dark .hover\:shadow-lg:hover {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
      background-color: var(--clr-surface-a20) !important;
    }
    
    /* Project cards */
    .dark [data-project-id] {
      background-color: var(--clr-surface-a10) !important;
    }
    
    .dark [data-project-id]:hover {
      background-color: var(--clr-surface-a20) !important;
    }
    
    /* Stats numbers */
    .dark .text-3xl,
    .dark .text-2xl.font-bold {
      color: var(--clr-primary-a30) !important;
    }
    
    /* Headers in stats cards */
    .dark .text-primary.font-bold {
      color: var(--clr-primary-a30) !important;
    }
    
    /* Modal close button */
    .dark .text-gray-400:hover {
      color: var(--clr-primary-a30) !important;
    }
    
    /* Headline text */
    .dark .font-headline {
      color: var(--clr-primary-a20) !important;
    }
    
    /* Success text */
    .dark .text-success {
      color: var(--clr-success-a10) !important;
    }
    
    /* Warning text */
    .dark .text-warning {
      color: var(--clr-warning-a10) !important;
    }
    
    /* Danger text */
    .dark .text-danger {
      color: var(--clr-danger-a10) !important;
    }
    
    /* Info text */
    .dark .text-info {
      color: var(--clr-info-a10) !important;
    }
    
    /* Dashboard specific - Hero section */
    .dark .bg-surface-container-low {
      background-color: var(--clr-surface-a10) !important;
    }
    
    /* Ensure all cards have proper background */
    .dark .bg-white.rounded-xl,
    .dark .bg-white.rounded-2xl {
      background-color: var(--clr-surface-a10) !important;
    }
    
    /* Fix any remaining beige backgrounds */
    .dark [class*="bg-\[#"],
    .dark [class*="bg-#"],
    .dark [style*="background"] {
      background-color: var(--clr-surface-a10) !important;
    }
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
// Delete forever
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
window.toggleDarkMode = toggleDarkMode;
window.initDarkMode = initDarkMode;
window.showNotification = showNotification;
window.permanentDelete = permanentDelete;
window.emptyTrash = emptyTrash;
