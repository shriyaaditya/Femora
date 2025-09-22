import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { 
  createUserWithTextualFeatures, 
  saveTextualFeatures, 
  createNewScan,
  getUserCompleteData,
  getUserScanHistory,
  validateTextualFeatures 
} from '../utils/firestoreHelpers';
import { TextualFeatures, AnalysisResults } from '../services/firestoreService';

/**
 * Example: How to integrate Firestore with your Questionnaire component
 * 
 * This example shows how to:
 * 1. Save questionnaire responses to Firestore
 * 2. Create new users during onboarding
 * 3. Save scan results
 * 4. Retrieve user data
 */

// Example 1: Saving questionnaire responses
export const saveQuestionnaireExample = async (uid: string) => {
  try {
    // Example questionnaire data matching your schema
    const questionnaireData: Partial<TextualFeatures> = {
      age: 35,
      familyHistory: "Yes",
      lumpsOrThickening: false,
      chronicHealthIssues: false,
      discomfortOrTenderness: 2, // scale of 3
      changeInBreastSize: 1, // scale of 3
      rednessOrWarmth: false,
      nippleChanges: false,
      breastPainOrHeaviness: 3, // scale of 5
      smokingStatus: false
    };

    // Validate the data before saving
    if (validateTextualFeatures(questionnaireData)) {
      await saveTextualFeatures(uid, questionnaireData);
      Alert.alert('Success', 'Questionnaire responses saved successfully!');
    } else {
      Alert.alert('Error', 'Invalid questionnaire data');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to save questionnaire responses');
    console.error('Error saving questionnaire:', error);
  }
};

// Example 2: Creating a new user during onboarding
export const createUserExample = async (uid: string, email: string, displayName: string) => {
  try {
    const questionnaireData: Partial<TextualFeatures> = {
      age: 28,
      familyHistory: "No",
      lumpsOrThickening: false,
      chronicHealthIssues: false,
      discomfortOrTenderness: 0,
      changeInBreastSize: 0,
      rednessOrWarmth: false,
      nippleChanges: false,
      breastPainOrHeaviness: 0,
      smokingStatus: false
    };

    await createUserWithTextualFeatures(uid, email, displayName, questionnaireData);
    Alert.alert('Success', 'User created successfully!');
  } catch (error) {
    Alert.alert('Error', 'Failed to create user');
    console.error('Error creating user:', error);
  }
};

// Example 3: Saving a new scan
export const saveScanExample = async (uid: string, base64Images: string[]) => {
  try {
    // Example analysis results from your AI backend
    const analysisResults: Omit<AnalysisResults, 'timestamp'> = {
      findings: "No significant abnormalities detected",
      confidence: 85,
      riskLevel: "Low",
      recommendation: "Continue with regular self-examinations",
      analysisId: `analysis_${Date.now()}`
    };

    const scanId = await createNewScan(uid, base64Images, analysisResults);
    Alert.alert('Success', `Scan saved with ID: ${scanId}`);
  } catch (error) {
    Alert.alert('Error', 'Failed to save scan');
    console.error('Error saving scan:', error);
  }
};

// Example 4: Retrieving user data
export const getUserDataExample = async (uid: string) => {
  try {
    const userData = await getUserCompleteData(uid);
    if (userData) {
      console.log('User Profile:', userData.profile);
      console.log('Textual Features:', userData.textualFeatures);
      console.log('Scan Count:', userData.scans.length);
      return userData;
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Example 5: Getting scan history
export const getScanHistoryExample = async (uid: string) => {
  try {
    const scans = await getUserScanHistory(uid);
    console.log('User has', scans.length, 'scans');
    scans.forEach((scan, index) => {
      console.log(`Scan ${index + 1}:`, {
        date: new Date(scan.createdAt).toLocaleDateString(),
        riskLevel: scan.analysisResults.riskLevel,
        confidence: scan.analysisResults.confidence
      });
    });
    return scans;
  } catch (error) {
    console.error('Error getting scan history:', error);
    return [];
  }
};

// Example 6: Integration with your existing Questionnaire component
export const QuestionnaireIntegrationExample: React.FC<{
  uid: string;
  onComplete: () => void;
}> = ({ uid, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionnaireComplete = async (responses: Partial<TextualFeatures>) => {
    setIsLoading(true);
    try {
      // Validate responses
      if (!validateTextualFeatures(responses)) {
        Alert.alert('Error', 'Please complete all required fields');
        return;
      }

      // Save to Firestore
      await saveTextualFeatures(uid, responses);
      
      // Navigate to next step
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save questionnaire responses');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Text>Questionnaire Integration Example</Text>
      <TouchableOpacity 
        onPress={() => handleQuestionnaireComplete({
          age: 30,
          familyHistory: "No",
          lumpsOrThickening: false,
          chronicHealthIssues: false,
          discomfortOrTenderness: 1,
          changeInBreastSize: 0,
          rednessOrWarmth: false,
          nippleChanges: false,
          breastPainOrHeaviness: 2,
          smokingStatus: false
        })}
        disabled={isLoading}
      >
        <Text>{isLoading ? 'Saving...' : 'Complete Questionnaire'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 7: Complete user flow from onboarding to scan
export const completeUserFlowExample = async (
  uid: string, 
  email: string, 
  displayName: string,
  questionnaireResponses: Partial<TextualFeatures>,
  scanImages: string[]
) => {
  try {
    // Step 1: Create user
    await createUserWithTextualFeatures(uid, email, displayName, questionnaireResponses);
    console.log('User created');

    // Step 2: Save questionnaire responses (if not already saved during creation)
    await saveTextualFeatures(uid, questionnaireResponses);
    console.log('Questionnaire saved');

    // Step 3: Create scan with analysis
    const analysisResults: Omit<AnalysisResults, 'timestamp'> = {
      findings: "Normal breast tissue architecture observed",
      confidence: 90,
      riskLevel: "Low",
      recommendation: "Continue with regular screenings",
      analysisId: `analysis_${Date.now()}`
    };

    const scanId = await createNewScan(uid, scanImages, analysisResults);
    console.log('Scan created:', scanId);

    // Step 4: Retrieve complete user data
    const userData = await getUserCompleteData(uid);
    console.log('Complete user data retrieved:', userData?.profile.displayName);

    return { success: true, scanId, userData };
  } catch (error) {
    console.error('Error in complete user flow:', error);
    return { success: false, error };
  }
};

export default {
  saveQuestionnaireExample,
  createUserExample,
  saveScanExample,
  getUserDataExample,
  getScanHistoryExample,
  completeUserFlowExample
};

