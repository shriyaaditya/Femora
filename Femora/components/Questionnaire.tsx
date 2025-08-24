import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

interface QuestionnaireProps {
  onNavigateToHome: () => void;
  onNavigateToUserProfile?: () => void;
}

type FirstScanStep = {
  title: string;
  howTo: string[];
  question: string;
  options: string[];
  imageUri: string;
};

// Guided First Scan steps (temporary remote images; replace with local assets when available)
const guidedFirstScanSteps: FirstScanStep[] = [
  {
    title: 'Look in the Mirror',
    howTo: [
      'Stand in front of a mirror with arms relaxed, then raise them above your head.',
      'Check if both breasts are the same size, shape, and position.',
      'Look for skin dimpling, redness, rash, or nipple turning inward.',
    ],
    question: 'Do your breasts look the same as usual in size, shape, and skin appearance?',
    options: ['Yes', 'No', 'Not sure'],
    imageUri:
      'https://res.cloudinary.com/doojbkvn6/image/upload/v1755259742/Gemini_Generated_Image_850v1h850v1h850v_hd62qk.png',
  }, 
  {
    title: 'Feel While Standing/Sitting',
    howTo: [
      'Raise one arm and use the other hands 3 middle fingertips.',
      'Press in small circles from the outer breast toward the nipple.',
      'Cover the whole breast area.',
    ],
    question: 'Do you feel any new lump, knot, or thickened area?',
    options: ['No lump felt', ' Yes, I feel something new', 'Not sure'],
    imageUri:
      'https://res.cloudinary.com/doojbkvn6/image/upload/v1755259740/Gemini_Generated_Image_x35tqox35tqox35t_ughgpd.png',
  },
  {
    title: 'Feel While Lying Down',
    howTo: [
      'Lie down with a pillow under your shoulder, arm behind your head.',
      'Use the opposite hand to check the breast and armpit.',
      'Feel for lumps, swelling, or firm spots.',
    ],
    question: 'Do you notice any unusual firmness, swelling, or lump under your breast or arm?',
    options: [' No', 'Yes', ' Not sure'],
    imageUri:
      'https://res.cloudinary.com/doojbkvn6/image/upload/v1755259743/Gemini_Generated_Image_g2sg4lg2sg4lg2sg_agvrto.png',
  },
  {
    title: 'Nipple Check',
    howTo: [
      'Gently press each nipple between your thumb and finger.',
      'Check for fluid: clear, milky, yellow, or bloody.',
    ],
    question: 'When gently pressing the nipple, does any fluid come out?',
    options: ['No fluid', 'Yes, clear or milky', ' Yes, yellow or bloody fluid', ' Not sure'],
    imageUri:
      'https://res.cloudinary.com/doojbkvn6/image/upload/v1755259740/Gemini_Generated_Image_gw2dr8gw2dr8gw2d_uo1yre.png',
  },
];

const recentScanQuestions = [
  'Any changes since your last scan?',
  'Have you noticed any new symptoms recently?',
  'Has anything been worrying you since your last scan?',
];

const whileAgoQuestions = [
  'Do you remember when your last scan was?',
  'Was it more than a year ago?',
  'Has it been on your mind to schedule another scan?',
];

// Private screening question (final question for all flows)
const privateScreeningQuestion = 'Would you like to perform a private screening of your breasts?';

const Questionnaire: React.FC<QuestionnaireProps> = ({
  onNavigateToHome,
  onNavigateToUserProfile,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [activeQuestions, setActiveQuestions] = useState<string[]>([]);
  const [showAnswerOptions, setShowAnswerOptions] = useState(false);
  const [isGuidedFirstScan, setIsGuidedFirstScan] = useState(false);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [showPrivateScreening, setShowPrivateScreening] = useState(false);

  // Refs
  const howToRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handles the answer for the initial 'how long ago' question
  const handleFirstAnswer = (answer: string) => {
    if (answer === 'First time') {
      // Enter guided first scan mode
      setIsGuidedFirstScan(true);
      setActiveQuestions([]);
      setGuidedIndex(0);
      nextQuestion(0);
      return;
    }

    let questions;
    if (answer === 'Recently') {
      questions = recentScanQuestions;
    } else {
      questions = whileAgoQuestions;
    }
    setIsGuidedFirstScan(false);
    setActiveQuestions(questions);
    nextQuestion(0);
  };

  const handleStartQuestionnaire = () => {
    // Show the first question (the "how long ago" question)
    setCurrentQuestionIndex(0);
    setShowAnswerOptions(true);
    showQuestion();
  };

  const showQuestion = () => {
    // Simple function without animations
  };

  const nextQuestion = (nextIndex?: number) => {
    // Guided First Scan navigation
    if (isGuidedFirstScan) {
      const newGuidedIndex = nextIndex !== undefined ? nextIndex : guidedIndex + 1;
      if (newGuidedIndex < guidedFirstScanSteps.length) {
        setGuidedIndex(newGuidedIndex);
        showQuestion();
      } else {
        // End of guided scan, show private screening question
        setIsGuidedFirstScan(false);
        setShowPrivateScreening(true);
        showQuestion();
      }
      return;
    }

    const newIndex = nextIndex !== undefined ? nextIndex : currentQuestionIndex + 1;
    if (activeQuestions.length === 0) {
      // This is the initial selection, so we just set the index
      setCurrentQuestionIndex(newIndex);
      showQuestion();
    } else if (newIndex < activeQuestions.length) {
      setCurrentQuestionIndex(newIndex);
      showQuestion();
    } else {
      // End of regular questions, show private screening question
      setShowPrivateScreening(true);
      showQuestion();
    }
  };

  // Helper function to render answer buttons based on the current question
  const renderAnswerOptions = () => {
    // Private screening question
    if (showPrivateScreening) {
      const buttonStyle = {
        backgroundColor: '#E7B8FF',
        borderWidth: 1,
        borderColor: '#000000',
        shadowColor: '#E7B8FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      };

      return (
        <View className="w-full space-y-3">
          <TouchableOpacity
            className="rounded-full p-3 shadow-lg active:scale-95"
            style={buttonStyle}
            onPress={() => {
              // Handle "Yes" - you might want to navigate to private screening
              onNavigateToHome();
            }}>
            <Text className="text-center text-lg text-black">Yes, I would like to</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-full p-3 shadow-lg active:scale-95"
            style={buttonStyle}
            onPress={() => onNavigateToHome()}>
            <Text className="text-center text-lg text-black">No, maybe later</Text>
          </TouchableOpacity>
        </View>
      );
    }

    

    // Guided First Scan options
    if (isGuidedFirstScan) {
      const buttonStyle = {
        backgroundColor: '#E7B8FF',
        borderWidth: 1,
        borderColor: '#000000',
        shadowColor: '#E7B8FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      };
      const step = guidedFirstScanSteps[guidedIndex];
      return (
        <View
          style={{
            width: '100%',
            gap: isSmallDevice ? 12 : 16,
          }}>
          {step.options.map((label, idx) => (
            <TouchableOpacity
              key={`${guidedIndex}-opt-${idx}`}
              style={{
                borderRadius: 50,
                padding: isSmallDevice ? 12 : 16,
                ...buttonStyle,
              }}
              className="active:scale-95"
              onPress={() => nextQuestion()}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: isSmallDevice ? 16 : 18,
                  color: 'black',
                  fontWeight: '500',
                }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Now, render options for the actual questionnaire questions
    if (activeQuestions.length > 0) {
      const buttonStyle = {
        backgroundColor: '#E7B8FF',
        borderWidth: 1,
        borderColor: '#000000',
        shadowColor: '#E7B8FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      };

      switch (activeQuestions[currentQuestionIndex]) {
        case recentScanQuestions[0]: // "Any changes since your last scan?"
        case recentScanQuestions[1]: // "Have you noticed any new symptoms recently?"
        case recentScanQuestions[2]: // "Has anything been worrying you since your last scan?"
          return (
            <View
              style={{
                width: '100%',
                gap: isSmallDevice ? 12 : 16,
              }}>
              <TouchableOpacity
                style={{
                  width: isSmallDevice ? 280 : isMediumDevice ? 320 : 360,
                  borderRadius: 50,
                  padding: isSmallDevice ? 12 : 16,
                  ...buttonStyle,
                }}
                className="active:scale-95"
                onPress={() => nextQuestion()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: isSmallDevice ? 16 : 18,
                    color: 'black',
                    fontWeight: '500',
                  }}>
                  Yes, I have
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderRadius: 50,
                  padding: isSmallDevice ? 12 : 16,
                  ...buttonStyle,
                }}
                className="active:scale-95"
                onPress={() => nextQuestion()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: isSmallDevice ? 16 : 18,
                    color: 'black',
                    fontWeight: '500',
                  }}>
                  No, nothing unusual
                </Text>
              </TouchableOpacity>
            </View>
          );

        case whileAgoQuestions[0]: // "Do you remember when your last scan was?"
        case whileAgoQuestions[1]: // "Was it more than a year ago?"
        case whileAgoQuestions[2]: // "Has it been on your mind to schedule another scan?"
          return (
            <View
              style={{
                width: '100%',
                gap: isSmallDevice ? 12 : 16,
              }}>
              <TouchableOpacity
                style={{
                  width: isSmallDevice ? 280 : isMediumDevice ? 320 : 360,
                  borderRadius: 50,
                  padding: isSmallDevice ? 12 : 16,
                  ...buttonStyle,
                }}
                className="active:scale-95"
                onPress={() => nextQuestion()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: isSmallDevice ? 16 : 18,
                    color: 'black',
                    fontWeight: '500',
                  }}>
                  Last month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderRadius: 50,
                  padding: isSmallDevice ? 12 : 16,
                  ...buttonStyle,
                }}
                className="active:scale-95"
                onPress={() => nextQuestion()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: isSmallDevice ? 16 : 18,
                    color: 'black',
                    fontWeight: '500',
                  }}>
                  Last year
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderRadius: 50,
                  padding: isSmallDevice ? 12 : 16,
                  ...buttonStyle,
                }}
                className="active:scale-95"
                onPress={() => nextQuestion()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: isSmallDevice ? 16 : 18,
                    color: 'black',
                    fontWeight: '500',
                  }}>
                  Can&apos;t remember
                </Text>
              </TouchableOpacity>
            </View>
          );

        default:
          return null;
      }
    }
    return null;
  };

  // Thought bubble component with border and reduced padding
  const ThoughtBubble = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={style} className="relative">
      <View
        style={{
          marginHorizontal: isSmallDevice ? 16 : 20,
          padding: isSmallDevice ? 16 : 20,
          borderRadius: 24,
          backgroundColor: '#E7B8FF',
          borderWidth: 1,
          borderColor: '#000000',
          shadowColor: '#E7B8FF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
          elevation: 10,
        }}>
        {children}
      </View>
      {/* Thought bubble circles */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: [{ translateX: -12 }, { translateY: '100%' }],
        }}>
        <View
          style={{
            width: isSmallDevice ? 24 : 28,
            height: isSmallDevice ? 16 : 18,
            borderRadius: isSmallDevice ? 12 : 14,
            backgroundColor: '#E7B8FF',
            borderWidth: 1,
            borderColor: '#000000',
            position: 'absolute',
            bottom: isSmallDevice ? -8 : -10,
            left: isSmallDevice ? -8 : -10,
            shadowColor: '#E7B8FF',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
        <View
          style={{
            width: isSmallDevice ? 10 : 12,
            height: isSmallDevice ? 10 : 12,
            borderRadius: isSmallDevice ? 5 : 6,
            backgroundColor: '#E7B8FF',
            borderWidth: 1,
            borderColor: '#000000',
            position: 'absolute',
            bottom: isSmallDevice ? -20 : -25,
            left: isSmallDevice ? -16 : -20,
            shadowColor: '#E7B8FF',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
        <View
          style={{
            width: isSmallDevice ? 5 : 6,
            height: isSmallDevice ? 5 : 6,
            borderRadius: isSmallDevice ? 2.5 : 3,
            backgroundColor: '#E7B8FF',
            borderWidth: 1,
            borderColor: '#000000',
            position: 'absolute',
            bottom: isSmallDevice ? -28 : -35,
            left: isSmallDevice ? -20 : -25,
            shadowColor: '#E7B8FF',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </View>
    </View>
  );

  const GuidedHowToCard = () => {
    if (!isGuidedFirstScan) return null;
    const step = guidedFirstScanSteps[guidedIndex];

    return (
      <View
        style={{
          marginHorizontal: isSmallDevice ? 16 : 20,
          width: '100%',
          maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
          padding: isSmallDevice ? 16 : 20,
        }}>
        <View ref={howToRef} style={{ marginBottom: isSmallDevice ? 8 : 12 }}>
          {renderAnswerOptions()}
        </View>

        <Text
          style={{
            marginBottom: isSmallDevice ? 16 : 20,
            fontSize: isSmallDevice ? 18 : 20,
            textAlign: 'center',
            color: '#E7B8FF',
            fontWeight: '600',
          }}>
          Guided Self-Examination
        </Text>

        <Image
          source={{ uri: step.imageUri }}
          style={{
            width: '100%',
            height: isSmallDevice ? 170 : isMediumDevice ? 190 : 180,
            borderRadius: 16,
          }}
          resizeMode="cover"
        />

        <Text
          style={{
            marginTop: isSmallDevice ? 16 : 20,
            fontSize: isSmallDevice ? 16 : 18,
            fontWeight: '600',
            color: 'black',
          }}>
          {step.title}
        </Text>
        <Text
          style={{
            marginTop: isSmallDevice ? 4 : 8,
            fontSize: isSmallDevice ? 16 : 18,
            fontWeight: '600',
            color: 'black',
          }}>
          How to check
        </Text>
        {step.howTo.map((line, idx) => (
          <View
            key={`howto-${guidedIndex}-${idx}`}
            style={{
              marginTop: isSmallDevice ? 8 : 12,
              flexDirection: 'row',
            }}>
            <Text
              style={{
                fontSize: isSmallDevice ? 16 : 18,
                color: 'black',
                marginRight: 8,
              }}>
              •{' '}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: isSmallDevice ? 16 : 18,
                color: 'black',
                lineHeight: isSmallDevice ? 22 : 24,
              }}>
              {line}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Navbar title="Self Scan Questionnaire" onBack={onNavigateToHome} />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        style={{ paddingHorizontal: isSmallDevice ? 16 : isMediumDevice ? 20 : 24 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingVertical: isSmallDevice ? 16 : 20,
          paddingBottom: isSmallDevice ? 100 : 120,
        }}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: isSmallDevice ? 24 : 32,
          }}>
          {/* Enhanced Character Display */}
          <View style={{ marginBottom: isSmallDevice ? 16 : 20 }} className="items-center">
            <View className="bg-transparent">
              <Image
                source={
                  showPrivateScreening
                    ? require('../assets/moraPhn.png') // Replace with your actual filename
                    : require('../assets/mora.png')
                }
                style={{
                  width: showPrivateScreening
                    ? isSmallDevice
                      ? 150
                      : isMediumDevice
                        ? 170
                        : 190
                    : isSmallDevice
                      ? 120
                      : isMediumDevice
                        ? 140
                        : 160,
                  height: showPrivateScreening
                    ? isSmallDevice
                      ? 150
                      : isMediumDevice
                        ? 170
                        : 190
                    : isSmallDevice
                      ? 120
                      : isMediumDevice
                        ? 140
                        : 160,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Question Display in Thought Bubble */}
          {showPrivateScreening ? (
            <ThoughtBubble>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: isSmallDevice ? 16 : 18,
                  fontWeight: '500',
                  lineHeight: isSmallDevice ? 22 : 24,
                  color: 'black',
                }}>
                {privateScreeningQuestion}
              </Text>
            </ThoughtBubble>
          ) : isGuidedFirstScan ? (
            <ThoughtBubble>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: isSmallDevice ? 16 : 18,
                  fontWeight: '500',
                  lineHeight: isSmallDevice ? 22 : 24,
                  color: 'black',
                }}>
                {guidedFirstScanSteps[guidedIndex].question}
              </Text>
            </ThoughtBubble>
          ) : activeQuestions.length > 0 && currentQuestionIndex >= 0 ? (
            <ThoughtBubble>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: isSmallDevice ? 16 : 18,
                  fontWeight: '500',
                  lineHeight: isSmallDevice ? 22 : 24,
                  color: 'black',
                }}>
                {activeQuestions[currentQuestionIndex]}
              </Text>
            </ThoughtBubble>
          ) : currentQuestionIndex === 0 && activeQuestions.length === 0 ? (
            <ThoughtBubble>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: isSmallDevice ? 16 : 18,
                  fontWeight: '500',
                  lineHeight: isSmallDevice ? 22 : 24,
                  color: 'black',
                }}>
                When was your last self-scan?
              </Text>
            </ThoughtBubble>
          ) : null}

          {/* Initial options aligned center */}
          {currentQuestionIndex === 0 && activeQuestions.length === 0 && !isGuidedFirstScan && !showPrivateScreening && (
            <View style={{ width: '100%', alignItems: 'center', marginTop: 12 }}>
              <View style={{ width: '100%', maxWidth: 400, gap: isSmallDevice ? 10 : 12 }}>
                <TouchableOpacity
                  style={{
                    borderRadius: 24,
                    paddingVertical: isSmallDevice ? 10 : 12,
                    backgroundColor: '#E7B8FF',
                    borderWidth: 1,
                    borderColor: '#000',
                  }}
                  onPress={() => handleFirstAnswer('Recently')}>
                  <Text style={{ textAlign: 'center', color: 'black', fontWeight: '600' }}>Recently</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderRadius: 24,
                    paddingVertical: isSmallDevice ? 10 : 12,
                    backgroundColor: '#E7B8FF',
                    borderWidth: 1,
                    borderColor: '#000',
                  }}
                  onPress={() => handleFirstAnswer('A while ago')}>
                  <Text style={{ textAlign: 'center', color: 'black', fontWeight: '600' }}>A while ago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderRadius: 24,
                    paddingVertical: isSmallDevice ? 10 : 12,
                    backgroundColor: '#E7B8FF',
                    borderWidth: 1,
                    borderColor: '#000',
                  }}
                  onPress={() => handleFirstAnswer('First time')}>
                  <Text style={{ textAlign: 'center', color: 'black', fontWeight: '600' }}>First time</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {isGuidedFirstScan && <GuidedHowToCard />}

          {/* Enhanced Answer Options */}
          {!isGuidedFirstScan && showAnswerOptions && (
            <View
              style={{
                width: '100%',
                maxWidth: isSmallDevice ? 320 : isMediumDevice ? 360 : 400,
                paddingHorizontal: isSmallDevice ? 16 : 20,
              }}>
              {renderAnswerOptions()}
            </View>
          )}

          {/* Enhanced Start Button */}
          {currentQuestionIndex === -1 && (
            <TouchableOpacity
              style={{
                marginTop: isSmallDevice ? 24 : 32,
                borderRadius: 50,
                paddingHorizontal: isSmallDevice ? 24 : 32,
                paddingVertical: isSmallDevice ? 12 : 16,
                backgroundColor: '#E7B8FF',
                borderWidth: 1,
                borderColor: '#000000',
                shadowColor: '#E7B8FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 10,
              }}
              className="active:scale-95"
              onPress={handleStartQuestionnaire}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: isSmallDevice ? 18 : 20,
                  color: 'black',
                  fontWeight: '400',
                }}>
                Start Questionnaire
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <BottomBar
        onScanPress={() => {}} // Scan is already active
        onHomePress={onNavigateToHome}
        onProfilePress={onNavigateToUserProfile}
        activeTab="scan"
      />
    </SafeAreaView>
  );
};

export default Questionnaire;
