import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { saveTextualFeatures, validateTextualFeatures } from '../utils/firestoreHelpers';
import { TextualFeatures } from '../services/firestoreService';


const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

interface TextualFeaturesQuestionnaireProps {
  onComplete: () => void;
  onBackToHome: () => void;
  onMarkOnboardingComplete?: () => Promise<void>;
}

// Extended interface for all questions (including non-stored ones)
interface ExtendedQuestionData {
  // TextualFeatures data (will be stored to Firebase)
  age: number;
  familyHistory: 'Yes' | 'No';
  lumpsOrThickening: 'Yes' | 'No';
  chronicHealthIssues: 'Yes' | 'No';
  discomfortOrTenderness: 'No discomfort' | 'Mild discomfort' | 'Severe discomfort';
  changeInBreastSize: 'No change' | 'Slight change' | 'Significant change';
  rednessOrWarmth: 'Yes' | 'No';
  nippleChanges: 'Yes' | 'No';
  breastPainOrHeaviness: 'No pain' | 'Mild' | 'Moderate' | 'Severe' | 'Very severe';
  smokingStatus: 'Yes' | 'No';
  
  // Additional questions (for user experience, not stored)
  name: string;
  pastScan: 'Yes' | 'No';
  pastConditions: string[];
  periodStartAge: number;
  status: 'None' | 'Pregnant' | 'Breastfeeding' | 'Post-menopausal';
  hormonalMeds: 'Yes' | 'No';
  smokeAlcohol: 'Yes' | 'No';
  chronic: string[];
}

interface QuestionDef {
  id: keyof ExtendedQuestionData;
  text: string;
  type: 'text' | 'number' | 'yesno' | 'choice';
  placeholder?: string;
  options?: string[];
  isStored: boolean; // Whether this data gets stored to Firebase
}

const TextualFeaturesQuestionnaire: React.FC<TextualFeaturesQuestionnaireProps> = ({ 
  onComplete, 
  onBackToHome,
  onMarkOnboardingComplete
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Partial<ExtendedQuestionData>>({});

  const questions: QuestionDef[] = useMemo(
    () => [
      // Basic info (not stored to Firebase, but collected for user experience)
      {
        id: 'name',
        text: "What's your name?",
        type: 'text',
        placeholder: 'Enter your name',
        isStored: false,
      },
      {
        id: 'age',
        text: 'Hi! Can you tell us your age?',
        type: 'number',
        placeholder: 'Enter your age',
        isStored: true, // This gets stored to Firebase
      },
      {
        id: 'pastScan',
        text: 'Have you ever had a breast scan (mammogram or ultrasound) before?',
        type: 'yesno',
        isStored: false,
      },
      {
        id: 'familyHistory',
        text: 'Do you have a family history of breast cancer (mother, sister, grandmother)?',
        type: 'yesno',
        isStored: true, // This gets stored to Firebase
      },
      {
        id: 'pastConditions',
        text: 'Have you ever had any breast conditions or surgeries (like cysts, fibroadenoma, biopsy)?',
        type: 'choice',
        options: ['No', 'Cysts', 'Fibroadenoma', 'Biopsy', 'Other'],
        isStored: false,
      },
      {
        id: 'periodStartAge',
        text: 'At what age did your periods start?',
        type: 'number',
        placeholder: 'Enter age at menarche',
        isStored: false,
      },
      {
        id: 'status',
        text: 'Are you currently pregnant, breastfeeding, or post-menopausal?',
        type: 'choice',
        options: ['None', 'Pregnant', 'Breastfeeding', 'Post-menopausal'],
        isStored: false,
      },
      {
        id: 'hormonalMeds',
        text: 'Do you take any hormonal medication (birth control or hormone replacement therapy)?',
        type: 'yesno',
        isStored: false,
      },
      {
        id: 'smokeAlcohol',
        text: 'Do you smoke or drink alcohol regularly?',
        type: 'yesno',
        isStored: false,
      },
      {
        id: 'chronic',
        text: 'Do you have any chronic health conditions, like diabetes or high blood pressure?',
        type: 'choice',
        options: ['None', 'Diabetes', 'High blood pressure', 'Other'],
        isStored: false,
      },
      
      // TextualFeatures questions (will be stored to Firebase)
      {
        id: 'lumpsOrThickening',
        text: 'Do you have any lumps or thickening in your breasts?',
        type: 'yesno',
        isStored: true,
      },
      {
        id: 'chronicHealthIssues',
        text: 'Do you have any chronic health issues?',
        type: 'yesno',
        isStored: true,
      },
      {
        id: 'discomfortOrTenderness',
        text: 'Are you feeling any discomfort or tenderness?',
        type: 'choice',
        options: ['No discomfort', 'Mild discomfort', 'Severe discomfort'],
        isStored: true,
      },
      {
        id: 'changeInBreastSize',
        text: 'Have you noticed any change in size of your breasts?',
        type: 'choice',
        options: ['No change', 'Slight change', 'Significant change'],
        isStored: true,
      },
      {
        id: 'rednessOrWarmth',
        text: 'Do you have any redness or warmth in the breast region?',
        type: 'yesno',
        isStored: true,
      },
      {
        id: 'nippleChanges',
        text: 'Do you have any discharge or changes like inversion of nipples?',
        type: 'yesno',
        isStored: true,
      },
      {
        id: 'breastPainOrHeaviness',
        text: 'Do you experience any usual pain or heaviness in the breasts?',
        type: 'choice',
        options: ['No pain', 'Mild', 'Moderate', 'Severe', 'Very severe'],
        isStored: true,
      },
      {
        id: 'smokingStatus',
        text: 'Do you smoke?',
        type: 'yesno',
        isStored: true,
      },
    ],
    []
  );

  const q = questions[currentIndex];

  const selectAnswer = (value: any) => {
    setAllAnswers((prev) => {
      const newAnswers = { ...prev, [q.id]: value };
      return newAnswers;
    });
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const prev = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  const handleSubmit = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be signed in to save.');
        return;
      }

      // Extract only the TextualFeatures data for Firebase storage
      const textualFeaturesData: Partial<TextualFeatures> = {
        age: allAnswers.age,
        familyHistory: allAnswers.familyHistory,
        // Convert 'Yes'/'No' strings to boolean values
        lumpsOrThickening: allAnswers.lumpsOrThickening === 'Yes',
        chronicHealthIssues: allAnswers.chronicHealthIssues === 'Yes',
        // Convert choice options to numeric scales
        discomfortOrTenderness: allAnswers.discomfortOrTenderness === 'No discomfort' ? 0 : 
                               allAnswers.discomfortOrTenderness === 'Mild discomfort' ? 1 : 
                               allAnswers.discomfortOrTenderness === 'Severe discomfort' ? 2 : 0,
        changeInBreastSize: allAnswers.changeInBreastSize === 'No change' ? 0 : 
                           allAnswers.changeInBreastSize === 'Slight change' ? 1 : 
                           allAnswers.changeInBreastSize === 'Significant change' ? 2 : 0,
        rednessOrWarmth: allAnswers.rednessOrWarmth === 'Yes',
        nippleChanges: allAnswers.nippleChanges === 'Yes',
        breastPainOrHeaviness: allAnswers.breastPainOrHeaviness === 'No pain' ? 0 : 
                              allAnswers.breastPainOrHeaviness === 'Mild' ? 1 : 
                              allAnswers.breastPainOrHeaviness === 'Moderate' ? 2 : 
                              allAnswers.breastPainOrHeaviness === 'Severe' ? 3 : 
                              allAnswers.breastPainOrHeaviness === 'Very severe' ? 4 : 0,
        smokingStatus: allAnswers.smokingStatus === 'Yes',
        completedAt: new Date().toISOString(), // Mark as completed
      };

      // Validate the textual features data before saving
      const isValid = validateTextualFeatures(textualFeaturesData);
      
      if (!isValid) {
        Alert.alert('Error', 'Please complete all required fields.');
        return;
      }

      // Save only TextualFeatures data to Firebase
      await saveTextualFeatures(user.id, textualFeaturesData);

      // Mark onboarding as complete in the auth context if function is provided
      if (onMarkOnboardingComplete) {
        await onMarkOnboardingComplete();
      }

      Alert.alert('Saved', 'Thanks! Your questionnaire responses were saved to Firebase.', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save questionnaire data to Firebase');
    }
  };

  const Button: React.FC<{ label: string; onPress: () => void; active?: boolean }> = ({
    label,
    onPress,
    active = false,
  }) => (
    <TouchableOpacity
      style={{
        borderRadius: 24,
        paddingVertical: isSmallDevice ? 10 : 12,
        paddingHorizontal: isSmallDevice ? 16 : 20,
        backgroundColor: active ? '#E7B8FF' : '#F0F0F0',
        borderWidth: 1,
        borderColor: active ? '#000' : '#E0E0E0',
        marginHorizontal: 4,
        marginVertical: 4,
      }}
      onPress={onPress}>
      <Text
        style={{
          textAlign: 'center',
          color: active ? 'black' : '#666',
          fontWeight: active ? '600' : '400',
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAnswerOptions = () => {
    switch (q.type) {
      case 'text':
        return (
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              backgroundColor: 'white',
              marginBottom: 16,
            }}
            placeholder={q.placeholder}
            value={String(allAnswers[q.id] || '')}
            onChangeText={(text) => selectAnswer(text)}
            autoCapitalize="words"
          />
        );

      case 'number':
        return (
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              backgroundColor: 'white',
              marginBottom: 16,
            }}
            placeholder={q.placeholder}
            value={String(allAnswers[q.id] || '')}
            onChangeText={(text) => selectAnswer(parseInt(text) || 0)}
            keyboardType="numeric"
          />
        );

      case 'yesno':
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              label="Yes"
              onPress={() => selectAnswer('Yes')}
              active={allAnswers[q.id] === 'Yes'}
            />
            <Button
              label="No"
              onPress={() => selectAnswer('No')}
              active={allAnswers[q.id] === 'No'}
            />
          </View>
        );

      case 'choice':
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            {q.options?.map((option, idx) => (
              <Button
                key={idx}
                label={option}
                onPress={() => selectAnswer(option)}
                active={allAnswers[q.id] === option}
              />
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  if (!q) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: isSmallDevice ? 16 : 20,
          paddingVertical: isSmallDevice ? 16 : 20,
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
        }}>
        <TouchableOpacity
          onPress={onBackToHome}
          style={{
            padding: 8,
            marginBottom: 16,
          }}>
          <Text style={{ fontSize: 16, color: '#666' }}>← Back to Home</Text>
        </TouchableOpacity>
        
        <Text
          style={{
            fontSize: isSmallDevice ? 20 : 24,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 8,
          }}>
          Health Questionnaire
        </Text>
        <Text
          style={{
            fontSize: isSmallDevice ? 14 : 16,
            color: '#666',
            textAlign: 'center',
            lineHeight: 22,
          }}>
          Help us understand your current health status
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingVertical: isSmallDevice ? 24 : 32,
        }}
        showsVerticalScrollIndicator={false}>
        
        {/* Progress Indicator */}
        <View
          style={{
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
            marginBottom: isSmallDevice ? 24 : 32,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
            </Text>
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: '#F0F0F0',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: '100%',
                backgroundColor: '#E7B8FF',
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* Question */}
        <View
          style={{
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
            marginBottom: isSmallDevice ? 24 : 32,
          }}>
          <Text
            style={{
              fontSize: isSmallDevice ? 18 : 20,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: isSmallDevice ? 16 : 20,
              lineHeight: 28,
            }}>
            {q.text}
          </Text>
          
          {/* Show storage indicator for user awareness */}
          {q.isStored && (
            <View style={{
              backgroundColor: '#E7B8FF',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              alignSelf: 'center',
              marginTop: 8,
            }}>
              <Text style={{
                fontSize: 12,
                color: '#000',
                fontWeight: '500',
              }}>
                This information will be saved to your profile
              </Text>
            </View>
          )}
        </View>

        {/* Answer Options */}
        <View
          style={{
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
          }}>
          {renderAnswerOptions()}
        </View>

        {/* Navigation Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
            marginTop: isSmallDevice ? 24 : 32,
          }}>
          <TouchableOpacity
            onPress={prev}
            disabled={currentIndex === 0}
            style={{
              paddingVertical: isSmallDevice ? 12 : 16,
              paddingHorizontal: isSmallDevice ? 20 : 24,
              borderRadius: 24,
              backgroundColor: currentIndex === 0 ? '#F0F0F0' : '#E7B8FF',
              borderWidth: 1,
              borderColor: currentIndex === 0 ? '#E0E0E0' : '#000',
            }}>
            <Text
              style={{
                color: currentIndex === 0 ? '#999' : 'black',
                fontWeight: '600',
              }}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={next}
            style={{
              paddingVertical: isSmallDevice ? 12 : 16,
              paddingHorizontal: isSmallDevice ? 20 : 24,
              borderRadius: 24,
              backgroundColor: '#E7B8FF',
              borderWidth: 1,
              borderColor: '#000',
            }}>
            <Text style={{ color: 'black', fontWeight: '600' }}>
              {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>




      </ScrollView>
    </SafeAreaView>
  );
};

export default TextualFeaturesQuestionnaire;
