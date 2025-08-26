import './global.css';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, Text } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as Font from 'expo-font';
import HomePage from './components/HomePage';
import AskMora from './components/AskMora';
import Questionnaire from './components/Questionnaire';
import ViewHistory from './components/ViewHistory';
import UserProfile from './components/UserProfile';
import Onboarding from './components/Onboarding';
import BreastScan from './components/BreastScan';
import ScanReport from './components/ScanReport';
import ScanResults from './components/ScanResults';
import Calendar from './components/Calendar';
import Login from './components/Login';
import LoadingPage from './components/LoadingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FontProvider } from './contexts/FontContext';

export default function App() {
  return (
    <FontProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </FontProvider>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<
    | 'home'
    | 'askMora'
    | 'questionnaire'
    | 'viewHistory'
    | 'userProfile'
    | 'onboarding'
    | 'breastScan'
    | 'scanReport'
    | 'calendar'
    | 'scanResults'
  >('home');
  const [scanId, setScanId] = useState<string>('');
  const [showLoading, setShowLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { user, loading } = useAuth();

  // Load custom fonts - ALWAYS call this hook
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'DenisMacharov': require('./assets/fonts/DenisMacharov-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue without custom fonts
      }
    };

    loadFonts();
  }, []);

  // Navigation bar setup - ALWAYS call this hook
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#f471b5').catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }, []);

  // Loading screen delay - ALWAYS call this hook
  useEffect(() => {
    if (!loading && fontsLoaded) {
      // Add extra delay after authentication is complete
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000); // Show loading for 2 seconds after auth is complete

      return () => clearTimeout(timer);
    }
  }, [loading, fontsLoaded]);

  // Show loading until fonts are loaded
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFE6F2', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'System', fontSize: 18, color: '#FF66CC' }}>
          Loading Fonts...
        </Text>
      </SafeAreaView>
    );
  }

  // Show loading screen
  if (showLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Show login if no user
  if (!user) {
    return <Login onShowProfileForm={handleShowOnboarding} />;
  }

  // Show main app if user is authenticated
  return (
    <>
      {currentScreen === 'home' && (
        <HomePage
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToHistory={handleNavigateToHistory}
          onStartScan={handleStartScan}
          onLogout={handleLogout}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
        />
      )}
      {currentScreen === 'askMora' && (
        <AskMora
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToScan={handleStartScan}
        />
      )}
      {currentScreen === 'questionnaire' && (
        <Questionnaire
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onStartBreastScan={handleStartBreastScan}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
        />
      )}
      {currentScreen === 'viewHistory' && (
        <ViewHistory
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToScan={handleStartScan}
        />
      )}
      {currentScreen === 'userProfile' && (
        <UserProfile
          onNavigateToHome={handleNavigateToHome}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToScan={handleStartScan}
        />
      )}
      {currentScreen === 'onboarding' && (
        <Onboarding onComplete={handleNavigateToHome} onBackToHome={handleNavigateToHome} />
      )}
      {currentScreen === 'breastScan' && (
        <BreastScan
          onNavigateToHome={handleNavigateToHome}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToCalendar={handleNavigateToCalendar}
        />
      )}
      {currentScreen === 'scanReport' && (
        <ScanReport
          scanId={scanId}
          onNavigateToHome={handleNavigateToHome}
          onNavigateToScan={handleStartScan}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
        />
      )}
      {currentScreen === 'scanResults' && (
        <ScanResults
          scanId={scanId}
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
        />
      )}

      {currentScreen === 'calendar' && (
        <Calendar
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToScan={handleStartScan}
          onNavigateToScanResults={handleNavigateToScanResults}
        />
      )}
    </>
  );

  // Navigation handler functions
  function handleNavigateToAskMora() {
    setCurrentScreen('askMora');
  }

  function handleNavigateToHome() {
    setCurrentScreen('home');
  }

  function handleNavigateToHistory() {
    setCurrentScreen('viewHistory');
  }

  function handleStartScan() {
    setCurrentScreen('questionnaire');
  }

  function handleStartBreastScan() {
    setCurrentScreen('breastScan');
  }

  function handleLogout() {
    // Reset to home screen - the AuthContext will handle showing login
    setCurrentScreen('home');
  }

  function handleShowOnboarding() {
    setCurrentScreen('onboarding');
  }

  function onNavigateToUserProfile() {
    setCurrentScreen('userProfile');
  }

  function handleNavigateToCalendar() {
    setCurrentScreen('calendar');
  }

  function handleNavigateToReport(id: string) {
    setScanId(id);
    setCurrentScreen('scanReport');
  }

  function handleNavigateToScanResults(id: string) {
    setScanId(id);
    setCurrentScreen('scanResults');
  }
}
