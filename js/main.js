// Main JavaScript for Odin Sight Application

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Check if user is admin
function isAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
}

// Show login screen
function showLoginScreen() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';
}

// Show main content
function showMainContent() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
}

// Setup logout handler
function setupLogoutHandler() {
  document.getElementById('logout-button').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('companyProfile');
    window.location.reload();
  });
}

// Setup login handler
function setupLoginHandler() {
  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      await login(email, password);
      showMainContent();
      setupLogoutHandler();
      loadUserData();
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  });
  
  // Setup registration tab
  document.getElementById('register-tab').addEventListener('click', function() {
    document.getElementById('login-tab-content').style.display = 'none';
    document.getElementById('register-tab-content').style.display = 'block';
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
  });
  
  // Setup login tab
  document.getElementById('login-tab').addEventListener('click', function() {
    document.getElementById('register-tab-content').style.display = 'none';
    document.getElementById('login-tab-content').style.display = 'block';
    document.getElementById('register-tab').classList.remove('active');
    document.getElementById('login-tab').classList.add('active');
  });
  
  // Setup registration form
  document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await register(name, email, password);
      // Switch to login tab after successful registration
      document.getElementById('login-tab').click();
      alert('Registration successful! Please log in.');
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  });
}

// Setup event handlers for the main application
function setupEventHandlers() {
  // Setup profile form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const profileData = prepareProfileDataFromForm();
        await saveCompanyProfile(profileData);
        alert('Profile saved successfully!');
      } catch (error) {
        alert('Failed to save profile: ' + error.message);
      }
    });
  }
  
  // Setup app selection
  const appItems = document.querySelectorAll('.app-item');
  appItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('selected');
      updateSelectedApps();
    });
  });
}

// Update selected apps in the UI
function updateSelectedApps() {
  const selectedAppsContainer = document.getElementById('selected-apps');
  selectedAppsContainer.innerHTML = '';
  
  const selectedAppItems = document.querySelectorAll('.app-item.selected');
  
  selectedAppItems.forEach(item => {
    const appName = item.getAttribute('data-app-name');
    const appCategory = item.getAttribute('data-app-category');
    
    const selectedAppElement = document.createElement('div');
    selectedAppElement.classList.add('selected-app-item');
    selectedAppElement.setAttribute('data-app-name', appName);
    selectedAppElement.setAttribute('data-app-category', appCategory);
    selectedAppElement.textContent = appName;
    
    selectedAppsContainer.appendChild(selectedAppElement);
  });
}

// Load user data
async function loadUserData() {
  try {
    // Get user info
    const user = await getCurrentUser();
    
    // Display user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
    
    // Get and display company profile if it exists
    try {
      const profile = await getCompanyProfile();
      
      // If profile exists, populate form fields
      if (profile) {
        console.log('User profile found - populating form fields');
        populateProfileForm(profile);
      } else {
        console.log('No user profile found');
      }
      
      // If user is admin, load additional admin features
      if (isAdmin()) {
        console.log('Admin user detected - loading admin features');
        loadAdminFeatures();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Populate profile form with data
function populateProfileForm(profile) {
  document.getElementById('company-name').value = profile.companyName || '';
  document.getElementById('team-size').value = profile.teamSize || '';
  document.getElementById('infrastructure').value = profile.infrastructure || '';
  document.getElementById('disaster-recovery').value = profile.disasterRecovery || '';
  document.getElementById('security').value = profile.security || '';
  document.getElementById('gdpr').value = profile.gdpr || '';
  document.getElementById('deployment').value = profile.deployment || '';
  document.getElementById('version-control').value = profile.versionControl || '';
  document.getElementById('cto').value = profile.cto || '';
  document.getElementById('roadmap').value = profile.roadmap || '';
  document.getElementById('ai-usage').value = profile.aiUsage || '';
  document.getElementById('ai-strategy').value = profile.aiStrategy || '';
  document.getElementById('ai-ethics').value = profile.aiEthics || '';
  
  // Populate selected apps
  const selectedAppsContainer = document.getElementById('selected-apps');
  selectedAppsContainer.innerHTML = '';
  
  if (profile.selectedApps && Array.isArray(profile.selectedApps)) {
    profile.selectedApps.forEach(app => {
      const selectedAppElement = document.createElement('div');
      selectedAppElement.classList.add('selected-app-item');
      selectedAppElement.setAttribute('data-app-name', app.name);
      selectedAppElement.setAttribute('data-app-category', app.category);
      selectedAppElement.textContent = app.name;
      
      selectedAppsContainer.appendChild(selectedAppElement);
      
      // Also mark the corresponding app item as selected
      const appItem = document.querySelector(`.app-item[data-app-name="${app.name}"]`);
      if (appItem) {
        appItem.classList.add('selected');
      }
    });
  }
}

// Load admin features
function loadAdminFeatures() {
  // Create admin panel
  const adminPanel = document.createElement('div');
  adminPanel.id = 'admin-panel';
  adminPanel.className = 'admin-panel';
  adminPanel.innerHTML = `
    <h2>Admin Panel</h2>
    <button id="load-all-profiles">Load All Profiles</button>
    <div id="all-profiles-container"></div>
  `;
  
  // Add admin panel to the page
  document.getElementById('main-content').appendChild(adminPanel);
  
  // Setup event handler for loading all profiles
  document.getElementById('load-all-profiles').addEventListener('click', async function() {
    try {
      const profiles = await getAllProfiles();
      displayAllProfiles(profiles);
    } catch (error) {
      alert('Failed to load profiles: ' + error.message);
    }
  });
}

// Display all profiles in the admin panel
function displayAllProfiles(profiles) {
  const container = document.getElementById('all-profiles-container');
  container.innerHTML = '';
  
  if (!profiles || profiles.length === 0) {
    container.innerHTML = '<p>No profiles found</p>';
    return;
  }
  
  profiles.forEach(profile => {
    const profileElement = document.createElement('div');
    profileElement.className = 'profile-card';
    profileElement.innerHTML = `
      <h3>${profile.companyName || 'Unnamed Company'}</h3>
      <p><strong>Team Size:</strong> ${profile.teamSize || 'N/A'}</p>
      <p><strong>User:</strong> ${profile.userId.name || 'Unknown'}</p>
      <p><strong>Email:</strong> ${profile.userId.email || 'N/A'}</p>
      <button class="view-profile-btn" data-profile-id="${profile._id}">View Details</button>
    `;
    
    container.appendChild(profileElement);
  });
  
  // Setup event handlers for view buttons
  document.querySelectorAll('.view-profile-btn').forEach(button => {
    button.addEventListener('click', function() {
      const profileId = this.getAttribute('data-profile-id');
      const profile = profiles.find(p => p._id === profileId);
      
      if (profile) {
        displayProfileDetails(profile);
      }
    });
  });
}

// Display detailed profile information
function displayProfileDetails(profile) {
  // Create modal for profile details
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${profile.companyName || 'Unnamed Company'}</h2>
      <div class="profile-details">
        <p><strong>Team Size:</strong> ${profile.teamSize || 'N/A'}</p>
        <p><strong>Infrastructure:</strong> ${profile.infrastructure || 'N/A'}</p>
        <p><strong>Disaster Recovery:</strong> ${profile.disasterRecovery || 'N/A'}</p>
        <p><strong>Security:</strong> ${profile.security || 'N/A'}</p>
        <p><strong>GDPR:</strong> ${profile.gdpr || 'N/A'}</p>
        <p><strong>Deployment:</strong> ${profile.deployment || 'N/A'}</p>
        <p><strong>Version Control:</strong> ${profile.versionControl || 'N/A'}</p>
        <p><strong>CTO:</strong> ${profile.cto || 'N/A'}</p>
        <p><strong>Roadmap:</strong> ${profile.roadmap || 'N/A'}</p>
        <p><strong>AI Usage:</strong> ${profile.aiUsage || 'N/A'}</p>
        <p><strong>AI Strategy:</strong> ${profile.aiStrategy || 'N/A'}</p>
        <p><strong>AI Ethics:</strong> ${profile.aiEthics || 'N/A'}</p>
      </div>
      <h3>Selected Apps</h3>
      <div class="selected-apps-list">
        ${profile.selectedApps && profile.selectedApps.length > 0 
          ? profile.selectedApps.map(app => `<div class="app-tag">${app.name}</div>`).join('') 
          : '<p>No apps selected</p>'}
      </div>
    </div>
  `;
  
  // Add modal to the page
  document.body.appendChild(modal);
  
  // Show modal
  modal.style.display = 'block';
  
  // Setup close button
  modal.querySelector('.close').addEventListener('click', function() {
    modal.style.display = 'none';
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  });
}
