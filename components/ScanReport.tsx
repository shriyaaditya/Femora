import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageProcessorResult {
  data: ArrayBuffer;
  dtype: string;
  shape: number[];
}

interface ScanReportProps {
  scanId: string;
  onNavigateToHome: () => void;
  onNavigateToScan: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
}

class ImageProcessor {
  static async fromBase64(base64: string): Promise<ImageProcessorResult | null> {
    try {
      const cleaned = base64.replace(/^data:.*;base64,/, '');
      const binaryString = atob(cleaned);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      return { data: bytes.buffer, dtype: 'uint8', shape: [len] };
    } catch (error) {
      console.error('ImageProcessor error:', error);
      return null;
    }
  }
}

const ScanReport: React.FC<ScanReportProps> = ({
  scanId,
  onNavigateToHome,
  onNavigateToScan,
  onNavigateToCalendar,
  onNavigateToAskMora,
}) => {
  const { user } = useAuth();
  // @ts-ignore
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGridActive, setIsGridActive] = useState(true);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        console.log('Requesting camera permission...');
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('Camera permission status:', status);
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    };

    getCameraPermission();
  }, []);

  const uploadArrayToStorage = async (
    uid: string,
    targetScanId: string,
    dtype: string,
    shape: number[],
    arrayBuffer: ArrayBuffer
  ) => {
    const path = `users/${uid}/scans/${targetScanId}/array.bin`;
    const ref = storageRef(storage, path);
    const uint8 = new Uint8Array(arrayBuffer);
    const metadata = {
      contentType: 'application/octet-stream',
      customMetadata: { dtype, shape: JSON.stringify(shape) },
    };
    await uploadBytes(ref, uint8, metadata);
    const url = await getDownloadURL(ref);
    return url;
  };

  const handleCapture = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web fallback: prompt file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          if (!input.files || input.files.length === 0) return;
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            const result = await ImageProcessor.fromBase64(base64);
            if (!result || !result.data) throw new Error('ImageProcessor returned no data');
            const arrayBuffer = result.data as ArrayBuffer;
            if (!user) throw new Error('User not authenticated');
            setLoading(true);
            const downloadUrl = await uploadArrayToStorage(
              user.uid,
              scanId || `${Date.now()}`,
              result.dtype,
              result.shape,
              arrayBuffer
            );
            setLoading(false);
            Alert.alert('Upload complete', `Array uploaded to: ${downloadUrl}`);
          };
          reader.readAsDataURL(file);
        };
        input.click();
      } else {
        if (!cameraRef.current) {
          Alert.alert('Camera not ready');
          return;
        }
        if (!user) {
          Alert.alert('User not authenticated');
          return;
        }
        setLoading(true);

        // Temporarily hide grid during capture
        setIsGridActive(false);

        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.9 });
        if (!photo?.base64) throw new Error('Failed to capture image base64');

        // Show grid again after capture
        setIsGridActive(true);

        const result = await ImageProcessor.fromBase64(photo.base64);
        if (!result || !result.data) throw new Error('ImageProcessor returned no data');
        const arrayBuffer = result.data as ArrayBuffer;
        const downloadUrl = await uploadArrayToStorage(
          user.uid,
          scanId || `${Date.now()}`,
          result.dtype,
          result.shape,
          arrayBuffer
        );
        setLoading(false);
        Alert.alert('Upload complete', `Array uploaded to: ${downloadUrl}`);
      }
    } catch (err: any) {
      console.error('Capture/upload error:', err);
      setLoading(false);
      setIsGridActive(true); // Ensure grid is visible again on error
      Alert.alert('Error', err.message || 'Failed to capture and upload image array');
    }
  };

  const toggleGrid = () => {
    setIsGridActive(!isGridActive);
  };

  // Show loading while checking permission
  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5a4" />
          <Text className="mt-4 text-gray-600">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if permission denied
  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="mb-4 text-center text-lg text-gray-800">
            Camera access is required for scanning
          </Text>
          <TouchableOpacity
            className="bg-purple,-600 rounded-full px-6 py-3"
            onPress={() => onNavigateToHome()}>
            <Text className="font-semibold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <Navbar title="Capture Scan" onBack={onNavigateToHome} />
      <View style={{ flex: 1, position: 'relative' }}>
        {Platform.OS !== 'web' ? (
          // @ts-ignore
          <Camera
            ref={cameraRef}
            style={{ flex: 1 }}
            // @ts-ignore
            type={CameraType.back}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Web: Upload an image file instead of using camera</Text>
          </View>
        )}

        {/* Control Buttons */}
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 20,
          }}>
          <TouchableOpacity
            onPress={handleCapture}
            disabled={loading}
            style={{
              backgroundColor: '#0ea5a4',
              paddingVertical: 14,
              borderRadius: 999,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {loading ? 'Processing...' : 'Capture / Upload'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleGrid}
            style={{
              backgroundColor: '#8B5CF6',
              paddingVertical: 12,
              borderRadius: 999,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {isGridActive ? 'Hide Grid' : 'Show Grid'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNavigateToScan}
            style={{
              backgroundColor: '#e5e7eb',
              paddingVertical: 12,
              borderRadius: 999,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#374151' }}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={() => {}}
        activeTab="scan"
      />
    </SafeAreaView>
  );
};

export default ScanReport;
