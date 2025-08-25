import './global.css';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
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
  const { user, loading } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#f471b5').catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }, []);

  // Add delay to loading screen to make it visible longer
  useEffect(() => {
    if (!loading) {
      // Add extra delay after authentication is complete
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000); // Show loading for 2 seconds after auth is complete

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleNavigateToAskMora = () => {
    setCurrentScreen('askMora');
  };

  const handleNavigateToHome = () => {
    setCurrentScreen('home');
  };

  const handleNavigateToHistory = () => {
    setCurrentScreen('viewHistory');
  };

  const handleStartScan = () => {
    setCurrentScreen('questionnaire');
  };

  const handleStartBreastScan = () => {
    setCurrentScreen('breastScan');
  };

  const handleLogout = () => {
    // Reset to home screen - the AuthContext will handle showing login
    setCurrentScreen('home');
  };

  const handleShowOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  const handleNavigateToUserProfile = () => {
    setCurrentScreen('userProfile');
  };

  const handleNavigateToCalendar = () => {
    setCurrentScreen('calendar');
  };

  const handleNavigateToReport = (id: string) => {
    setScanId(id);
    setCurrentScreen('scanReport');
  };

  const handleNavigateToScanResults = (id: string) => {
    setScanId(id);
    setCurrentScreen('scanResults');
  };

  // Show loading screen while checking authentication or during the delay
  if (loading || showLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Show login screen if user is not authenticated
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
          onNavigateToUserProfile={handleNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
        />
      )}
      {currentScreen === 'askMora' && (
        <AskMora
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={handleNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToScan={handleStartScan}
        />
      )}
      {currentScreen === 'questionnaire' && (
        <Questionnaire
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={handleNavigateToUserProfile}
          onStartBreastScan={handleStartBreastScan}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
        />
      )}
      {currentScreen === 'viewHistory' && (
        <ViewHistory
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={handleNavigateToUserProfile}
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
          onNavigateToUserProfile={handleNavigateToUserProfile}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToAskMora={handleNavigateToAskMora}
        />
      )}

      {currentScreen === 'calendar' && (
        <Calendar
          onNavigateToHome={handleNavigateToHome}
          onNavigateToUserProfile={handleNavigateToUserProfile}
          onNavigateToReport={handleNavigateToReport}
          onNavigateToAskMora={handleNavigateToAskMora}
          onNavigateToScan={handleStartScan}
          onNavigateToScanResults={handleNavigateToScanResults}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
