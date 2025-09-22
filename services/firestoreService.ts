import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Type definitions matching your exact onboarding structure
export interface UserProfile {
  email: string;
  displayName: string;
  createdAt: string;
  onboardingCompleted?: boolean;
}

export interface TextualFeatures {
  completedAt: string;
  age: number;
  familyHistory: 'Yes' | 'No';
  lumpsOrThickening: boolean;  // Any lumps or thickening in your breasts
  chronicHealthIssues: boolean; // Any chronic health issues
  discomfortOrTenderness: number; // Scale of 0-3: Are you feeling any discomfort or tenderness
  changeInBreastSize: number;   // Scale of 0-3: Change in size of breasts
  rednessOrWarmth: boolean;     // Any redness or warmth in the breast region
  nippleChanges: boolean;       // Discharge or changes like inversion of nipples
  breastPainOrHeaviness: number; // Scale of 0-5: Any usual pain or heaviness in the breasts
  smokingStatus: boolean;       // Do you smoke
}

export interface OnboardingData {
  name?: string;
  age: number;
  pastScan?: string;
  familyHistory: 'Yes' | 'No';
  pastConditions?: string[];
  periodStartAge?: number;
  status?: string;
  hormonalMeds?: string;
  smokeAlcohol?: string;
  chronic?: string;
  lumpsOrThickening: boolean;
  chronicHealthIssues: boolean;
  discomfortOrTenderness: number;
  changeInBreastSize: number;
  rednessOrWarmth: boolean;
  nippleChanges: boolean;
  breastPainOrHeaviness: number;
  smokingStatus: boolean;
}

export interface ScanImage {
  base64Data: string;
  timestamp: string;
  imageId: string;
}

export interface AnalysisResults {
  findings: string;
  confidence: number;
  riskLevel: string;
  recommendation: string;
  analysisId: string;
  timestamp: string;
}

export interface Scan {
  scanId: string;
  scanType: 'breast-scan';
  images: ScanImage[];
  analysisResults: AnalysisResults;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  uid: string;
  profile: UserProfile;
  textualFeatures: TextualFeatures;
  onboarding?: OnboardingData;
  scans: Scan[];
}

export class FirestoreService {
  private static instance: FirestoreService;

  private constructor() {}

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  /**
   * Create a new user document with the complete structure
   */
  async createUser(uid: string, userData: Partial<UserData>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      const newUser: UserData = {
        uid,
        profile: {
          email: userData.profile?.email || '',
          displayName: userData.profile?.displayName || '',
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
        },
        textualFeatures: {
          completedAt: '',
          age: 0,
          familyHistory: 'No',
          lumpsOrThickening: false,
          chronicHealthIssues: false,
          discomfortOrTenderness: 0,
          changeInBreastSize: 0,
          rednessOrWarmth: false,
          nippleChanges: false,
          breastPainOrHeaviness: 0,
          smokingStatus: false,
          ...userData.textualFeatures
        },
        scans: [],
        ...userData
      };

      await setDoc(userRef, newUser);
      console.log('User created successfully:', uid);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        'profile': profileData,
        'updatedAt': serverTimestamp()
      });
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Mark onboarding as completed for a user
   */
  async markOnboardingCompleted(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        'profile.onboardingCompleted': true,
        'updatedAt': serverTimestamp()
      });
      console.log('Onboarding marked as completed for user:', uid);
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
      throw error;
    }
  }

  /**
   * Update textual features data (questionnaire responses)
   */
  async updateTextualFeatures(uid: string, textualFeaturesData: Partial<TextualFeatures>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document with textual features
        console.log('Creating new user document for:', uid);
        await setDoc(userRef, {
          uid,
          profile: {
            email: '', // Will be updated later
            displayName: '', // Will be updated later
            createdAt: new Date().toISOString()
          },
          textualFeatures: {
            ...textualFeaturesData,
            completedAt: new Date().toISOString()
          },
          scans: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing user document
        console.log('Updating existing user document for:', uid);
        await updateDoc(userRef, {
          'textualFeatures': {
            ...textualFeaturesData,
            completedAt: new Date().toISOString()
          },
          'updatedAt': serverTimestamp()
        });
      }
      
      console.log('Textual features updated successfully for user:', uid);
    } catch (error) {
      console.error('Error updating textual features for user:', uid, error);
      throw error;
    }
  }

  /**
   * Add a new scan to user's scans array
   */
  async addScan(uid: string, scanData: Omit<Scan, 'scanId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userRef = doc(db, 'users', uid);
      const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newScan: Scan = {
        ...scanData,
        scanId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Get current user data
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as UserData;
      const updatedScans = [...userData.scans, newScan];

      await updateDoc(userRef, {
        scans: updatedScans,
        updatedAt: serverTimestamp()
      });

      console.log('Scan added successfully:', scanId);
      return scanId;
    } catch (error) {
      console.error('Error adding scan:', error);
      throw error;
    }
  }

  /**
   * Update an existing scan
   */
  async updateScan(uid: string, scanId: string, scanData: Partial<Scan>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as UserData;
      const scanIndex = userData.scans.findIndex(scan => scan.scanId === scanId);
      
      if (scanIndex === -1) {
        throw new Error('Scan not found');
      }

      const updatedScans = [...userData.scans];
      updatedScans[scanIndex] = {
        ...updatedScans[scanIndex],
        ...scanData,
        updatedAt: new Date().toISOString()
      } as Scan;

      await updateDoc(userRef, {
        scans: updatedScans,
        updatedAt: serverTimestamp()
      });

      console.log('Scan updated successfully:', scanId);
    } catch (error) {
      console.error('Error updating scan:', error);
      throw error;
    }
  }

  /**
   * Get user data by UID
   */
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  /**
   * Get user's scan history
   */
  async getUserScans(uid: string): Promise<Scan[]> {
    try {
      const userData = await this.getUserData(uid);
      return userData?.scans || [];
    } catch (error) {
      console.error('Error getting user scans:', error);
      throw error;
    }
  }

  /**
   * Get a specific scan by ID
   */
  async getScan(uid: string, scanId: string): Promise<Scan | null> {
    try {
      const userData = await this.getUserData(uid);
      return userData?.scans.find(scan => scan.scanId === scanId) || null;
    } catch (error) {
      console.error('Error getting scan:', error);
      throw error;
    }
  }

  /**
   * Delete a scan
   */
  async deleteScan(uid: string, scanId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as UserData;
      const updatedScans = userData.scans.filter(scan => scan.scanId !== scanId);

      await updateDoc(userRef, {
        scans: updatedScans,
        updatedAt: serverTimestamp()
      });

      console.log('Scan deleted successfully:', scanId);
    } catch (error) {
      console.error('Error deleting scan:', error);
      throw error;
    }
  }

  /**
   * Search users by specific criteria (for admin purposes)
   */
  async searchUsers(criteria: Partial<UserProfile>): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef);
      
      // Add search criteria
      if (criteria.email) {
        q = query(q, where('profile.email', '==', criteria.email));
      }
      if (criteria.displayName) {
        q = query(q, where('profile.displayName', '==', criteria.displayName));
      }
      
      const querySnapshot = await getDocs(q);
      const users: UserData[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserData);
      });
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Batch update multiple fields
   */
  async batchUpdate(uid: string, updates: Record<string, any>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('Batch update completed successfully');
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}

export default FirestoreService.getInstance();
