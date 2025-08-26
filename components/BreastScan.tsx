import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedGridOverlay from './AnimatedGridOverlay';

interface BreastScanProps {
  onNavigateToHome: () => void;
  onNavigateToReport: (scanId: string) => void;
  onNavigateToCalendar?: () => void;
}

const BreastScan: React.FC<BreastScanProps> = ({
  onNavigateToHome,
  onNavigateToReport,
  onNavigateToCalendar,
}) => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isGridActive, setIsGridActive] = useState(true);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');


  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);
    setCapturedImages([]);
    setScanCompleted(false);

    try {
      let captureCount = 0;
      const maxCaptures = 5; // Capture 5 images total

      // Capture multiple images over 10 seconds
      intervalRef.current = setInterval(async () => {
        // Stop if we've completed scan or reached max captures
        if (scanCompleted || captureCount >= maxCaptures) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (!scanCompleted) {
            await completeScan();
          }
          return;
        }

        try {
          const photo = await cameraRef.current?.takePictureAsync({
            quality: 0.8,
            base64: true,
          });

          if (photo?.base64) {
            setCapturedImages((prev) => [...prev, photo.base64!]);
            captureCount++;
          }
        } catch (error) {
          console.error('Image capture error:', error);
        }
      }, 2000); // Capture every 2 seconds
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to start scan');
      setIsScanning(false);
    }
  };

  const completeScan = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Save scan data locally
      const scanId = `scan_${Date.now()}`;
      const scanData = {
        scanId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        imageCount: capturedImages.length,
        images: capturedImages,
      };

      await AsyncStorage.setItem(`breast_scan_${scanId}`, JSON.stringify(scanData));

      setScanCompleted(true);
      setIsScanning(false);

      Alert.alert('Scan Complete', 'Breast scan completed successfully!', [
        { text: 'View Report', onPress: () => onNavigateToReport(scanId) },
        { text: 'Continue', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Error completing scan:', error);
      Alert.alert('Error', 'Failed to complete scan');
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleGrid = () => {
    setIsGridActive(!isGridActive);
  };

  // Show loading while checking permission
  if (cameraPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFB0D9" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFB0D9" />
          <Text className="mt-4 text-gray-600">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission request if not granted
  if (!cameraPermission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFB0D9" />
        <Navbar title="Breast Scan" onBack={onNavigateToHome} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-lg text-gray-700">
            Camera permission is required to perform breast scans
          </Text>
          <TouchableOpacity
            className="rounded-2xl bg-[#FFB0D9] px-6 py-3"
            onPress={requestCameraPermission}>
            <Text className="text-center font-semibold text-white">Grant Permission</Text>
          </TouchableOpacity>
        </View>
        <BottomBar
          onScanPress={() => {}}
          onHomePress={onNavigateToHome}
          onCalendarPress={onNavigateToCalendar}
          onAIChatPress={() => {}}
          onDoctorPress={() => {}}
          activeTab="scan"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Navbar title="Breast Scan" onBack={onNavigateToHome} />

      <View className="flex-1">
        <CameraView ref={cameraRef} facing={facing} className="flex-1" ratio="4:3">
          {/* Grid Overlay */}
          {isGridActive && <AnimatedGridOverlay />}

          {/* Scan Controls */}
          <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
            <View className="mb-4 flex-row justify-center space-x-4">
              <TouchableOpacity className="rounded-full bg-white p-3" onPress={toggleGrid}>
                <Text className="text-black">Grid</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center space-x-4">
              {!isScanning ? (
                <TouchableOpacity
                  className="rounded-full bg-[#FFB0D9] px-8 py-4"
                  onPress={startScan}>
                  <Text className="text-center text-lg font-semibold text-white">Start Scan</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity className="rounded-full bg-red-500 px-8 py-4" onPress={stopScan}>
                  <Text className="text-center text-lg font-semibold text-white">Stop Scan</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Scan Status */}
            {isScanning && (
              <View className="mt-4 items-center">
                <Text className="text-center text-white">
                  Captured: {capturedImages.length} images
                </Text>
                <Text className="text-center text-sm text-gray-300">Scanning in progress...</Text>
              </View>
            )}

            {scanCompleted && (
              <View className="mt-4 items-center">
                <Text className="text-center text-green-400">
                  ✓ Scan completed! {capturedImages.length} images captured
                </Text>
              </View>
            )}
          </View>
        </CameraView>
      </View>

      <BottomBar
        onScanPress={() => {}}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={() => {}}
        onDoctorPress={() => {}}
        activeTab="scan"
      />
    </SafeAreaView>
  );
};

export default BreastScan;
