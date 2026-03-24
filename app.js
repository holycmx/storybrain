// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgzqTB1zJokBz1hXWMo-JpmzIoIpYn3lE",
    authDomain: "story-brain-ec07c.firebaseapp.com",
    projectId: "story-brain-ec07c",
    storageBucket: "story-brain-ec07c.firebasestorage.app",
    messagingSenderId: "244917769549",
    appId: "1:244917769549:web:ddbb7c7390a5776c185304",
    measurementId: "G-TNRYJGZTQ9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global variables
let currentUser = null;
let currentProjectId = null;

// Show status message
function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = isError ? '#dc3545' : '#28a745';
    statusDiv.style.display = 'block';
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Authentication functions
function signIn() {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    if (email && password) {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                showStatus('Signed in successfully!');
                updateAuthUI(userCredential.user);
            })
            .catch((error) => {
                if (error.code === 'auth/user-not-found') {
                    // Create account if doesn't exist
                    auth.createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            showStatus('Account created! You\'re now signed in.');
                            updateAuthUI(userCredential.user);
                        })
                        .catch((error) => {
                            showStatus('Error: ' + error.message, true);
                        });
                } else {
                    showStatus('Error: ' + error.message, true);
                }
            });
    }
}

function signOut() {
    auth.signOut().then(() => {
        showStatus('Signed out successfully');
        updateAuthUI(null);
        location.reload();
    });
}

function updateAuthUI(user) {
    if (user) {
        currentUser = user;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('signInBtn').style.display = 'none';
        document.getElementById('signOutBtn').style.display = 'inline-block';
        loadProjects();
        loadProjectSelectors();
    } else {
        currentUser = null;
        document.getElementById('userEmail').textContent = '';
        document.getElementById('signInBtn').style.display = 'inline-block';
        document.getElementById('signOutBtn').style.display = 'none';
    }
}

// Load all projects for current user
function loadProjects() {
    if (!currentUser) return;
    
    const projectsContainer = document.getElementById('projectsContainer');
    if (projectsContainer) {
        db.collection('users').doc(currentUser.uid).collection('projects')
            .where('status', '==', 'active')
            .orderBy('updatedAt', 'desc')
            .onSnapshot((snapshot) => {
                projectsContainer.innerHTML = '';
                snapshot.forEach((doc) => {
                    const project = doc.data();
                    projectsContainer.innerHTML += `
                        <div class="project-card">
                            <div class="project-title">${escapeHtml(project.title)}</div>
                            <div class="project-meta">Last updated: ${new Date(project.updatedAt).toLocaleDateString()}</div>
                            <p>${escapeHtml(project.description || 'No description')}</p>
                            <div class="project-actions">
                                <button onclick="selectProject('${doc.id}')" class="btn-secondary">Select</button>
                                <button onclick="archiveProject('${doc.id}')" class="btn-secondary">Archive</button>
                                <button onclick="deleteProject('${doc.id}')" class="btn-secondary" style="background-color:#dc3545">Delete</button>
                            </div>
                        </div>
                    `;
                });
                
                if (snapshot.empty) {
                    projectsContainer.innerHTML = '<p>No projects yet. Click "New Project" to get started!</p>';
                }
            });
    }
    
    // Load archive if on archive page
    if (document.getElementById('archiveContainer')) {
        loadArchive();
    }
    
    // Load trash if on trash page
    if (document.getElementById('trashContainer')) {
        loadTrash();
    }
}

// Load archived projects
function loadArchive() {
    if (!currentUser) return;
    
    const archiveContainer = document.getElementById('archiveContainer');
    db.collection('users').doc(currentUser.uid).collection('projects')
        .where('status', '==', 'archived')
        .orderBy('updatedAt', 'desc')
        .onSnapshot((snapshot) => {
            archiveContainer.innerHTML = '';
            snapshot.forEach((doc) => {
                const project = doc.data();
                archiveContainer.innerHTML += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-meta">Archived: ${new Date(project.updatedAt).toLocaleDateString()}</div>
                        <p>${escapeHtml(project.description || 'No description')}</p>
                        <div class="project-actions">
                            <button onclick="restoreProject('${doc.id}')" class="btn-secondary">Restore</button>
                            <button onclick="deleteProjectPermanently('${doc.id}')" class="btn-secondary" style="background-color:#dc3545">Delete Forever</button>
                        </div>
                    </div>
                `;
            });
            
            if (snapshot.empty) {
                archiveContainer.innerHTML = '<p>No archived projects.</p>';
            }
        });
}

// Load deleted projects
function loadTrash() {
    if (!currentUser) return;
    
    const trashContainer = document.getElementById('trashContainer');
    db.collection('users').doc(currentUser.uid).collection('projects')
        .where('status', '==', 'deleted')
        .orderBy('updatedAt', 'desc')
        .onSnapshot((snapshot) => {
            trashContainer.innerHTML = '';
            snapshot.forEach((doc) => {
                const project = doc.data();
                trashContainer.innerHTML += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-meta">Deleted: ${new Date(project.updatedAt).toLocaleDateString()}</div>
                        <p>${escapeHtml(project.description || 'No description')}</p>
                        <div class="project-actions">
                            <button onclick="restoreProject('${doc.id}')" class="btn-secondary">Restore</button>
                            <button onclick="deleteProjectPermanently('${doc.id}')" class="btn-secondary" style="background-color:#dc3545">Delete Forever</button>
                        </div>
                    </div>
                `;
            });
            
            if (snapshot.empty) {
                trashContainer.innerHTML = '<p>Trash is empty.</p>';
            }
        });
}

// Create new project
function createProject() {
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    
    if (!title) {
        showStatus('Please enter a project title', true);
        return;
    }
    
    if (currentUser) {
        const projectData = {
            title: title,
            description: description,
            manuscript: '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        db.collection('users').doc(currentUser.uid).collection('projects').add(projectData)
            .then(() => {
                showStatus('Project created successfully!');
                closeModal();
                document.getElementById('projectTitle').value = '';
                document.getElementById('projectDescription').value = '';
            })
            .catch((error) => {
                showStatus('Error creating project: ' + error.message, true);
            });
    } else {
        showStatus('Please sign in first', true);
    }
}

// Select a project
function selectProject(projectId) {
    currentProjectId = projectId;
    showStatus('Project selected!');
    
    // Redirect to manuscript page if on dashboard
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        window.location.href = 'manuscript.html';
    }
}

// Archive project
function archiveProject(projectId) {
    if (confirm('Archive this project? It will be moved to Archive.')) {
        db.collection('users').doc(currentUser.uid).collection('projects').doc(projectId).update({
            status: 'archived',
            updatedAt: new Date().toISOString()
        }).then(() => {
            showStatus('Project archived');
        }).catch((error) => {
            showStatus('Error: ' + error.message, true);
        });
    }
}

// Delete project (move to trash)
function deleteProject(projectId) {
    if (confirm('Move to trash? You can restore it later.')) {
        db.collection('users').doc(currentUser.uid).collection('projects').doc(projectId).update({
            status: 'deleted',
            updatedAt: new Date().toISOString()
        }).then(() => {
            showStatus('Project moved to trash');
        }).catch((error) => {
            showStatus('Error: ' + error.message, true);
        });
    }
}

// Restore project from archive or trash
function restoreProject(projectId) {
    db.collection('users').doc(currentUser.uid).collection('projects').doc(projectId).update({
        status: 'active',
        updatedAt: new Date().toISOString()
    }).then(() => {
        showStatus('Project restored!');
    }).catch((error) => {
        showStatus('Error: ' + error.message, true);
    });
}

// Permanently delete project
function deleteProjectPermanently(projectId) {
    if (confirm('WARNING: This will permanently delete the project and all its data. This cannot be undone. Are you sure?')) {
        // Delete project and all related data
        const projectRef = db.collection('users').doc(currentUser.uid).collection('projects').doc(projectId);
        
        // Delete characters
        db.collection('users').doc(currentUser.uid).collection('characters')
            .where('projectId', '==', projectId)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });
        
        // Delete locations
        db.collection('users').doc(currentUser.uid).collection('locations')
            .where('projectId', '==', projectId)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });
        
        // Delete project
        projectRef.delete().then(() => {
            showStatus('Project permanently deleted');
        }).catch((error) => {
            showStatus('Error: ' + error.message, true);
        });
    }
}

// Load project selectors for dropdowns
function loadProjectSelectors() {
    const select = document.getElementById('projectSelect');
    if (select && currentUser) {
        db.collection('users').doc(currentUser.uid).collection('projects')
            .where('status', '==', 'active')
            .orderBy('title')
            .onSnapshot((snapshot) => {
                select.innerHTML = '<option value="">-- Select a project --</option>';
                snapshot.forEach((doc) => {
                    const project = doc.data();
                    select.innerHTML += `<option value="${doc.id}">${escapeHtml(project.title)}</option>`;
                });
            });
    }
}

// Load manuscript for selected project
function loadManuscript() {
    const projectId = document.getElementById('projectSelect').value;
    if (projectId && currentUser) {
        currentProjectId = projectId;
        db.collection('users').doc(currentUser.uid).collection('projects').doc(projectId).get()
            .then((doc) => {
                if (doc.exists) {
                    document.getElementById('manuscriptContent').value = doc.data().manuscript || '';
                }
            });
    }
}

// Save manuscript
function saveManuscript() {
    if (!currentProjectId) {
        showStatus('Please select a project first', true);
        return;
    }
    
    const content = document.getElementById('manuscriptContent').value;
    db.collection('users').doc(currentUser.uid).collection('projects').doc(currentProjectId).update({
        manuscript: content,
        updatedAt: new Date().toISOString()
    }).then(() => {
        showStatus('Manuscript saved!');
    }).catch((error) => {
        showStatus('Error saving: ' + error.message, true);
    });
}

// Load characters for selected project
function loadCharacters() {
    const projectId = document.getElementById('projectSelect').value;
    const charactersContainer = document.getElementById('charactersContainer');
    
    if (projectId && currentUser && charactersContainer) {
        currentProjectId = projectId;
        db.collection('users').doc(currentUser.uid).collection('characters')
            .where('projectId', '==', projectId)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                charactersContainer.innerHTML = '';
                snapshot.forEach((doc) => {
                    const character = doc.data();
                    charactersContainer.innerHTML += `
                        <div class="character-card">
                            <div class="character-name">${escapeHtml(character.name)}</div>
                            <div><strong>Role:</strong> ${escapeHtml(character.role || 'Not specified')}</div>
                            <p>${escapeHtml(character.description || 'No description')}</p>
                            <button onclick="deleteCharacter('${doc.id}')" class="btn-secondary" style="background-color:#dc3545">Delete</button>
                        </div>
                    `;
                });
                
                if (snapshot.empty) {
                    charactersContainer.innerHTML = '<p>No characters yet. Click "New Character" to create one!</p>';
                }
            });
    }
}

// Create new character
function createCharacter() {
    const name = document.getElementById('characterName').value;
    const role = document.getElementById('characterRole').value;
    const description = document.getElementById('characterDescription').value;
    
    if (!name) {
        showStatus('Please enter a character name', true);
        return;
    }
    
    if (!currentProjectId) {
        showStatus('Please select a project first', true);
        return;
    }
    
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('characters').add({
            name: name,
            role: role,
            description: description,
            projectId: currentProjectId,
            createdAt: new Date().toISOString()
        }).then(() => {
            showStatus('Character created!');
            closeModal();
            document.getElementById('characterName').value = '';
            document.getElementById('characterRole').value = '';
            document.getElementById('characterDescription').value = '';
        }).catch((error) => {
            showStatus('Error: ' + error.message, true);
        });
    }
}

// Delete character
function deleteCharacter(characterId) {
    if (confirm('Delete this character?')) {
        db.collection('users').doc(currentUser.uid).collection('characters').doc(characterId).delete()
            .then(() => {
                showStatus('Character deleted');
            })
            .catch((error) => {
                showStatus('Error: ' + error.message, true);
            });
    }
}

// Load locations for selected project
function loadLocations() {
    const projectId = document.getElementById('projectSelect').value;
    const locationsContainer = document.getElementById('locationsContainer');
    
    if (projectId && currentUser && locationsContainer) {
        currentProjectId = projectId;
        db.collection('users').doc(currentUser.uid).collection('locations')
            .where('projectId', '==', projectId)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                locationsContainer.innerHTML = '';
                snapshot.forEach((doc) => {
                    const location = doc.data();
                    locationsContainer.innerHTML += `
                        <div class="location-card">
                            <div class="location-name">${escapeHtml(location.name)}</div>
                            <div><strong>Type:</strong> ${escapeHtml(location.type || 'Not specified')}</div>
                            <p>${escapeHtml(location.description || 'No description')}</p>
                            <button onclick="deleteLocation('${doc.id}')" class="btn-secondary" style="background-color:#dc3545">Delete</button>
                        </div>
                    `;
                });
                
                if (snapshot.empty) {
                    locationsContainer.innerHTML = '<p>No locations yet. Click "New Location" to create one!</p>';
                }
            });
    }
}

// Create new location
function createLocation() {
    const name = document.getElementById('locationName').value;
    const type = document.getElementById('locationType').value;
    const description = document.getElementById('locationDescription').value;
    
    if (!name) {
        showStatus('Please enter a location name', true);
        return;
    }
    
    if (!currentProjectId) {
        showStatus('Please select a project first', true);
        return;
    }
    
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('locations').add({
            name: name,
            type: type,
            description: description,
            projectId: currentProjectId,
            createdAt: new Date().toISOString()
        }).then(() => {
            showStatus('Location created!');
            closeModal();
            document.getElementById('locationName').value = '';
            document.getElementById('locationType').value = '';
            document.getElementById('locationDescription').value = '';
        }).catch((error) => {
            showStatus('Error: ' + error.message, true);
        });
    }
}

// Delete location
function deleteLocation(locationId) {
    if (confirm('Delete this location?')) {
        db.collection('users').doc(currentUser.uid).collection('locations').doc(locationId).delete()
            .then(() => {
                showStatus('Location deleted');
            })
            .catch((error) => {
                showStatus('Error: ' + error.message, true);
            });
    }
}

// Format text in manuscript
function formatText(command) {
    const textarea = document.getElementById('manuscriptContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    
    switch(command) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        default:
            return;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
}

// Modal functions
function showNewProjectModal() {
    document.getElementById('projectModal').style.display = 'block';
}

function showNewCharacterModal() {
    if (!currentProjectId && document.getElementById('projectSelect')) {
        const selected = document.getElementById('projectSelect').value;
        if (selected) {
            currentProjectId = selected;
        } else {
            showStatus('Please select a project first', true);
            return;
        }
    }
    document.getElementById('characterModal').style.display = 'block';
}

function showNewLocationModal() {
    if (!currentProjectId && document.getElementById('projectSelect')) {
        const selected = document.getElementById('projectSelect').value;
        if (selected) {
            currentProjectId = selected;
        } else {
            showStatus('Please select a project first', true);
            return;
        }
    }
    document.getElementById('locationModal').style.display = 'block';
}

function closeModal() {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        modal.style.display = 'none';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-save manuscript every 30 seconds
if (document.getElementById('manuscriptContent')) {
    setInterval(() => {
        if (currentProjectId && currentUser) {
            saveManuscript();
        }
    }, 30000);
}

// Listen to auth state changes
auth.onAuthStateChanged((user) => {
    updateAuthUI(user);
});

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
