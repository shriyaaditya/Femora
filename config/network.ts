/**
 * Centralized Network Configuration for Femora
 * This file contains all network-related configuration to avoid IP address inconsistencies
 */

declare const process: {
  env: {
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};

// Helper function to resolve environment variables with placeholders
const resolveEnvVar = (key: string, fallback: string): string => {
  try {
    const value = process.env[key];
    if (!value) return fallback;
    if (value.includes('${DEV_BACKEND_HOST}')) {
      // Handle placeholder expansion
      const backendHost = process.env['DEV_BACKEND_HOST'] || 'localhost';
      return value.replace('${DEV_BACKEND_HOST}', backendHost);
    }
    return value;
  } catch (error) {
    console.warn(`Error resolving environment variable ${key}:`, error);
    return fallback;
  }
};

export const networkConfig = {
  development: {
    moraBackend: {
      host: resolveEnvVar('DEV_MORA_BACKEND_HOST', 'femora-mora-backend-896975254795.us-central1.run.app'),
      port: resolveEnvVar('DEV_MORA_BACKEND_PORT', '443'),
      protocol: resolveEnvVar('DEV_MORA_BACKEND_PROTOCOL', 'https'),
    },
    imageBackend: {
      host: resolveEnvVar('DEV_IMAGE_BACKEND_HOST', 'femora-image-backend-896975254795.us-central1.run.app'),
      port: resolveEnvVar('DEV_IMAGE_BACKEND_PORT', '443'),
      protocol: resolveEnvVar('DEV_IMAGE_BACKEND_PROTOCOL', 'https'),
    },
    frontend: {
      host: resolveEnvVar('DEV_FRONTEND_HOST', 'localhost'),
      port: resolveEnvVar('DEV_FRONTEND_PORT', '8081'),
      protocol: resolveEnvVar('DEV_FRONTEND_PROTOCOL', 'http'),
    },
  },
  production: {
    moraBackend: {
      host: resolveEnvVar('PROD_MORA_BACKEND_HOST', 'femora-mora-backend-896975254795.us-central1.run.app'),
      port: resolveEnvVar('PROD_MORA_BACKEND_PORT', '443'),
      protocol: resolveEnvVar('PROD_MORA_BACKEND_PROTOCOL', 'https'),
    },
    imageBackend: {
      host: resolveEnvVar('PROD_IMAGE_BACKEND_HOST', 'femora-image-backend-896975254795.us-central1.run.app'),
      port: resolveEnvVar('PROD_IMAGE_BACKEND_PORT', '443'),
      protocol: resolveEnvVar('PROD_IMAGE_BACKEND_PROTOCOL', 'https'),
    },
    frontend: {
      host: resolveEnvVar('PROD_FRONTEND_HOST', 'your-production-domain.com'),
      port: resolveEnvVar('PROD_FRONTEND_PORT', '443'),
      protocol: resolveEnvVar('PROD_FRONTEND_PROTOCOL', 'https'),
    },
  },
};

// Environment detection
export const getCurrentEnvironment = (): 'development' | 'production' => {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

// Get current network configuration
export const getCurrentNetworkConfig = () => {
  const env = getCurrentEnvironment();
  return networkConfig[env];
};

// URL builders
export const buildMoraBackendUrl = (path: string = '', env?: 'development' | 'production') => {
  try {
    const config = env ? networkConfig[env] : getCurrentNetworkConfig();
    const { protocol, host, port } = config.moraBackend;
    
    // Ensure we have valid values
    if (!protocol || !host || !port) {
      return 'https://femora-mora-backend-896975254795.us-central1.run.app';
    }
    
    // Handle default ports for protocols
    const portString = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80') ? '' : `:${port}`;
    
    return `${protocol}://${host}${portString}${path}`;
  } catch (error) {
    console.warn('Error building Mora backend URL:', error);
    return 'https://femora-mora-backend-896975254795.us-central1.run.app';
  }
};

export const buildImageBackendUrl = (path: string = '', env?: 'development' | 'production') => {
  try {
    const config = env ? networkConfig[env] : getCurrentNetworkConfig();
    const { protocol, host, port } = config.imageBackend;
    
    // Ensure we have valid values
    if (!protocol || !host || !port) {
      return 'http://localhost:8000';
    }
    
    // Handle default ports for protocols
    const portString = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80') ? '' : `:${port}`;
    
    return `${protocol}://${host}${portString}${path}`;
  } catch (error) {
    console.warn('Error building Image backend URL:', error);
    return 'http://localhost:8000';
  }
};

export const buildFrontendUrl = (path: string = '', env?: 'development' | 'production') => {
  try {
    const config = env ? networkConfig[env] : getCurrentNetworkConfig();
    const { protocol, host, port } = config.frontend;
    
    // Ensure we have valid values
    if (!protocol || !host || !port) {
      return 'http://localhost:8081';
    }
    
    // Handle default ports for protocols
    const portString = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80') ? '' : `:${port}`;
    
    return `${protocol}://${host}${portString}${path}`;
  } catch (error) {
    console.warn('Error building Frontend URL:', error);
    return 'http://localhost:8081';
  }
};

// Pre-built URLs for common use cases
export const MORA_BACKEND_URLS = {
  development: buildMoraBackendUrl('', 'development'),
  production: buildMoraBackendUrl('', 'production'),
  current: buildMoraBackendUrl(),
};

export const IMAGE_BACKEND_URLS = {
  development: buildImageBackendUrl('', 'development'),
  production: buildImageBackendUrl('', 'production'),
  current: buildImageBackendUrl(),
};

export const FRONTEND_URLS = {
  development: buildFrontendUrl('', 'development'),
  production: buildFrontendUrl('', 'production'),
  current: buildFrontendUrl(),
};

// Health check URLs
export const MORA_HEALTH_CHECK_URLS = {
  development: buildMoraBackendUrl('/health', 'development'),
  production: buildMoraBackendUrl('/health', 'production'),
  current: buildMoraBackendUrl('/health'),
};

export const IMAGE_HEALTH_CHECK_URLS = {
  development: buildImageBackendUrl('/health', 'development'),
  production: buildImageBackendUrl('/health', 'production'),
  current: buildImageBackendUrl('/health'),
};

// Export default configuration
export default networkConfig;
