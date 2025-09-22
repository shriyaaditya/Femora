import { Platform } from 'react-native';

// Environment-based configuration
const ENV = process.env.NODE_ENV || 'development';

// Security configuration interface
export interface SecurityConfig {
  encryption: {
    algorithm: 'AES-256-GCM';
    keyLength: 32; // bytes
    ivLength: 12; // bytes for GCM
  };
  authentication: {
    tokenExpiry: number; // milliseconds
    refreshTokenExpiry: number; // milliseconds
  };
  api: {
    timeout: number; // milliseconds
    retryAttempts: number;
  };
  storage: {
    encryptionEnabled: boolean;
    keychainService: string;
  };
}

// Production security configuration
const PRODUCTION_CONFIG: SecurityConfig = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 12,
  },
  authentication: {
    tokenExpiry: 15 * 60 * 1000, // 15 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  storage: {
    encryptionEnabled: true,
    keychainService: 'com.femora.secure',
  },
};

// Development security configuration (less strict for testing)
const DEVELOPMENT_CONFIG: SecurityConfig = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 12,
  },
  authentication: {
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  api: {
    timeout: 60000, // 60 seconds
    retryAttempts: 5,
  },
  storage: {
    encryptionEnabled: false, // Disable for easier debugging
    keychainService: 'com.femora.dev',
  },
};

// Export the appropriate configuration
export const SECURITY_CONFIG: SecurityConfig = ENV === 'production' 
  ? PRODUCTION_CONFIG 
  : DEVELOPMENT_CONFIG;

// Environment variables validation
export const validateEnvironmentVariables = (): string[] => {
  const errors: string[] = [];
  
  const requiredVars = [
    'GOOGLE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'GCP_BUCKET_NAME',
    'ENCRYPTION_KEY_BASE64',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  return errors;
};

// Secure key generation utilities
export const generateSecureKey = (): string => {
  if (Platform.OS === 'web') {
    // Web environment
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  } else {
    // React Native environment
    const array = new Uint8Array(32);
    // Note: In production, use a proper crypto library like react-native-crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }
};

// Validate encryption key format
export const validateEncryptionKey = (key: string): boolean => {
  try {
    if (!key || typeof key !== 'string') return false;
    
    const decoded = atob(key);
    return decoded.length === SECURITY_CONFIG.encryption.keyLength;
  } catch {
    return false;
  }
};

// Secure storage utilities
export const getSecureStorageKey = (key: string): string => {
  return `femora_secure_${key}`;
};

// API security utilities
export const getSecureHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Version': '3.0.0',
    'X-Platform': Platform.OS,
    'X-Timestamp': Date.now().toString(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
