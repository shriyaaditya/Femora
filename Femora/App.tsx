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
import Login from './components/Login';
import LoadingPage from './components/LoadingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'askMora' | 'questionnaire' | 'viewHistory' | 'userProfile' | 'onboarding' | 'breastScan' | 'scanReport'
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
    console.log('🔄 [App] Logout requested, resetting to home screen');
    // Reset to home screen - the AuthContext will handle showing login
    setCurrentScreen('home');
    // Clear any scan data
    setScanId('');
  };

  const handleShowOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  const handleNavigateToUserProfile = () => {
    setCurrentScreen('userProfile');
  };

  const handleNavigateToReport = (id: string) => {
    setScanId(id);
    setCurrentScreen('scanReport');
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
          onStartBreastScan={handleStartBreastScan}
          onLogout={handleLogout}
          onNavigateToUserProfile={handleNavigateToUserProfile}
        />
      )}
      {currentScreen === 'askMora' && (
        <AskMora onNavigateToHome={handleNavigateToHome} onNavigateToUserProfile={handleNavigateToUserProfile} />
      )}
      {currentScreen === 'questionnaire' && (
        <Questionnaire onNavigateToHome={handleNavigateToHome} onNavigateToUserProfile={handleNavigateToUserProfile} />
      )}
      {currentScreen === 'viewHistory' && (
        <ViewHistory onNavigateToHome={handleNavigateToHome} onNavigateToUserProfile={handleNavigateToUserProfile} />
      )}
      {currentScreen === 'userProfile' && <UserProfile onNavigateToHome={handleNavigateToHome} />}
      {currentScreen === 'onboarding' && <Onboarding onComplete={handleNavigateToHome} onBackToHome={handleNavigateToHome} />}
      {currentScreen === 'breastScan' && (
        <BreastScan 
          onNavigateToHome={handleNavigateToHome} 
          onNavigateToReport={handleNavigateToReport} 
        />
      )}
      {currentScreen === 'scanReport' && (
        <ScanReport 
          scanId={scanId} 
          onNavigateToHome={handleNavigateToHome} 
          onNavigateToUserProfile={handleNavigateToUserProfile}
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
