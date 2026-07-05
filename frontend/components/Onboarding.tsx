import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [showMoraIntro, setShowMoraIntro] = useState(false);
  const [moraScale] = useState(new Animated.Value(0));
  const [moraOpacity] = useState(new Animated.Value(0));

  // Check if user has already seen the mora intro
  useEffect(() => {
    const checkMoraIntroSeen = async () => {
      if (user) {
        try {
          const moraIntroKey = `moraIntroSeen_${user.id}`;
          const hasSeenMoraIntro = await AsyncStorage.getItem(moraIntroKey);
          
          if (!hasSeenMoraIntro) {
            // User hasn't seen it before, show the intro
            setShowMoraIntro(true);
          }
        } catch (error) {
          console.error('Error checking mora intro status:', error);
          // If there's an error, show the intro as a fallback
          setShowMoraIntro(true);
        }
      }
    };

    checkMoraIntroSeen();
  }, [user]);

  // Animate mora image when component mounts
  useEffect(() => {
    if (showMoraIntro) {
      // Start with scale 0 and opacity 0
      moraScale.setValue(0);
      moraOpacity.setValue(0);
      
      // Animate to full scale with bounce effect
      Animated.sequence([
        Animated.timing(moraOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(moraScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMoraIntro, moraScale, moraOpacity]);

  const handleContinueToQuestions = async () => {
    if (user) {
      try {
        // Mark that the user has seen the mora intro
        const moraIntroKey = `moraIntroSeen_${user.id}`;
        await AsyncStorage.setItem(moraIntroKey, 'true');
      } catch (error) {
        console.error('Error saving mora intro status:', error);
      }
    }
    setShowMoraIntro(false);
  };

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
    if (q) {
      setAnswers((prev) => ({ ...prev, [q.id]: value }));
    }
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

  const handleSkip = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be signed in to continue.');
        return;
      }

      // Create default onboarding data
      const defaultAnswers: OnboardingData = {
        name: user.name || user.email?.split('@')[0] || 'User',
        age: 25,
        pastScan: 'No',
        familyHistory: 'No',
        pastConditions: ['No'],
        periodStartAge: 12,
        status: 'None',
        hormonalMeds: 'No',
        smokeAlcohol: 'No',
        chronic: 'None',
        lumpsOrThickening: false,
        chronicHealthIssues: false,
        discomfortOrTenderness: 0,
        changeInBreastSize: 0,
        rednessOrWarmth: false,
        nippleChanges: false,
        breastPainOrHeaviness: 0,
        smokingStatus: false,
      };

      // Save default onboarding data to Firebase
      await saveOnboardingData(user.id, defaultAnswers);

      // Mark onboarding as complete in the auth context
      await markOnboardingComplete();

      Alert.alert('Welcome!', 'You can always update your profile later in settings.', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to complete onboarding');
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
    if (!q) return null;
    
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
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text>Please sign in to continue with onboarding.</Text>
      </View>
    );
  }

  // Show mora intro screen first
  if (showMoraIntro) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          {/* Back button */}
          <TouchableOpacity
            onPress={onBackToHome}
            style={{
              position: 'absolute',
              top: 60,
              left: 20,
              zIndex: 1,
            }}>
            <Text style={{ fontSize: 18, color: '#666' }}>← Back</Text>
          </TouchableOpacity>

          {/* Mora Image with Animation */}
          <Animated.View
            style={{
              opacity: moraOpacity,
              transform: [{ scale: moraScale }],
              marginBottom: 40,
            }}>
            <Image
              source={require('../assets/mora.png')}
              style={{
                width: 200,
                height: 200,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>

          {/* Welcome Message */}
          <Text
            style={{
              fontSize: isSmallDevice ? 24 : 28,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 16,
              color: '#333',
              lineHeight: 32,
            }}>
            Almost done — let&apos;s finish your bio data together!
          </Text>

          <Text
            style={{
              fontSize: isSmallDevice ? 16 : 18,
              textAlign: 'center',
              color: '#666',
              lineHeight: 24,
              marginBottom: 40,
              paddingHorizontal: 20,
            }}>
            Let&apos;s get to know you better to provide personalized care
          </Text>

          {/* Action Buttons */}
          <View style={{ alignItems: 'center', gap: 16 }}>
            <TouchableOpacity
              onPress={handleContinueToQuestions}
              style={{
                backgroundColor: '#E7B8FF',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#000',
              }}>
              <Text style={{ color: 'black', fontWeight: '600', fontSize: 18 }}>
                Let&apos;s Begin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              style={{
                backgroundColor: 'transparent',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}>
              <Text style={{ color: '#666', fontWeight: '500', fontSize: 16 }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Don't render if no current question
  if (!q) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
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
            Let&apos;s get to know you better to provide personalized care
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
            {q?.text || ''}
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

        {/* Skip Button */}
        <View
          style={{
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
            marginTop: isSmallDevice ? 16 : 20,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              paddingVertical: isSmallDevice ? 8 : 10,
              paddingHorizontal: isSmallDevice ? 16 : 20,
              borderRadius: 20,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: '#E0E0E0',
            }}>
            <Text
              style={{
                color: '#666',
                fontWeight: '500',
                fontSize: isSmallDevice ? 14 : 16,
              }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
            paddingHorizontal: isSmallDevice ? 16 : 20,
            marginTop: isSmallDevice ? 16 : 20,
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
    </View>
  );
};

export default Onboarding;
