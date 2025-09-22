import { Platform } from 'react-native';

/**
 * Security utilities for input validation, sanitization, and security checks
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  name: /^[a-zA-Z\s\-']{2,50}$/,
  age: /^(?:1[0-9]|[2-9][0-9]|100)$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
};

// Input sanitization functions
export const sanitizeInput = {
  /**
   * Sanitize text input by removing potentially dangerous characters
   */
  text: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .toLowerCase()
      .replace(/[^\w@.-]/g, '') // Remove invalid characters
      .substring(0, 254); // RFC 5321 limit
  },

  /**
   * Sanitize numeric input
   */
  number: (input: string | number): number | null => {
    if (typeof input === 'number') {
      return isFinite(input) ? input : null;
    }
    
    if (typeof input === 'string') {
      const parsed = parseFloat(input.trim());
      return isFinite(parsed) ? parsed : null;
    }
    
    return null;
  },

  /**
   * Sanitize URL input
   */
  url: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    const sanitized = input.trim();
    
    // Only allow HTTP/HTTPS URLs
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      return '';
    }
    
    return sanitized.substring(0, 2048); // Reasonable URL length limit
  },
};

// Input validation functions
export const validateInput = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    return VALIDATION_PATTERNS.email.test(email);
  },

  /**
   * Validate phone number format
   */
  phone: (phone: string): boolean => {
    return VALIDATION_PATTERNS.phone.test(phone);
  },

  /**
   * Validate name format
   */
  name: (name: string): boolean => {
    return VALIDATION_PATTERNS.name.test(name);
  },

  /**
   * Validate age range (1-100)
   */
  age: (age: number | string): boolean => {
    const numAge = sanitizeInput.number(age);
    return numAge !== null && numAge >= 1 && numAge <= 100;
  },

  /**
   * Validate password strength
   */
  password: (password: string): boolean => {
    return VALIDATION_PATTERNS.password.test(password);
  },

  /**
   * Validate URL format
   */
  url: (url: string): boolean => {
    return VALIDATION_PATTERNS.url.test(url);
  },

  /**
   * Validate file type for uploads
   */
  fileType: (filename: string, allowedTypes: string[]): boolean => {
    if (!filename || !allowedTypes.length) return false;
    
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedTypes.includes(extension) : false;
  },

  /**
   * Validate file size
   */
  fileSize: (size: number, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size >= 0 && size <= maxSizeBytes;
  },
};

// Security check functions
export const securityChecks = {
  /**
   * Check if running in development mode
   */
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * Check if running in production mode
   */
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
  },

  /**
   * Check if running on a secure device (not jailbroken/rooted)
   */
  isSecureDevice: async (): Promise<boolean> => {
    // In production, implement proper device security checks
    // For now, return true (assume secure)
    return true;
  },

  /**
   * Check if network connection is secure
   */
  isSecureNetwork: (): boolean => {
    // In production, implement network security checks
    // For now, return true (assume secure)
    return true;
  },

  /**
   * Validate session token format
   */
  isValidSessionToken: (token: string): boolean => {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format validation
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  },

  /**
   * Check if user has necessary permissions
   */
  hasPermission: (userPermissions: string[], requiredPermission: string): boolean => {
    return userPermissions.includes(requiredPermission);
  },
};

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 900000) { // 15 minutes default
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if an action is allowed for a given key
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if under limit
    if (record.count < this.maxAttempts) {
      record.count++;
      record.lastAttempt = now;
      return true;
    }

    return false;
  }

  /**
   * Reset attempts for a given key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Get remaining attempts for a given key
   */
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return this.maxAttempts;
    
    const now = Date.now();
    if (now - record.lastAttempt > this.windowMs) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - record.count);
  }
}

// Export default rate limiter instance
export const defaultRateLimiter = new RateLimiter();
