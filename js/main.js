// Main JavaScript file for Odin Sight application

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  if (isLoggedIn()) {
    showMainContent();
    setupLogoutHandler();
    loadUserData();
  } else {
    showLoginScreen();
    setupLoginHandler();
  }
  
  // Set up event handlers for the main application
  setupEventHandlers();
});

// Function to show login screen
function showLoginScreen() {
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';
}

// Function to show main content
function showMainContent() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
}

// Function to set up login handler
function setupLoginHandler() {
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  
  loginBtn.addEventListener('click', async function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!username || !password) {
      loginError.textContent = 'Please enter both username and password';
      return;
    }
    
    try {
      loginError.textContent = '';
      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';
      
      // Try to login
      await loginUser(username, password);
      
      // If successful, show main content
      showMainContent();
      setupLogoutHandler();
      loadUserData();
      
    } catch (error) {
      loginError.textContent = error.message || 'Login failed. Please check your credentials.';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log In';
    }
  });
}

// Function to set up logout handler
function setupLogoutHandler() {
  const logoutBtn = document.getElementById('logout-btn');
  
  logoutBtn.addEventListener('click', function() {
    logoutUser();
    showLoginScreen();
  });
}

// Function to load user data
async function loadUserData() {
  try {
    // Get user profile
    const profile = await getCompanyProfile();
    
    // If profile exists, populate form fields
    if (profile) {
      populateProfileForm(profile);
    }
    
    // If user is admin, load additional admin features
    if (isAdmin()) {
      loadAdminFeatures();
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Function to populate profile form with existing data
function populateProfileForm(profile) {
  document.getElementById('company-name').value = profile.companyName || '';
  document.getElementById('team-size').value = profile.teamSize || '1-10';
  document.getElementById('infrastructure').value = profile.infrastructure || 'On-premise';
  document.getElementById('disaster-recovery').value = profile.disasterRecovery || 'No backups';
  document.getElementById('security').value = profile.security || 'None';
  document.getElementById('gdpr').value = profile.gdpr || 'None';
  document.getElementById('deployment').value = profile.deployment || 'Manual';
  document.getElementById('version-control').value = profile.versionControl || 'No';
  document.getElementById('cto').value = profile.cto || 'No dedicated tech leader';
  document.getElementById('roadmap').value = profile.roadmap || 'Never';
  document.getElementById('ai-usage').value = profile.aiUsage || 'Not at all';
  document.getElementById('ai-strategy').value = profile.aiStrategy || 'No strategy/policy';
  document.getElementById('ai-ethics').value = profile.aiEthics || 'Not considered';
  
  // Load selected apps
  if (profile.selectedApps && profile.selectedApps.length > 0) {
    loadSelectedApps(profile.selectedApps);
  }
}

// Function to load selected apps into UI
function loadSelectedApps(apps) {
  const selectedAppsContainer = document.getElementById('selected-apps');
  const noAppsMessage = document.getElementById('no-apps-message');
  
  // Clear existing apps
  selectedAppsContainer.querySelectorAll('.selected-app-item').forEach(item => item.remove());
  
  // Add each app to the UI
  apps.forEach(app => {
    addAppToSelectedList(app.name, app.category);
  });
  
  // Hide or show the "no apps" message
  if (apps.length > 0) {
    noAppsMessage.style.display = 'none';
  } else {
    noAppsMessage.style.display = 'block';
  }
}

// Function to add an app to the selected list
function addAppToSelectedList(appName, appCategory) {
  const selectedAppsContainer = document.getElementById('selected-apps');
  const noAppsMessage = document.getElementById('no-apps-message');
  
  // Create new app item
  const appItem = document.createElement('div');
  appItem.className = 'selected-app-item';
  appItem.setAttribute('data-app-name', appName);
  appItem.setAttribute('data-app-category', appCategory);
  
  // Add app name and category
  const appText = document.createElement('span');
  appText.textContent = `${appName} (${appCategory})`;
  appItem.appendChild(appText);
  
  // Add remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-app';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', function() {
    appItem.remove();
    
    // Show "no apps" message if no apps are selected
    if (selectedAppsContainer.querySelectorAll('.selected-app-item').length === 0) {
      noAppsMessage.style.display = 'block';
    }
  });
  
  appItem.appendChild(removeBtn);
  selectedAppsContainer.appendChild(appItem);
  
  // Hide "no apps" message
  noAppsMessage.style.display = 'none';
}

// Function to load admin features
function loadAdminFeatures() {
  // Add admin-specific UI elements and functionality here
  console.log('Admin features loaded');
  
  // For example, add an admin section to view all profiles
  const container = document.querySelector('.container');
  
  const adminCard = document.createElement('div');
  adminCard.className = 'card';
  adminCard.innerHTML = `
    <h2>Admin Panel</h2>
    <button id="view-all-profiles-btn">View All User Profiles</button>
    <div id="all-profiles-container" style="display: none; margin-top: 20px;"></div>
  `;
  
  container.appendChild(adminCard);
  
  // Add event listener for the view all profiles button
  document.getElementById('view-all-profiles-btn').addEventListener('click', async function() {
    const allProfilesContainer = document.getElementById('all-profiles-container');
    
    try {
      const profiles = await getAllProfiles();
      
      if (profiles.length === 0) {
        allProfilesContainer.innerHTML = '<p>No profiles found.</p>';
      } else {
        let profilesHTML = '<h3>All User Profiles</h3>';
        profilesHTML += '<div class="table-responsive"><table class="ranking-table">';
        profilesHTML += '<thead><tr><th>Username</th><th>Company</th><th>Team Size</th><th>Created</th><th>Actions</th></tr></thead>';
        profilesHTML += '<tbody>';
        
        profiles.forEach(profile => {
          const createdDate = new Date(profile.createdAt).toLocaleDateString();
          profilesHTML += `
            <tr>
              <td>${profile.user.username}</td>
              <td>${profile.companyName}</td>
              <td>${profile.teamSize}</td>
              <td>${createdDate}</td>
              <td>
                <button class="view-profile-btn" data-profile-id="${profile._id}">View Details</button>
              </td>
            </tr>
          `;
        });
        
        profilesHTML += '</tbody></table></div>';
        allProfilesContainer.innerHTML = profilesHTML;
        
        // Add event listeners for view profile buttons
        document.querySelectorAll('.view-profile-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const profileId = this.getAttribute('data-profile-id');
            viewProfileDetails(profileId, profiles);
          });
        });
      }
      
      allProfilesContainer.style.display = 'block';
    } catch (error) {
      allProfilesContainer.innerHTML = `<p>Error loading profiles: ${error.message}</p>`;
      allProfilesContainer.style.display = 'block';
    }
  });
}

// Function to view profile details (admin feature)
function viewProfileDetails(profileId, profiles) {
  const profile = profiles.find(p => p._id === profileId);
  
  if (!profile) {
    alert('Profile not found');
    return;
  }
  
  // Create modal to display profile details
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'var(--dark)';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflowY = 'auto';
  modalContent.style.border = '1px solid var(--primary)';
  
  // Create profile details HTML
  let detailsHTML = `
    <h3>Profile Details: ${profile.companyName}</h3>
    <p><strong>User:</strong> ${profile.user.username} (${profile.user.role})</p>
    <p><strong>Team Size:</strong> ${profile.teamSize}</p>
    <p><strong>Infrastructure:</strong> ${profile.infrastructure}</p>
    <p><strong>Disaster Recovery:</strong> ${profile.disasterRecovery}</p>
    <p><strong>Security:</strong> ${profile.security}</p>
    <p><strong>GDPR Compliance:</strong> ${profile.gdpr}</p>
    <p><strong>Deployment:</strong> ${profile.deployment}</p>
    <p><strong>Version Control:</strong> ${profile.versionControl}</p>
    <p><strong>CTO:</strong> ${profile.cto}</p>
    <p><strong>Roadmap Updates:</strong> ${profile.roadmap}</p>
    <p><strong>AI Usage:</strong> ${profile.aiUsage}</p>
    <p><strong>AI Strategy:</strong> ${profile.aiStrategy}</p>
    <p><strong>AI Ethics:</strong> ${profile.aiEthics}</p>
  `;
  
  // Add selected apps if any
  if (profile.selectedApps && profile.selectedApps.length > 0) {
    detailsHTML += '<h4>Selected Apps:</h4><ul>';
    profile.selectedApps.forEach(app => {
      detailsHTML += `<li>${app.name} (${app.category})</li>`;
    });
    detailsHTML += '</ul>';
  } else {
    detailsHTML += '<p>No apps selected.</p>';
  }
  
  // Add close button
  detailsHTML += '<button id="close-modal-btn" style="margin-top: 20px;">Close</button>';
  
  modalContent.innerHTML = detailsHTML;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add event listener for close button
  document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.body.removeChild(modal);
  });
}

// Function to set up event handlers for the main application
function setupEventHandlers() {
  // Category selection handler
  const categorySelect = document.getElementById('category');
  const appSelect = document.getElementById('app');
  const addAppBtn = document.getElementById('add-app-btn');
  
  categorySelect.addEventListener('change', function() {
    const category = this.value;
    
    if (!category) {
      appSelect.innerHTML = '<option value="">First select a category</option>';
      appSelect.disabled = true;
      addAppBtn.disabled = true;
      return;
    }
    
    // Populate apps based on selected category
    populateAppOptions(category);
    appSelect.disabled = false;
  });
  
  // App selection handler
  appSelect.addEventListener('change', function() {
    addAppBtn.disabled = !this.value;
  });
  
  // Add app button handler
  addAppBtn.addEventListener('click', function() {
    const appSelect = document.getElementById('app');
    const selectedAppName = appSelect.options[appSelect.selectedIndex].text;
    const selectedAppCategory = document.getElementById('category').value;
    
    // Add app to selected list
    addAppToSelectedList(selectedAppName, selectedAppCategory);
    
    // Reset app selection
    appSelect.selectedIndex = 0;
    addAppBtn.disabled = true;
  });
  
  // Calculate button handler
  document.getElementById('calculate-btn').addEventListener('click', async function() {
    try {
      // Prepare profile data
      const profileData = prepareProfileDataFromForm();
      
      // Save profile to database
      await saveCompanyProfile(profileData);
      
      // Show results
      document.getElementById('results').classList.add('active');
      
      // Scroll to results
      document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
      
      // Calculate and display results (this would use your existing calculation logic)
      calculateAndDisplayResults(profileData);
      
    } catch (error) {
      alert(`Error saving profile: ${error.message}`);
    }
  });
}

// Function to populate app options based on selected category
function populateAppOptions(category) {
  const appSelect = document.getElementById('app');
  
  // Clear existing options
  appSelect.innerHTML = '<option value="">Select an app</option>';
  
  // Get apps for the selected category
  const categoryApps = getAppsByCategory(category);
  
  // Add options for each app
  categoryApps.forEach(app => {
    const option = document.createElement('option');
    option.value = app.name;
    option.textContent = app.name;
    appSelect.appendChild(option);
  });
}

// Function to get apps by category
function getAppsByCategory(category) {
  // This should match your existing app data structure
  // For now, we'll return a simplified version
  
  // This is a placeholder - you should replace this with your actual app data
  const appsByCategory = {
    'Hosting & collaboration': [
      { name: 'Fastmail (Business)', category: 'Hosting & collaboration' },
      { name: 'Google Workspace (Gmail)', category: 'Hosting & collaboration' },
      { name: 'Microsoft 365 (Outlook/Exchange)', category: 'Hosting & collaboration' },
      { name: 'Zoho Mail / Zoho Workplace', category: 'Hosting & collaboration' }
    ],
    'Team Messaging': [
      { name: 'Slack', category: 'Team Messaging' },
      { name: 'Microsoft Teams', category: 'Team Messaging' },
      { name: 'Google Chat', category: 'Team Messaging' },
      { name: 'Discord', category: 'Team Messaging' }
    ],
    'Customer Messaging': [
      { name: 'WhatsApp Business', category: 'Customer Messaging' },
      { name: 'Tidio', category: 'Customer Messaging' },
      { name: 'Freshchat', category: 'Customer Messaging' },
      { name: 'Crisp', category: 'Customer Messaging' }
    ]
    // Add other categories as needed
  };
  
  return appsByCategory[category] || [];
}

// Function to calculate and display results
function calculateAndDisplayResults(profileData) {
  // This function would use your existing calculation logic
  // For now, we'll just display some placeholder content
  
  // Display company name
  document.querySelectorAll('.company-name').forEach(el => {
    el.textContent = profileData.companyName || 'Your Company';
  });
  
  // Calculate a placeholder maturity score
  const maturityScore = calculateMaturityScore(profileData);
  
  // Display current app details
  displayCurrentAppDetails(profileData.selectedApps, maturityScore);
  
  // Display recommendations
  displayRecommendations(profileData);
}

// Function to calculate maturity score
function calculateMaturityScore(profileData) {
  // This is a simplified calculation - replace with your actual logic
  let score = 0;
  
  // Infrastructure score
  if (profileData.infrastructure === 'On-premise') score += 1;
  else if (profileData.infrastructure === 'Hybrid') score += 2;
  else if (profileData.infrastructure === 'Cloud-first (AWS, Azure, GCP)') score += 3;
  else if (profileData.infrastructure === 'Fully automated cloud-native') score += 4;
  
  // Disaster recovery score
  if (profileData.disasterRecovery === 'No backups') score += 0;
  else if (profileData.disasterRecovery === 'Manual occasionally') score += 1.5;
  else if (profileData.disasterRecovery === 'Automated daily') score += 3;
  
  // Security score
  if (profileData.security === 'None') score += 0;
  else if (profileData.security === 'Ad-hoc') score += 1;
  else if (profileData.security === 'Regular vulnerability scans') score += 2;
  else if (profileData.security === 'Formal framework (ISO 27001, SOC2)') score += 3;
  
  // Calculate average and scale to 5
  const totalFactors = 3; // Number of factors we're considering
  const averageScore = score / totalFactors;
  const scaledScore = (averageScore / 4) * 5; // Scale from 0-4 to 0-5
  
  return Math.min(5, Math.max(1, scaledScore)); // Ensure score is between 1 and 5
}

// Function to display current app details
function displayCurrentAppDetails(selectedApps, maturityScore) {
  const currentAppDetailsContainer = document.getElementById('current-app-details');
  
  if (!selectedApps || selectedApps.length === 0) {
    currentAppDetailsContainer.innerHTML = '<p>No apps selected.</p>';
    return;
  }
  
  let detailsHTML = `
    <div style="margin-bottom: 20px;">
      <p><strong>Maturity Score:</strong> ${maturityScore.toFixed(2)}/5</p>
    </div>
    <div class="table-responsive">
    <table class="ranking-table">
      <thead>
        <tr>
          <th>App Name</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  selectedApps.forEach(app => {
    detailsHTML += `
      <tr>
        <td>${app.name}</td>
        <td>${app.category}</td>
      </tr>
    `;
  });
  
  detailsHTML += '</tbody></table></div>';
  currentAppDetailsContainer.innerHTML = detailsHTML;
}

// Function to display recommendations
function displayRecommendations(profileData) {
  const recommendationsContainer = document.getElementById('recommendations');
  
  // Generate recommendations based on profile data
  const recommendations = generateRecommendations(profileData);
  
  if (recommendations.length === 0) {
    recommendationsContainer.innerHTML = '<p>No recommendations available.</p>';
    return;
  }
  
  let recommendationsHTML = '';
  
  recommendations.forEach((recommendation, index) => {
    recommendationsHTML += `
      <div class="recommendation-item">
        <h4>${recommendation.title}</h4>
        <ul class="steps">
          ${recommendation.steps.map(step => `<li>${step}</li>`).join('')}
        </ul>
        <p><span class="score-improvement">${recommendation.improvement}</span></p>
        <button class="view-tasks-btn" data-recommendation="${index}">View Detailed Tasks</button>
        <div class="detailed-tasks" id="detailed-tasks-${index}">
          <p class="task-header">Implementation Plan</p>
          ${recommendation.detailedTasks.map(taskGroup => `
            <p class="task-category">${taskGroup.category}</p>
            <ul class="task-list">
              ${taskGroup.tasks.map(task => `<li>${task}</li>`).join('')}
            </ul>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  recommendationsContainer.innerHTML = recommendationsHTML;
  
  // Add event listeners for view tasks buttons
  document.querySelectorAll('.view-tasks-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const recommendationIndex = this.getAttribute('data-recommendation');
      const detailedTasks = document.getElementById(`detailed-tasks-${recommendationIndex}`);
      
      detailedTasks.classList.toggle('active');
      
      if (detailedTasks.classList.contains('active')) {
        this.textContent = 'Hide Detailed Tasks';
      } else {
        this.textContent = 'View Detailed Tasks';
      }
    });
  });
}

// Function to generate recommendations
function generateRecommendations(profileData) {
  // This is a placeholder - you should replace this with your actual recommendation logic
  const recommendations = [];
  
  // Example recommendation based on disaster recovery
  if (profileData.disasterRecovery === 'No backups' || profileData.disasterRecovery === 'Manual occasionally') {
    recommendations.push({
      title: 'Strengthen Data Protection',
      steps: [
        'Implement automated daily backups of all critical data',
        'Establish off-site backup storage for disaster recovery',
        'Create and test a data restoration procedure',
        'Implement version history and point-in-time recovery',
        'Develop a formal disaster recovery plan with assigned responsibilities'
      ],
      improvement: 'Data loss risk -75%, Recovery time -60%',
      detailedTasks: [
        {
          category: 'Backup Implementation',
          tasks: [
            'Inventory all critical data sources and systems',
            'Select and implement automated backup solutions',
            'Configure backup schedules based on data criticality',
            'Implement backup monitoring and alerting'
          ]
        },
        {
          category: 'Storage & Retention',
          tasks: [
            'Establish off-site and/or cloud backup storage',
            'Implement the 3-2-1 backup strategy (3 copies, 2 media types, 1 off-site)',
            'Create data retention policies aligned with business needs',
            'Implement secure backup encryption'
          ]
        }
      ]
    });
  }
  
  // Example recommendation based on security
  if (profileData.security === 'None' || profileData.security === 'Ad-hoc') {
    recommendations.push({
      title: 'Establish Security Framework',
      steps: [
        'Implement regular vulnerability scanning and remediation',
        'Establish formal security policies and procedures',
        'Conduct security awareness training for all staff',
        'Implement multi-factor authentication across all systems',
        'Consider security compliance frameworks appropriate for your industry'
      ],
      improvement: 'Security incidents -65%, Compliance readiness +70%',
      detailedTasks: [
        {
          category: 'Security Assessment',
          tasks: [
            'Conduct a comprehensive security risk assessment',
            'Implement regular vulnerability scanning',
            'Perform an initial penetration test',
            'Document current security gaps and prioritize remediation'
          ]
        },
        {
          category: 'Policy Development',
          tasks: [
            'Create fundamental security policies (acceptable use, access control, etc.)',
            'Develop incident response procedures',
            'Establish data classification guidelines',
            'Create security standards for systems and applications'
          ]
        }
      ]
    });
  }
  
  return recommendations;
}
