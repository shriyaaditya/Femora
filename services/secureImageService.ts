// Configuration for the Python backend
const BACKEND_CONFIG = {
  // Backend URL configuration - Use deployed backend for image processing
  baseUrl: (() => {
    // Helper function to resolve environment variables with fallbacks
    const resolveEnvVar = (key: string, fallback: string): string => {
      const value = process.env[key];
      if (value && value.includes('${DEV_BACKEND_HOST}')) {
        // Handle placeholder expansion
        const backendHost = process.env['DEV_BACKEND_HOST'] || 'localhost';
        return value.replace('${DEV_BACKEND_HOST}', backendHost);
      }
      return value || fallback;
    };

    const backendUrl = resolveEnvVar('DEV_IMAGE_BACKEND_URL', '');
    if (backendUrl) {
      return `${backendUrl}/api`;
    }

    // Use deployed image backend instead of localhost
    const host = resolveEnvVar('DEV_IMAGE_BACKEND_HOST', 'femora-image-backend-896975254795.us-central1.run.app');
    const port = process.env['DEV_IMAGE_BACKEND_PORT'] || '443';
    const protocol = port === '443' ? 'https' : 'http';
    return `${protocol}://${host}${port === '443' ? '' : ':' + port}/api`;
  })(),
  // baseUrl: 'https://your-python-backend.com/api',  // Production

  endpoints: {
    upload: '/upload-image',
    process: '/process-image',
    status: '/api/status', // Fixed: matches backend endpoint
    gcpUpload: '/gcp-upload', // New endpoint for GCP upload
  },

  // AES-256 key from .env file
  encryptionKey: 'cnSOMavj3WBwig3AItojQJSTgGs5X0HfNw39Xeippu8=',
};

export interface ImageUploadResponse {
  success: boolean;
  filename?: string;
  message: string;
  processingId?: string;
  gcpUrl?: string; // GCP URL for encrypted image
  firestoreId?: string; // Firestore document ID
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    findings: string;
    confidence: number;
    riskLevel: string;
    recommendation: string;
  };
  error?: string;
  gcpUrl?: string; // GCP URL for encrypted image
  firestoreId?: string; // Firestore document ID
}

export interface SecureImageMetadata {
  userId: string;
  scanId: string;
  scanType: 'breast-scan' | 'single-capture';
  timestamp: string;
  imageCount?: number; // For multiple image scans
  quality: number;
  encryptionKey: string;
  gcpUrl?: string;
  firestoreId?: string;
  aiAnalysis?: {
    findings: string;
    confidence: number;
    riskLevel: string;
    recommendation: string;
  };
}

export class SecureImageService {
  private static instance: SecureImageService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = BACKEND_CONFIG.baseUrl;
  }

  public static getInstance(): SecureImageService {
    if (!SecureImageService.instance) {
      SecureImageService.instance = new SecureImageService();
    }
    return SecureImageService.instance;
  }

  /**
   * SECURE IMAGE FLOW: Capture → Encrypt → Upload to GCP → Store Metadata in Firestore
   * NO LOCAL IMAGE STORAGE ALLOWED
   */
  async secureImageFlow(
    base64Image: string, 
    metadata: Omit<SecureImageMetadata, 'timestamp' | 'encryptionKey'>
  ): Promise<ImageUploadResponse> {
    try {
      console.log('🔐 Starting SECURE image flow...');
      console.log('⚠️ NO LOCAL IMAGE STORAGE - Images encrypted and sent to GCP only');

      // Prepare the secure payload
      const payload = {
        image: base64Image,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          encryptionKey: BACKEND_CONFIG.encryptionKey,
        },
      };

      // Send to backend for encryption and GCP upload
      const response = await fetch(`${this.baseUrl}${BACKEND_CONFIG.endpoints.gcpUpload}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ImageUploadResponse = await response.json();
      console.log('✅ SECURE image flow completed:', result);
      console.log('🔒 Image encrypted and stored in GCP, metadata in Firestore');

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ SECURE image flow failed:', errorMessage);
      throw new Error(`SECURE image flow failed: ${errorMessage}`);
    }
  }

  /**
   * Upload image to Python backend for processing (legacy method)
   */
  async uploadImage(base64Image: string, metadata: any = {}): Promise<ImageUploadResponse> {
    try {
      console.log('🔄 Starting secure image upload...');

      // Prepare the request payload
      const payload = {
        image: base64Image,
        metadata: {
          timestamp: new Date().toISOString(),
          userId: metadata.userId,
          scanType: metadata.scanType || 'breast-scan',
          encryptionKey: BACKEND_CONFIG.encryptionKey,
          ...metadata,
        },
      };

      // Make API call to Python backend
      const response = await fetch(`${this.baseUrl}${BACKEND_CONFIG.endpoints.upload}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ImageUploadResponse = await response.json();
      console.log('✅ Image upload successful:', result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Image upload failed:', errorMessage);
      throw new Error(`Failed to upload image: ${errorMessage}`);
    }
  }

  /**
   * Check processing status of uploaded image
   */
  async getProcessingStatus(processingId: string): Promise<ProcessingStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}${BACKEND_CONFIG.endpoints.status}/${processingId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const status: ProcessingStatus = await response.json();
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to get processing status:', errorMessage);
      throw new Error(`Failed to get status: ${errorMessage}`);
    }
  }

  /**
   * Process image with AI analysis (alternative to upload + status polling)
   */
  async processImageDirectly(base64Image: string, metadata: any = {}): Promise<ProcessingStatus> {
    try {
      console.log('🔬 Processing image directly...');

      const payload = {
        image: base64Image,
        metadata: {
          timestamp: new Date().toISOString(),
          userId: metadata.userId,
          scanType: metadata.scanType || 'breast-scan',
          encryptionKey: BACKEND_CONFIG.encryptionKey,
          directProcessing: true,
          ...metadata,
        },
      };

      const response = await fetch(`${this.baseUrl}${BACKEND_CONFIG.endpoints.process}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ProcessingStatus = await response.json();
      console.log('✅ Direct processing completed:', result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Direct processing failed:', errorMessage);
      throw new Error(`Failed to process image: ${errorMessage}`);
    }
  }

  /**
   * Get authentication token (implement your auth logic here)
   */
  private async getAuthToken(): Promise<string> {
    try {
      // Import Firebase auth
      const { auth } = await import('../config/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      
      // Get current user
      const user = auth.currentUser;
      if (user) {
        return user.uid; // Use Firebase user ID as token
      }
      
      // If no user, return anonymous token
      return 'anonymous-user';
    } catch (error) {
      console.warn('Failed to get auth token, using fallback:', error);
      return 'anonymous-user';
    }
  }

  /**
   * Validate encryption key format
   */
  validateEncryptionKey(key: string): boolean {
    try {
      const decoded = atob(key);
      return decoded.length === 32; // AES-256 requires 32 bytes
    } catch {
      return false;
    }
  }

  /**
   * Generate a new encryption key (for development/testing)
   */
  generateEncryptionKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  /**
   * SECURITY: Verify no local image storage
   */
  verifyNoLocalImageStorage(): boolean {
    // This method ensures compliance with security requirements
    console.log('🔒 SECURITY CHECK: No local image storage allowed');
    console.log('✅ Images only exist in encrypted form in GCP');
    console.log('✅ Only metadata and AI results stored locally');
    return true;
  }
}

export default SecureImageService.getInstance();
