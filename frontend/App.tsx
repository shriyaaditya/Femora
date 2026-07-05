import './global.css';

import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView } from 'react-native';

import * as Font from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FontProvider } from './contexts/FontContext';

import Appointments from './components/Appointments';
import AskMora from './components/AskMora';
import BreastScan from './components/BreastScan';
import Calendar from './components/Calendar';
import HomePage from './components/HomePage';
import LoadingPage from './components/LoadingPage';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Questionnaire from './components/Questionnaire';
import ScanReport from './components/ScanReport';
import ScanResults from './components/ScanResults';
import UserProfile from './components/UserProfile';
import ViewHistory from './components/ViewHistory';

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
    | 'appointments'
  >('home');
  const [scanId, setScanId] = useState<string>('');
  const [showLoading, setShowLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { user, loading, markOnboardingComplete } = useAuth();

  // Load custom fonts - ALWAYS call this hook
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          DenisMacharov: require('./assets/fonts/DenisMacharov-Regular.ttf'),
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
    return undefined;
  }, [loading, fontsLoaded]);

  // Check if user needs onboarding after authentication
  useEffect(() => {
    if (user && !loading && !showLoading) {
      // If user hasn't completed onboarding, show onboarding screen
      if (!user.hasCompletedOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        // User has completed onboarding, show home screen
        setCurrentScreen('home');
      }
    }
  }, [user, loading, showLoading]);

  if (showLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Show login if no user
  if (!user) {
    return <Login onShowProfileForm={handleShowOnboarding} />;
  }

  // Show main app if user is authenticated
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {currentScreen === 'home' && (
        <HomePage
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToHistory={handleNavigateToHistory}
          onStartScan={handleStartScan}
          onLogout={handleLogout}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAppointments={handleNavigateToAppointments}
        />
      )}
      {currentScreen === 'askMora' && (
        <AskMora
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToScan={handleStartScan}
          onNavigateToAppointments={handleNavigateToAppointments}
        />
      )}
      {currentScreen === 'questionnaire' && (
        <Questionnaire
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onStartBreastScan={handleStartBreastScan}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToAppointments={handleNavigateToAppointments}
        />
      )}
      {currentScreen === 'viewHistory' && (
        <ViewHistory
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToScan={handleStartScan}
          onNavigateToScanReport={handleNavigateToReport}
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
        <Onboarding onComplete={handleOnboardingComplete} onBackToHome={handleNavigateToHome} />
      )}
      {currentScreen === 'appointments' && (
        <Appointments
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToScan={handleStartScan}
        />
      )}
      {currentScreen === 'breastScan' && (
        <BreastScan
          onNavigateToHome={handleNavigateToHome}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToCalendar={handleNavigateToCalendar}
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

      {currentScreen === 'scanReport' && (
        <ScanReport
          scanId={scanId}
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={onNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToReport={handleNavigateToReport}
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
          onNavigateToAppointments={handleNavigateToAppointments}
        />
      )}
    </SafeAreaView>
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

  function handleOnboardingComplete() {
    // Mark onboarding as complete and navigate to home
    markOnboardingComplete();
    setCurrentScreen('home');
  }

  function onNavigateToUserProfile() {
    setCurrentScreen('userProfile');
  }

  function handleNavigateToCalendar() {
    setCurrentScreen('calendar');
  }

  function handleNavigateToAppointments() {
    setCurrentScreen('appointments');
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
