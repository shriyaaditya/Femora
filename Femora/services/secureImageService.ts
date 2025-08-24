// Configuration for the Python backend
const BACKEND_CONFIG = {
  // Replace with your actual backend URL
  baseUrl: 'http://localhost:8000/api',  // Local development
  // baseUrl: 'https://your-python-backend.com/api',  // Production
  
  endpoints: {
    upload: '/upload-image',
    process: '/process-image',
    status: '/status',
  },
  
  // AES-256 key (should be stored securely in production)
  encryptionKey: 'your-base64-encryption-key-here',
};

export interface ImageUploadResponse {
  success: boolean;
  filename?: string;
  message: string;
  processingId?: string;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    findings: string;
    confidence: number;
    riskLevel: string;
    recommendation: string;
    analysisId?: string;
    timestamp?: Date;
  };
  error?: string;
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
   * Upload image to Python backend for processing
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
          'Authorization': `Bearer ${await this.getAuthToken()}`,
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
      const response = await fetch(`${this.baseUrl}${BACKEND_CONFIG.endpoints.status}/${processingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

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
          'Authorization': `Bearer ${await this.getAuthToken()}`,
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
    // In production, implement proper authentication
    // For now, return a placeholder or implement your auth system
    return 'your-auth-token-here';
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
}

export default SecureImageService.getInstance();
