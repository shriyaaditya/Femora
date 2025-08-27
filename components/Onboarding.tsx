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
import { saveOnboardingData, validateOnboardingData } from '../utils/firestoreHelpers';
import { OnboardingData } from '../services/firestoreService';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

interface OnboardingProps {
  onComplete: () => void;
  onBackToHome: () => void;
}

interface QuestionDef {
  id: keyof OnboardingData;
  text: string;
  type: 'text' | 'number' | 'yesno' | 'choice';
  placeholder?: string;
  options?: string[];
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBackToHome }) => {
  const { user, markOnboardingComplete } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({});

  const questions: QuestionDef[] = useMemo(
    () => [
      {
        id: 'name',
        text: "What's your name?",
        type: 'text',
        placeholder: 'Enter your name',
      },
      {
        id: 'age',
        text: 'Hi! Can you tell us your age?',
        type: 'number',
        placeholder: 'Enter your age',
      },
      {
        id: 'pastScan',
        text: 'Have you ever had a breast scan (mammogram or ultrasound) before?',
        type: 'yesno',
      },
      {
        id: 'familyHistory',
        text: 'Do you have a family history of breast cancer (mother, sister, grandmother)?',
        type: 'yesno',
      },
      {
        id: 'pastConditions',
        text: 'Have you ever had any breast conditions or surgeries (like cysts, fibroadenoma, biopsy)?',
        type: 'choice',
        options: ['No', 'Cysts', 'Fibroadenoma', 'Biopsy', 'Other'],
      },
      {
        id: 'periodStartAge',
        text: 'At what age did your periods start?',
        type: 'number',
        placeholder: 'Enter age at menarche',
      },
      {
        id: 'status',
        text: 'Are you currently pregnant, breastfeeding, or post-menopausal?',
        type: 'choice',
        options: ['None', 'Pregnant', 'Breastfeeding', 'Post-menopausal'],
      },
      {
        id: 'hormonalMeds',
        text: 'Do you take any hormonal medication (birth control or hormone replacement therapy)?',
        type: 'yesno',
      },
      { id: 'smokeAlcohol', text: 'Do you smoke or drink alcohol regularly?', type: 'yesno' },
      {
        id: 'chronic',
        text: 'Do you have any chronic health conditions, like diabetes or high blood pressure?',
        type: 'choice',
        options: ['None', 'Diabetes', 'High blood pressure', 'Other'],
      },
    ],
    []
  );

  const q = questions[currentIndex];

  const selectAnswer = (value: any) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const toggleMulti = (value: string) => {
    setAnswers((prev) => {
      const existing: string[] = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : [];
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      return { ...prev, [q.id]: next };
    });
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
    else handleSubmit();
  };
  const prev = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  const handleSubmit = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be signed in to save.');
        return;
      }

      // Validate the onboarding data before saving
      if (!validateOnboardingData(answers)) {
        Alert.alert('Error', 'Please complete all required fields.');
        return;
      }

      // Save onboarding data to Firebase
      await saveOnboardingData(user.id, answers);

      // Mark onboarding as complete in the auth context
      await markOnboardingComplete();

      Alert.alert('Saved', 'Thanks! Your answers were saved to Firebase.', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save onboarding data to Firebase');
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
            value={String(answers[q.id] || '')}
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
            value={String(answers[q.id] || '')}
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
              active={answers[q.id] === 'Yes'}
            />
            <Button
              label="No"
              onPress={() => selectAnswer('No')}
              active={answers[q.id] === 'No'}
            />
          </View>
        );

      case 'choice':
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            {q.options?.map((option) => (
              <Button
                key={option}
                label={option}
                onPress={() => selectAnswer(option)}
                active={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).includes(option) : answers[q.id] === option}
              />
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text>Please sign in to continue with onboarding.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingTop: isSmallDevice ? 20 : 32,
          paddingBottom: isSmallDevice ? 20 : 32,
        }}>
        {/* Header */}
        <View
          style={{
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
            marginBottom: isSmallDevice ? 24 : 32,
          }}>
          <TouchableOpacity
            onPress={onBackToHome}
            style={{
              alignSelf: 'flex-start',
              marginBottom: isSmallDevice ? 16 : 24,
            }}>
            <Text style={{ fontSize: 18, color: '#666' }}>← Back</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: isSmallDevice ? 24 : 28,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: isSmallDevice ? 8 : 12,
            }}>
            Welcome to Femora
          </Text>
          <Text
            style={{
              fontSize: isSmallDevice ? 16 : 18,
              textAlign: 'center',
              color: '#666',
              lineHeight: 24,
            }}>
            Let's get to know you better to provide personalized care
          </Text>
        </View>

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

export default Onboarding;
