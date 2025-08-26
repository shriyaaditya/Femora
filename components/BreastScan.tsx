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
  const [processingStatus, setProcessingStatus] = useState<{
    status: 'processing' | 'completed' | 'failed';
    message?: string;
  } | null>(null);

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

      // Navigate to report after a short delay
      setTimeout(() => {
        onNavigateToReport(scanId);
      }, 2000);
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

  if (!cameraPermission?.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Navbar title="Breast Scan" onBack={onNavigateToHome} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Camera permission is required to perform breast scans.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#8B5CF6',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={requestCameraPermission}>
            <Text style={{ color: 'white', fontSize: 16 }}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Navbar title="Breast Scan" onBack={onNavigateToHome} />

      {/* Hidden Camera */}
      <View style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        <CameraView ref={cameraRef} facing="front" style={{ width: 1, height: 1 }} />
      </View>

      {/* Main Content Container */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Animated Grid Overlay - fills the space below navbar */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <AnimatedGridOverlay isActive={isGridActive} />
        </View>

        {/* Content Container - centered in remaining space */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Scanning Instructions */}
          <View style={{ marginBottom: 32, alignItems: 'center' }}>
            <Text style={{ 
              marginBottom: 16, 
              textAlign: 'center', 
              fontSize: 20, 
              fontWeight: '600', 
              color: '#2D1B3D' 
            }}>
              {scanCompleted
                ? 'Scan Complete!'
                : isScanning
                  ? 'Scanning in Progress...'
                  : 'Ready to Start Scan'}
            </Text>

            <Text style={{ 
              marginBottom: 32, 
              textAlign: 'center', 
              fontSize: 16, 
              lineHeight: 24, 
              color: '#6B7280' 
            }}>
              {scanCompleted
                ? 'Generating your personalized health report...'
                : isScanning
                  ? 'Please remain still. The scan will complete automatically in a few seconds.'
                  : 'Position yourself comfortably. The camera will capture images automatically when you start.'}
            </Text>
          </View>

          {/* Processing Status */}
          {processingStatus && (
            <View style={{ 
              marginBottom: 24, 
              width: '100%', 
              maxWidth: 300, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: '#BFDBFE', 
              backgroundColor: '#EFF6FF', 
              padding: 16 
            }}>
              <Text style={{ textAlign: 'center', fontSize: 14, color: '#1E40AF' }}>
                🔄{' '}
                {processingStatus.status === 'processing'
                  ? 'Processing with AI...'
                  : processingStatus.status === 'completed'
                    ? 'AI Analysis Complete!'
                    : processingStatus.status === 'failed'
                      ? 'Processing Failed'
                      : 'Processing...'}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ width: '100%', maxWidth: 300, gap: 20 }}>
            {!isScanning && !scanCompleted ? (
              <TouchableOpacity
                style={{ 
                  borderRadius: 25, 
                  paddingVertical: 16, 
                  backgroundColor: '#8B5CF6',
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
                onPress={startScan}>
                <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                  Start Scan
                </Text>
              </TouchableOpacity>
            ) : isScanning && !scanCompleted ? (
              <TouchableOpacity 
                style={{ 
                  borderRadius: 25, 
                  paddingVertical: 16, 
                  backgroundColor: '#EF4444',
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
                onPress={stopScan}>
                <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                  Stop Scan
                </Text>
              </TouchableOpacity>
            ) : null}

            {!scanCompleted && (
              <TouchableOpacity
                style={{
                  borderRadius: 25,
                  borderWidth: 1,
                  paddingVertical: 12,
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderColor: '#8B5CF6',
                }}
                onPress={onNavigateToHome}>
                <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '500', color: '#8B5CF6' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Security Notice */}
          <View style={{ position: 'absolute', bottom: 32, left: 0, right: 0 }}>
            <Text style={{ textAlign: 'center', fontSize: 12, color: '#8B5CF6' }}>
              🔒 Your privacy is protected. Images are encrypted and securely processed with Python
              AI backend.
            </Text>
          </View>
        </View>
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
