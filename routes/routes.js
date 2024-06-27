// Import apiservice functions
const { postRequest, getRequest } = require('./apiService');

// Define base API URL
const baseUrl = `http://${process.env.EXPO_PUBLIC_API_IP_ADDRESS}:${process.env.EXPO_PUBLIC_API_PORT}/api/v1`;

// Function to login
async function login(username, password) {
  try {
    const url = '/auth/login';
    const body = { username, password };
    const response = await postRequest(url, body);
    
    if (!response.ok) {
      throw new Error('Login failed');
    }

    const jsonResponse = await response.json();
    return jsonResponse; // Return response data, like tokens
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
}

// Function to update user location
async function updateLocation(userId, latitude, longitude) {
  try {
    const url = `/user/${userId}/location`;
    const body = { latitude, longitude };
    const response = await patchRequest(url, body);
    
    if (!response.ok) {
      throw new Error('Failed to update location');
    }

    const jsonResponse = await response.json();
    return jsonResponse; // Return response data if needed
  } catch (error) {
    console.error('Error updating location:', error.message);
    throw error;
  }
}

// Function to fetch route parts based on team code
async function fetchRouteParts(teamCode) {
  try {
    const url = `/route/parts?teamCode=${teamCode}`;
    const response = await getRequest(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch route parts');
    }

    const jsonResponse = await response.json();
    return jsonResponse; // Return route parts data
  } catch (error) {
    console.error('Error fetching route parts:', error.message);
    throw error;
  }
}

module.exports = {
  login,
  updateLocation,
  fetchRouteParts,
};
