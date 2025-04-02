import jwtDecode from 'jwt-decode';

const TOKEN_KEY = 'auth_token';

// Save the JWT token to localStorage
export const setToken = (token) => {
  console.log('Setting token:', token);
  localStorage.setItem(TOKEN_KEY, token);
};

// Alias for setToken to maintain compatibility
export const setAccessToken = setToken;

// Get the JWT token from localStorage
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('Getting token:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

// Alias for getToken to maintain compatibility
export const getAccessToken = getToken;

// Remove the JWT token from localStorage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Alias for removeToken to maintain compatibility
export const removeAccessToken = removeToken;

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) {
    console.log("No token found");
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      console.log("Token expired");
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    removeToken();
    return false;
  }
};

// Get user info from decoded token
export const getUserInfo = () => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
      timestamp: decoded.timestamp
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return null;
  }
};

// Logout the user
export const logout = () => {
  removeToken();
};

// Verify the token is valid and contains expected properties
export const validateTokenFormat = () => {
  const token = getToken();
  if (!token) {
    console.error("No token found to validate");
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    const requiredFields = ['sub', 'exp', 'userId', 'email', 'roles', 'timestamp'];
    
    for (const field of requiredFields) {
      if (decoded[field] === undefined) {
        console.error(`Token missing required field: ${field}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};
