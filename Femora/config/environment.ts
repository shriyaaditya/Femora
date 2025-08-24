// Environment configuration
export const ENV = {
  // Mora Backend Configuration
  MORA_BACKEND_URL: process.env.MORA_BACKEND_URL || 'http://192.168.245.69:5003',
  
  // Firebase Configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'femora-5d93e',
  
  // Development Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Feature Flags
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
};

// Helper function to get environment variable
export const getEnvVar = (key: keyof typeof ENV): string => {
  return ENV[key];
};
