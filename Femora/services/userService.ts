import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  onboarding?: OnboardingData;
  preferences?: UserPreferences;
}

export interface OnboardingData {
  age: number;
  pastScan: 'Yes' | 'No';
  familyHistory: 'Yes' | 'No';
  pastConditions: string[];
  periodStartAge: number;
  status: 'None' | 'Pregnant' | 'Breastfeeding' | 'Post-menopausal';
  hormonalMeds: 'Yes' | 'No';
  smokeAlcohol: 'Yes' | 'No';
  chronic: string[];
  completedAt: Date;
}

export interface UserPreferences {
  notifications: boolean;
  privacyLevel: 'public' | 'private' | 'friends';
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface ScanSession {
  id: string;
  userId: string;
  scanType: 'breast-scan' | 'mammogram' | 'ultrasound';
  scanTime: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  images: string[]; // Base64 or URLs
  analysisResults?: ScanAnalysis;
  processingStatus?: ProcessingStatus;
  backendUsed?: 'python' | 'local';
  gcsUrls?: string[];
  metadata?: Record<string, any>;
}

export interface ScanAnalysis {
  findings: string;
  confidence: number;
  riskLevel: 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  recommendation: string;
  analysisId: string;
  timestamp: Date;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ScanAnalysis;
  error?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivityAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get or create user profile
   */
  async getUserProfile(user: User): Promise<UserProfile> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || data.displayName,
          photoURL: user.photoURL || data.photoURL,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
          onboarding: data.onboarding,
          preferences: data.preferences,
        };
      } else {
        // Create new user profile
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        await setDoc(userRef, newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        lastUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Save onboarding data
   */
  async saveOnboardingData(uid: string, onboardingData: OnboardingData): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        onboarding: {
          ...onboardingData,
          completedAt: new Date(),
        },
        lastUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw new Error('Failed to save onboarding data');
    }
  }

  /**
   * Get onboarding data
   */
  async getOnboardingData(uid: string): Promise<OnboardingData | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().onboarding || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting onboarding data:', error);
      return null;
    }
  }

  /**
   * Create new scan session
   */
  async createScanSession(userId: string, scanData: Partial<ScanSession>): Promise<string> {
    try {
      const scansRef = collection(db, 'users', userId, 'scans');
      const newDocRef = doc(scansRef);
      await setDoc(newDocRef, {
        userId,
        scanType: scanData.scanType || 'breast-scan',
        scanTime: serverTimestamp(),
        status: 'pending',
        images: scanData.images || [],
        metadata: scanData.metadata || {},
        createdAt: serverTimestamp(),
      });

      return newDocRef.id;
    } catch (error) {
      console.error('Error creating scan session:', error);
      throw new Error('Failed to create scan session');
    }
  }

  /**
   * Update scan session
   */
  async updateScanSession(userId: string, scanId: string, updates: Partial<ScanSession>): Promise<void> {
    try {
      const scanRef = doc(db, 'users', userId, 'scans', scanId);
      await updateDoc(scanRef, {
        ...updates,
        lastUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating scan session:', error);
      throw new Error('Failed to update scan session');
    }
  }

  /**
   * Get scan sessions for user
   */
  async getScanSessions(userId: string): Promise<ScanSession[]> {
    try {
      const scansRef = collection(db, 'users', userId, 'scans');
      const scansQuery = query(scansRef, orderBy('scanTime', 'desc'));
      const querySnapshot = await getDocs(scansQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          scanType: data.scanType || 'breast-scan',
          scanTime: data.scanTime?.toDate() || new Date(),
          status: data.status || 'pending',
          images: data.images || [],
          analysisResults: data.analysisResults,
          processingStatus: data.processingStatus,
          backendUsed: data.backendUsed,
          gcsUrls: data.gcsUrls,
          metadata: data.metadata,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ScanSession;
      });
    } catch (error) {
      console.error('Error getting scan sessions:', error);
      return [];
    }
  }

  /**
   * Get specific scan session
   */
  async getScanSession(userId: string, scanId: string): Promise<ScanSession | null> {
    try {
      const scanRef = doc(db, 'users', userId, 'scans', scanId);
      const scanDoc = await getDoc(scanRef);
      
      if (scanDoc.exists()) {
        const data = scanDoc.data();
        return {
          id: scanDoc.id,
          userId: data.userId || '',
          scanType: data.scanType || 'breast-scan',
          scanTime: data.scanTime?.toDate() || new Date(),
          status: data.status || 'pending',
          images: data.images || [],
          analysisResults: data.analysisResults,
          processingStatus: data.processingStatus,
          backendUsed: data.backendUsed,
          gcsUrls: data.gcsUrls,
          metadata: data.metadata,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ScanSession;
      }
      return null;
    } catch (error) {
      console.error('Error getting scan session:', error);
      return null;
    }
  }

  /**
   * Save chat session
   */
  async saveChatSession(userId: string, sessionId: string, messages: ChatMessage[]): Promise<void> {
    try {
      console.log(`🔍 [UserService] Attempting to save chat session for user: ${userId}, session: ${sessionId}`);
      console.log(`🔍 [UserService] Messages count: ${messages.length}`);
      
      // First, ensure the user document exists
      console.log(`🔍 [UserService] Ensuring user document exists...`);
      await this.ensureUserDocument(userId);
      console.log(`✅ [UserService] User document ensured`);
      
      const chatRef = doc(db, 'users', userId, 'chat_sessions', sessionId);
      console.log(`🔍 [UserService] Chat reference created: ${chatRef.path}`);
      
      const chatData = {
        userId,
        sessionId,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
        })),
        lastActivityAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      
      console.log(`🔍 [UserService] Chat data prepared, attempting to save...`);
      await setDoc(chatRef, chatData);
      console.log(`✅ [UserService] Chat session saved successfully!`);
      
    } catch (error) {
      console.error('❌ [UserService] Error saving chat session:', error);
      console.error('❌ [UserService] Error details:', {
        userId,
        sessionId,
        messagesCount: messages.length,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw new Error('Failed to save chat session');
    }
  }

  /**
   * Ensure user document exists in Firestore
   */
  private async ensureUserDocument(userId: string): Promise<void> {
    try {
      console.log(`🔍 [UserService] Checking if user document exists for: ${userId}`);
      const userRef = doc(db, 'users', userId);
      console.log(`🔍 [UserService] User reference path: ${userRef.path}`);
      
      const userDoc = await getDoc(userRef);
      console.log(`🔍 [UserService] User document exists: ${userDoc.exists()}`);
      
      if (!userDoc.exists()) {
        console.log(`🔍 [UserService] Creating new user document...`);
        // Create basic user document if it doesn't exist
        const userData = {
          uid: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(userRef, userData);
        console.log(`✅ [UserService] Created user document for: ${userId}`);
      } else {
        console.log(`✅ [UserService] User document already exists for: ${userId}`);
      }
    } catch (error) {
      console.error('❌ [UserService] Error ensuring user document:', error);
      console.error('❌ [UserService] Error details:', {
        userId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      // Re-throw the error so the calling function can handle it
      throw new Error(`Failed to ensure user document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get chat sessions for user
   */
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const chatsRef = collection(db, 'users', userId, 'chat_sessions');
      const chatsQuery = query(chatsRef, orderBy('lastActivityAt', 'desc'));
      const querySnapshot = await getDocs(chatsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastActivityAt: doc.data().lastActivityAt?.toDate() || new Date(),
      })) as ChatSession[];
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }

  /**
   * Delete user data (for GDPR compliance)
   */
  async deleteUserData(uid: string): Promise<void> {
    try {
      // Delete all scan sessions
      const scansRef = collection(db, 'users', uid, 'scans');
      const scansSnapshot = await getDocs(scansRef);
      for (const doc of scansSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete all chat sessions
      const chatsRef = collection(db, 'users', uid, 'chat_sessions');
      const chatsSnapshot = await getDocs(chatsRef);
      for (const doc of chatsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete user profile
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);

      console.log(`✅ All data deleted for user: ${uid}`);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(uid: string): Promise<{
    totalScans: number;
    completedScans: number;
    totalChats: number;
    lastScanDate?: Date;
    lastChatDate?: Date;
  }> {
    try {
      const [scans, chats] = await Promise.all([
        this.getScanSessions(uid),
        this.getChatSessions(uid),
      ]);

      const completedScans = scans.filter(scan => scan.status === 'completed');
      const lastScan = scans.length > 0 ? scans[0].scanTime : undefined;
      const lastChat = chats.length > 0 ? chats[0].lastActivityAt : undefined;

      return {
        totalScans: scans.length,
        completedScans: completedScans.length,
        totalChats: chats.length,
        lastScanDate: lastScan,
        lastChatDate: lastChat,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalScans: 0,
        completedScans: 0,
        totalChats: 0,
      };
    }
  }
}

export default UserService.getInstance();
