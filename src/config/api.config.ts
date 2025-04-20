// API Configuration

// Get server host - use actual server IP or hostname for remote connections
// Get the current hostname (falls back to IP if needed)
export const getServerHost = (): string => {
  // For remote connections, use the server's actual IP address
  // Default to the server IP address (from ipconfig)
  return "192.168.0.100";
};

// Get the API base URL
export const getApiBaseUrl = (): string => {
  const host = getServerHost();
  return `http://${host}:5000`;
};

// Export the API URL for use in components
export const API_URL = getApiBaseUrl();

// For testing locally - uncomment this line to use localhost
// export const API_URL = 'http://localhost:5000'; 