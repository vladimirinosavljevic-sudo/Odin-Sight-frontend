// Authentication functions for Odin Sight

// API URL - pointing to the Vercel backend
const API_URL = 'https://odin-sight-backend.vercel.app/api';

// Function to handle user registration
async function registerUser(username, password, role = 'user') {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        role
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Function to handle user login
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Function to get current user
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user information');
    }
    
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
}

// Function to logout user
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('companyProfile');
  
  // Redirect to login page
  window.location.href = '/';
}

// Function to check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Function to get user role
function getUserRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || null;
}

// Function to check if user is admin
function isAdmin() {
  return getUserRole() === 'admin';
}
