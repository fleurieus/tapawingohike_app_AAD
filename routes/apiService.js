import { getItemAsync, setItemAsync } from 'expo-secure-store';
const baseUrl = `http://${process.env.EXPO_PUBLIC_API_IP_ADDRESS}:${process.env.EXPO_PUBLIC_API_PORT}/api/v1`;

async function getRequest(url) {
  const token = await getJwtToken();
  return await fetch(baseUrl + url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
  });
}

async function postRequest(url, body) {
  const token = await getJwtToken();
  return await fetch(baseUrl + url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function putRequest(url, body) {
  const token = await getJwtToken();
  return await fetch(baseUrl + url, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function patchRequest(url, body) {
  const token = await getJwtToken();
  return await fetch(baseUrl + url, {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function deleteRequest(url) {
  const token = await getJwtToken();
  return await fetch(baseUrl + url, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
}

async function reAuthenticate(url, body, token) {
  return await fetch(baseUrl + url, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function getJwtToken() {
    // Get the current JWT token from secure storage
    const token = await getItemAsync('jwtToken');
  
    // If token is empty or null, return an empty string
    if (!token) {
      return '';
    }
  
    // Parse the token to extract the payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    const payload = JSON.parse(atob(parts[1])); // Decode base64 payload
  
    // Check if token needs to be refreshed
    if (payload.exp * 1000 < Date.now()) {
      // Get the refresh token and user ID
      const refreshToken = await getItemAsync('refreshToken');
      const userId = await getItemAsync('id');
  
      // Re-authenticate with the refreshToken and current JWT token
      const response = await reAuthenticate(`/user/${userId}`, { refreshToken }, token);
  
      // Check if re-authentication was successful
      if (response.ok) {
        const jsonResponse = await response.json();
        
        // Update tokens in secure storage
        await setItemAsync('refreshToken', jsonResponse.refreshToken);
        await setItemAsync('refreshTokenExpiryTime', jsonResponse.refreshTokenExpiryTime);
        await setItemAsync('jwtToken', jsonResponse.jwtToken);
  
        return jsonResponse.jwtToken; // Return the new JWT token
      }
    }
  
    return token; // Return the current JWT token if no refresh is needed
  }

module.exports = {
  getRequest,
  postRequest,
  putRequest,
  patchRequest,
  deleteRequest,
};
