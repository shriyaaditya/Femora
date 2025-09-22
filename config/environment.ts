import { Platform } from 'react-native';
import { validateEnvironmentVariables } from './security';
import { MORA_BACKEND_URLS, IMAGE_BACKEND_URLS, getCurrentEnvironment } from './network';

// Environment detection
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Backend configuration
export const BACKEND_CONFIG = {
  // Development backend
  development: {
    moraUrl: MORA_BACKEND_URLS.development,
    imageUrl: IMAGE_BACKEND_URLS.development,
    timeout: 30000,
  },
  // Production backend
  production: {
    moraUrl: MORA_BACKEND_URLS.production,
    imageUrl: IMAGE_BACKEND_URLS.production,
    timeout: 60000,
  },
};

// Get current backend configuration
export const getBackendConfig = () => {
  const env = getCurrentEnvironment();
  return BACKEND_CONFIG[env];
};

// Firebase configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env['FIREBASE_API_KEY'] || '',
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
  projectId: process.env['FIREBASE_PROJECT_ID'] || '',
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
  appId: process.env['FIREBASE_APP_ID'] || '',
  measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || '',
};

// Google Cloud Platform configuration
export const GCP_CONFIG = {
  bucketName: process.env['GCP_BUCKET_NAME'] || '',
  projectId: process.env['GCP_PROJECT_ID'] || '',
  region: process.env['GCP_REGION'] || 'us-central1',
  credentials: {
    type: process.env['GCP_CREDENTIALS_TYPE'] || 'service_account',
    project_id: process.env['GCP_PROJECT_ID'] || '',
    private_key_id: process.env['GCP_PRIVATE_KEY_ID'] || '',
    private_key: process.env['GCP_PRIVATE_KEY'] || '',
    client_email: process.env['GCP_CLIENT_EMAIL'] || '',
    client_id: process.env['GCP_CLIENT_ID'] || '',
    auth_uri: process.env['GCP_AUTH_URI'] || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env['GCP_TOKEN_URI'] || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env['GCP_AUTH_PROVIDER_X509_CERT_URL'] || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env['GCP_CLIENT_X509_CERT_URL'] || '',
  },
};

// AI/ML configuration
export const AI_CONFIG = {
  googleApiKey: process.env['GOOGLE_API_KEY'] || '',
  model: process.env['GOOGLE_MODEL'] || 'gemini-1.5-flash',
  maxTokens: parseInt(process.env['GOOGLE_MAX_TOKENS'] || '100'),
  temperature: parseFloat(process.env['GOOGLE_TEMPERATURE'] || '0.7'),
};

// Security configuration
export const SECURITY_CONFIG = {
  encryptionKey: process.env['ENCRYPTION_KEY_BASE64'] || '',
  jwtSecret: process.env['JWT_SECRET'] || '',
  sessionTimeout: parseInt(process.env['SESSION_TIMEOUT'] || '3600000'), // 1 hour
  maxLoginAttempts: parseInt(process.env['MAX_LOGIN_ATTEMPTS'] || '5'),
  lockoutDuration: parseInt(process.env['LOCKOUT_DURATION'] || '900000'), // 15 minutes
};

// App configuration
export const APP_CONFIG = {
  name: 'Femora',
  version: '3.0.0',
  buildNumber: process.env['BUILD_NUMBER'] || '1',
  bundleId: Platform.select({
    ios: 'com.femora.ios',
    android: 'com.femora.android',
    web: 'com.femora.web',
  }) || 'com.femora',
};

// Feature flags
export const FEATURE_FLAGS = {
  enableAdvancedScanning: process.env['ENABLE_ADVANCED_SCANNING'] === 'true',
  enableOfflineMode: process.env['ENABLE_OFFLINE_MODE'] === 'true',
  enableAnalytics: process.env['ENABLE_ANALYTICS'] === 'true',
  enableCrashReporting: process.env['ENABLE_CRASH_REPORTING'] === 'true',
};

// Validation function
export const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors = validateEnvironmentVariables();
  
  // Additional validation
  if (!getBackendConfig().moraUrl) {
    errors.push('Mora Backend URL is not configured');
  }
  
  if (!getBackendConfig().imageUrl) {
    errors.push('Image Backend URL is not configured');
  }
  
  if (!FIREBASE_CONFIG.projectId) {
    errors.push('Firebase project ID is not configured');
  }
  
  if (!GCP_CONFIG.bucketName) {
    errors.push('GCP bucket name is not configured');
  }
  
  if (!AI_CONFIG.googleApiKey) {
    errors.push('Google API key is not configured');
  }
  
  if (!SECURITY_CONFIG.encryptionKey) {
    errors.push('Encryption key is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Configuration export
export default {
  ENV,
  BACKEND_CONFIG: getBackendConfig(),
  FIREBASE_CONFIG,
  GCP_CONFIG,
  AI_CONFIG,
  SECURITY_CONFIG,
  APP_CONFIG,
  FEATURE_FLAGS,
  validateConfiguration,
};
