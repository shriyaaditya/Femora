import firestoreService, { 
  UserData, 
  TextualFeatures,
  Scan, 
  AnalysisResults,
  ScanImage 
} from '../services/firestoreService';

/**
 * Helper function to create a new user with textual features
 */
export const createUserWithTextualFeatures = async (
  uid: string, 
  email: string, 
  displayName: string,
  textualFeaturesData: Partial<TextualFeatures>
): Promise<void> => {
  try {
    await firestoreService.createUser(uid, {
      profile: {
        email,
        displayName,
        createdAt: new Date().toISOString()
      },
      textualFeatures: {
        age: textualFeaturesData.age || 0,
        familyHistory: textualFeaturesData.familyHistory || 'No',
        lumpsOrThickening: textualFeaturesData.lumpsOrThickening || false,
        chronicHealthIssues: textualFeaturesData.chronicHealthIssues || false,
        discomfortOrTenderness: textualFeaturesData.discomfortOrTenderness || 0,
        changeInBreastSize: textualFeaturesData.changeInBreastSize || 0,
        rednessOrWarmth: textualFeaturesData.rednessOrWarmth || false,
        nippleChanges: textualFeaturesData.nippleChanges || false,
        breastPainOrHeaviness: textualFeaturesData.breastPainOrHeaviness || 0,
        smokingStatus: textualFeaturesData.smokingStatus || false,
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating user with textual features:', error);
    throw error;
  }
};

/**
 * Helper function to save textual features data (questionnaire responses)
 */
export const saveTextualFeatures = async (
  uid: string,
  textualFeaturesData: Partial<TextualFeatures>
): Promise<void> => {
  try {
    await firestoreService.updateTextualFeatures(uid, textualFeaturesData);
  } catch (error) {
    console.error('Error saving textual features:', error);
    throw error;
  }
};

/**
 * Helper function to create a new scan with images
 */
export const createNewScan = async (
  uid: string,
  base64Images: string[],
  analysisResults: Omit<AnalysisResults, 'timestamp'>
): Promise<string> => {
  try {
    const scanImages: ScanImage[] = base64Images.map((base64Data, index) => ({
      base64Data,
      timestamp: new Date().toISOString(),
      imageId: `img_${Date.now()}_${index}`
    }));

    const scanData: Omit<Scan, 'scanId' | 'createdAt' | 'updatedAt'> = {
      scanType: 'breast-scan',
      images: scanImages,
      analysisResults: {
        ...analysisResults,
        timestamp: new Date().toISOString()
      }
    };

    return await firestoreService.addScan(uid, scanData);
  } catch (error) {
    console.error('Error creating new scan:', error);
    throw error;
  }
};

/**
 * Helper function to get user's complete data
 */
export const getUserCompleteData = async (uid: string): Promise<UserData | null> => {
  try {
    return await firestoreService.getUserData(uid);
  } catch (error) {
    console.error('Error getting user complete data:', error);
    throw error;
  }
};

/**
 * Helper function to get user's scan history
 */
export const getUserScanHistory = async (uid: string): Promise<Scan[]> => {
  try {
    return await firestoreService.getUserScans(uid);
  } catch (error) {
    console.error('Error getting user scan history:', error);
    throw error;
  }
};

/**
 * Helper function to update user profile
 */
export const updateUserProfile = async (
  uid: string,
  profileUpdates: Partial<UserData['profile']>
): Promise<void> => {
  try {
    await firestoreService.updateUserProfile(uid, profileUpdates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Helper function to delete a scan
 */
export const deleteUserScan = async (uid: string, scanId: string): Promise<void> => {
  try {
    await firestoreService.deleteScan(uid, scanId);
  } catch (error) {
    console.error('Error deleting scan:', error);
    throw error;
  }
};

/**
 * Helper function to format scan data for display
 */
export const formatScanForDisplay = (scan: Scan) => {
  return {
    id: scan.scanId,
    date: new Date(scan.createdAt).toLocaleDateString(),
    time: new Date(scan.createdAt).toLocaleTimeString(),
    imageCount: scan.images.length,
    riskLevel: scan.analysisResults.riskLevel,
    confidence: scan.analysisResults.confidence,
    findings: scan.analysisResults.findings,
    recommendation: scan.analysisResults.recommendation
  };
};

/**
 * Helper function to validate textual features data
 */
export const validateTextualFeatures = (data: Partial<TextualFeatures>): boolean => {
  console.log('🔍 Validating textual features:', data);
  console.log('🔍 Data type check:', {
    age: { value: data.age, type: typeof data.age, exists: data.age !== undefined },
    familyHistory: { value: data.familyHistory, type: typeof data.familyHistory, exists: data.familyHistory !== undefined }
  });
  
  // Only require age and familyHistory as mandatory
  const requiredFields = ['age', 'familyHistory'];
  
  // Check required fields
  for (const field of requiredFields) {
    const fieldValue = data[field as keyof TextualFeatures];
    console.log(`🔍 Checking field ${field}:`, { value: fieldValue, type: typeof fieldValue });
    
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      console.log(`🔍 Missing required field: ${field}`);
      return false;
    }
  }
  
  // Check numeric fields are within valid ranges (only if they exist)
  if (data.age !== undefined && (data.age < 0 || data.age > 120)) {
    console.log(`🔍 Invalid age: ${data.age}`);
    return false;
  }
  
  // All other fields are optional, so validation passes if required fields are present
  console.log('🔍 Validation passed!');
  return true;
};

/**
 * Helper function to save onboarding data
 */
export const saveOnboardingData = async (uid: string, onboardingData: any): Promise<void> => {
  try {
    // Convert onboarding data to textual features format
    const textualFeaturesData: Partial<TextualFeatures> = {
      age: onboardingData.age || 0,
      familyHistory: onboardingData.familyHistory || 'No',
      lumpsOrThickening: onboardingData.lumpsOrThickening || false,
      chronicHealthIssues: onboardingData.chronicHealthIssues || false,
      discomfortOrTenderness: onboardingData.discomfortOrTenderness || 0,
      changeInBreastSize: onboardingData.changeInBreastSize || 0,
      rednessOrWarmth: onboardingData.rednessOrWarmth || false,
      nippleChanges: onboardingData.nippleChanges || false,
      breastPainOrHeaviness: onboardingData.breastPainOrHeaviness || 0,
      smokingStatus: onboardingData.smokingStatus || false,
      completedAt: new Date().toISOString()
    };

          // Save textual features
      await firestoreService.updateTextualFeatures(uid, textualFeaturesData);
      
      // Also save the user's name to their profile if provided
      if (onboardingData.name) {
        await firestoreService.updateUserProfile(uid, {
          displayName: onboardingData.name
        });
        console.log('User name saved to profile:', onboardingData.name);
      }
      
      // Mark onboarding as completed
      await firestoreService.markOnboardingCompleted(uid);
      console.log('Onboarding marked as completed');
      
      console.log('Onboarding data saved successfully');
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
};

/**
 * Helper function to validate onboarding data
 */
export const validateOnboardingData = (data: any): boolean => {
  const requiredFields = ['age', 'familyHistory'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return false;
    }
  }
  
  // Check numeric fields are within valid ranges
  if (data.age && (data.age < 0 || data.age > 120)) return false;
  if (data.discomfortOrTenderness && (data.discomfortOrTenderness < 0 || data.discomfortOrTenderness > 3)) return false;
  if (data.changeInBreastSize && (data.changeInBreastSize < 0 || data.changeInBreastSize > 3)) return false;
  if (data.breastPainOrHeaviness && (data.breastPainOrHeaviness < 0 || data.breastPainOrHeaviness > 5)) return false;
  
  // Check enum values
  if (data.familyHistory && !['Yes', 'No'].includes(data.familyHistory)) return false;
  
  return true;
};
