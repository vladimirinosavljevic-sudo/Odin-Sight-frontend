// Company Profile Management for Odin Sight
   
// Function to save company profile
async function saveCompanyProfile(profileData) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save company profile');
    }
    
    // Store profile in localStorage for quick access
    localStorage.setItem('companyProfile', JSON.stringify(data.profile));
    
    return data.profile;
  } catch (error) {
    console.error('Save profile error:', error);
    throw error;
  }
}

// Function to get company profile
async function getCompanyProfile() {
  try {
    // Check if we have it in localStorage first
    const cachedProfile = localStorage.getItem('companyProfile');
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      // If profile not found, return null instead of throwing error
      if (response.status === 404) {
        return null;
      }
      throw new Error(data.message || 'Failed to get company profile');
    }
    
    // Store profile in localStorage for quick access
    localStorage.setItem('companyProfile', JSON.stringify(data.profile));
    
    return data.profile;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

// Function to delete company profile
async function deleteCompanyProfile() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete company profile');
    }
    
    // Remove profile from localStorage
    localStorage.removeItem('companyProfile');
    
    return true;
  } catch (error) {
    console.error('Delete profile error:', error);
    throw error;
  }
}

// Admin function to get all profiles
async function getAllProfiles() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/profile/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get company profiles');
    }
    
    return data.profiles;
  } catch (error) {
    console.error('Get all profiles error:', error);
    throw error;
  }
}

// Function to prepare profile data from form
function prepareProfileDataFromForm() {
  return {
    companyName: document.getElementById('company-name').value,
    teamSize: document.getElementById('team-size').value,
    infrastructure: document.getElementById('infrastructure').value,
    disasterRecovery: document.getElementById('disaster-recovery').value,
    security: document.getElementById('security').value,
    gdpr: document.getElementById('gdpr').value,
    deployment: document.getElementById('deployment').value,
    versionControl: document.getElementById('version-control').value,
    cto: document.getElementById('cto').value,
    roadmap: document.getElementById('roadmap').value,
    aiUsage: document.getElementById('ai-usage').value,
    aiStrategy: document.getElementById('ai-strategy').value,
    aiEthics: document.getElementById('ai-ethics').value,
    selectedApps: getSelectedApps() // This function needs to be implemented based on your UI
  };
}

// Helper function to get selected apps from UI
function getSelectedApps() {
  // This implementation depends on how you store selected apps in your UI
  // For example, if you have a hidden input or data attribute storing the selected apps
  const selectedAppsContainer = document.getElementById('selected-apps');
  const selectedAppItems = selectedAppsContainer.querySelectorAll('.selected-app-item');
  
  const selectedApps = [];
  selectedAppItems.forEach(item => {
    const appName = item.getAttribute('data-app-name');
    const appCategory = item.getAttribute('data-app-category');
    
    if (appName && appCategory) {
      selectedApps.push({
        name: appName,
        category: appCategory
      });
    }
  });
  
  return selectedApps;
}
