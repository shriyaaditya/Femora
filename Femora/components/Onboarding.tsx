import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert, Platform } from 'react-native';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import UserService, { OnboardingData } from '../services/userService';

interface OnboardingProps {
  onComplete: () => void;
  onBackToHome?: () => void;
}

type QuestionType = 'yesno' | 'choice' | 'multi' | 'number' | 'text';

interface QuestionDef {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // for choice/multi
  placeholder?: string;
}

const centered = { alignItems: 'center', justifyContent: 'center' } as const;

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBackToHome }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const questions: QuestionDef[] = useMemo(
    () => [
      { id: 'age', text: 'Hi! Can you tell us your age?', type: 'number', placeholder: 'Enter your age' },
      { id: 'pastScan', text: 'Have you ever had a breast scan (mammogram or ultrasound) before?', type: 'yesno' },
      { id: 'familyHistory', text: 'Do you have a family history of breast cancer (mother, sister, grandmother)?', type: 'yesno' },
      { id: 'pastConditions', text: 'Have you ever had any breast conditions or surgeries (like cysts, fibroadenoma, biopsy)?', type: 'choice', options: ['No', 'Cysts', 'Fibroadenoma', 'Biopsy', 'Other'] },
      { id: 'periodStartAge', text: 'At what age did your periods start?', type: 'number', placeholder: 'Enter age at menarche' },
      { id: 'status', text: 'Are you currently pregnant, breastfeeding, or post-menopausal?', type: 'choice', options: ['None', 'Pregnant', 'Breastfeeding', 'Post-menopausal'] },
      { id: 'hormonalMeds', text: 'Do you take any hormonal medication (birth control or hormone replacement therapy)?', type: 'yesno' },
      { id: 'smokeAlcohol', text: 'Do you smoke or drink alcohol regularly?', type: 'yesno' },
      { id: 'chronic', text: 'Do you have any chronic health conditions, like diabetes or high blood pressure?', type: 'choice', options: ['None', 'Diabetes', 'High blood pressure', 'Other'] },
    ],
    []
  );

  const q = questions[currentIndex];

  const selectAnswer = (value: any) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const toggleMulti = (value: string) => {
    setAnswers((prev) => {
      const existing: string[] = Array.isArray(prev[q.id]) ? prev[q.id] : [];
      const next = existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value];
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

      // Convert answers to proper OnboardingData format
      const onboardingData: OnboardingData = {
        age: parseInt(answers.age) || 0,
        pastScan: answers.pastScan || 'No',
        familyHistory: answers.familyHistory || 'No',
        pastConditions: Array.isArray(answers.pastConditions) ? answers.pastConditions : [answers.pastConditions || 'No'],
        periodStartAge: parseInt(answers.periodStartAge) || 0,
        status: answers.status || 'None',
        hormonalMeds: answers.hormonalMeds || 'No',
        smokeAlcohol: answers.smokeAlcohol || 'No',
        chronic: Array.isArray(answers.chronic) ? answers.chronic : [answers.chronic || 'None'],
        completedAt: new Date(),
      };

      // Save using UserService
      await UserService.saveOnboardingData(user.uid, onboardingData);
      
      Alert.alert('Saved', 'Thanks! Your answers were saved.', [{ text: 'OK', onPress: onComplete }]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save onboarding');
    }
  };

  const Button: React.FC<{ label: string; onPress: () => void; active?: boolean }>= ({ label, onPress, active }) => (
    <TouchableOpacity
      onPress={onPress}
      className="active:scale-95"
      style={{
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: active ? '#EB9DED' : '#E7B8FF',
        borderWidth: 1,
        borderColor: '#000',
        marginVertical: 6,
        alignSelf: 'center',
        minWidth: 220,
      }}>
      <Text style={{ textAlign: 'center', color: active ? '#fff' : '#000', fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );

  const renderControls = () => {
    switch (q.type) {
      case 'yesno': {
        const v = answers[q.id];
        return (
          <View style={{ width: '100%', ...centered }}>
            <Button label="Yes" onPress={() => selectAnswer('Yes')} active={v === 'Yes'} />
            <Button label="No" onPress={() => selectAnswer('No')} active={v === 'No'} />
          </View>
        );
      }
      case 'choice': {
        const v = answers[q.id];
        return (
          <View style={{ width: '100%', ...centered }}>
            {q.options?.map((opt) => (
              <Button key={opt} label={opt} onPress={() => selectAnswer(opt)} active={v === opt} />
            ))}
          </View>
        );
      }
      case 'multi': {
        const v: string[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
        return (
          <View style={{ width: '100%', ...centered }}>
            {q.options?.map((opt) => (
              <Button key={opt} label={opt} onPress={() => toggleMulti(opt)} active={v.includes(opt)} />
            ))}
          </View>
        );
      }
      case 'number':
      case 'text': {
        const v = answers[q.id] ?? '';
        return (
          <View style={{ width: '100%', paddingHorizontal: 24 }}>
            <TextInput
              value={String(v)}
              onChangeText={(t) => selectAnswer(t)}
              placeholder={q.placeholder}
              keyboardType={q.type === 'number' ? 'numeric' : 'default'}
              style={{
                alignSelf: 'center',
                width: 260,
                borderRadius: 16,
                borderColor: '#ccc',
                borderWidth: 1,
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: '#fff',
              }}
            />
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-white">
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />
      <Navbar title={`Onboarding ${currentIndex + 1} / ${questions.length}`} onBack={onBackToHome} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, ...centered, padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 520, ...centered, gap: 18 }}>
          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '600', color: 'black' }}>{q.text}</Text>
          {renderControls()}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 520, marginTop: 20, paddingHorizontal: 12 }}>
            {currentIndex > 0 ? (
              <TouchableOpacity onPress={prev} style={{ borderRadius: 20, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#ddd', borderWidth: 1, borderColor: '#000' }}>
                <Text style={{ fontWeight: '600' }}>Previous</Text>
              </TouchableOpacity>
            ) : <View />}

            <TouchableOpacity
              onPress={next}
              style={{ borderRadius: 20, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#EB9DED', borderWidth: 1, borderColor: '#000' }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>{currentIndex === questions.length - 1 ? 'Complete' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Onboarding;



