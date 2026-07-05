import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalUserProfile {
  name: string;
  age: number;
  lastUpdated: string;
}

const USER_PROFILE_KEY = '@femora_user_profile';

export class LocalUserStorage {
  /**
   * Save basic user profile to local storage
   */
  static async saveUserProfile(profile: Omit<LocalUserProfile, 'lastUpdated'>): Promise<void> {
    try {
      const profileWithTimestamp: LocalUserProfile = {
        ...profile,
        lastUpdated: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileWithTimestamp));
      console.log('✅ User profile saved locally:', profileWithTimestamp);
    } catch (error) {
      console.error('❌ Error saving user profile locally:', error);
      throw error;
    }
  }

  /**
   * Get user profile from local storage
   */
  static async getUserProfile(): Promise<LocalUserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (profileData) {
        const profile: LocalUserProfile = JSON.parse(profileData);
        console.log('✅ User profile retrieved locally:', profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving user profile locally:', error);
      return null;
    }
  }

  /**
   * Update specific fields in user profile
   */
  static async updateUserProfile(updates: Partial<Omit<LocalUserProfile, 'lastUpdated'>>): Promise<void> {
    try {
      const existingProfile = await this.getUserProfile();
      if (existingProfile) {
        const updatedProfile: LocalUserProfile = {
          ...existingProfile,
          ...updates,
          lastUpdated: new Date().toISOString(),
        };
        await this.saveUserProfile(updatedProfile);
      } else {
        // Create new profile if none exists
        const newProfile: LocalUserProfile = {
          name: updates.name || 'User',
          age: updates.age || 0,
          lastUpdated: new Date().toISOString(),
        };
        await this.saveUserProfile(newProfile);
      }
    } catch (error) {
      console.error('❌ Error updating user profile locally:', error);
      throw error;
    }
  }

  /**
   * Clear user profile from local storage
   */
  static async clearUserProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      console.log('✅ User profile cleared locally');
    } catch (error) {
      console.error('❌ Error clearing user profile locally:', error);
      throw error;
    }
  }

  /**
   * Check if user profile exists locally
   */
  static async hasUserProfile(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return profile !== null;
    } catch (error) {
      console.error('❌ Error checking user profile existence:', error);
      return false;
    }
  }

  /**
   * Debug function to see all AsyncStorage keys
   */
  static async debugStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔍 All AsyncStorage keys:', keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`🔍 Key: ${key}, Value:`, value);
      }
    } catch (error) {
      console.error('❌ Error debugging storage:', error);
    }
  }
}
