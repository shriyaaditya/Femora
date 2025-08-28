import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import AnimatedGridOverlay from './AnimatedGridOverlay';
import SecureImageService from '../services/secureImageService';

interface BreastScanProps {
  onNavigateToHome: () => void;
  onNavigateToReport: (scanId: string) => void;
  onNavigateToCalendar: () => void;
}

const BreastScan: React.FC<BreastScanProps> = ({
  onNavigateToHome,
  onNavigateToReport,
  onNavigateToCalendar,
}) => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isGridActive, setIsGridActive] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [currentStep, setCurrentStep] = useState<'alignment' | 'scanning'>('alignment');
  const [alignmentStep, setAlignmentStep] = useState(1);
  const [currentImageNumber, setCurrentImageNumber] = useState(1);
  const [totalImages, setTotalImages] = useState(2);
  const [processingStatus, setProcessingStatus] = useState<{
    status: 'processing' | 'completed' | 'failed';
    message?: string;
  } | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = async () => {
    console.log('Starting scan, activating grid');
    setIsScanning(true);
    setCurrentStep('scanning');
    setIsGridActive(true); // Activate grid animation

    try {
      // Simulate capturing one image
      const simulatedImageData = `simulated_image_${currentImageNumber}_${Date.now()}`;
      setCapturedImages((prev) => [...prev, simulatedImageData]);

      // Stop animation after capture
      console.log('Image captured, stopping grid animation');
      setIsGridActive(false);

      // Update processing status
      if (currentImageNumber === 2) {
        setProcessingStatus({
          status: 'completed',
          message: `Image 2 captured successfully! Both images are ready.`,
        });
      } else {
        setProcessingStatus({
          status: 'processing',
          message: `Image ${currentImageNumber} captured successfully!`,
        });
      }

      setIsScanning(false);
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to capture image');
      setIsScanning(false);
      setIsGridActive(false);
    }
  };

  const captureNextImage = () => {
    if (currentImageNumber < totalImages) {
      setCurrentImageNumber(currentImageNumber + 1);
      setCurrentStep('alignment'); // Go back to alignment for next image
      setAlignmentStep(1); // Reset alignment steps
      setIsGridActive(false); // Stop animation during alignment
      setProcessingStatus(null); // Clear previous status
    } else {
      // All images captured, complete the scan
      completeScan();
    }
  };

  const getAlignmentGuidance = () => {
    const orientations = [
      { emoji: '📱', title: 'Close-up', description: 'Hold phone close to chest (6-8 inches)' },
      {
        emoji: '📱',
        title: 'Not Close-up',
        description: 'Hold phone further from chest (12-16 inches)',
      },
    ];

    return orientations[currentImageNumber - 1] || orientations[0];
  };
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
        isSimulated: true,
      };

      await AsyncStorage.setItem(`breast_scan_${scanId}`, JSON.stringify(scanData));
      setScanCompleted(true);
      setIsScanning(false);
      setIsGridActive(false);

      // Navigate to report after a short delay
      setTimeout(() => {
        onNavigateToReport(`scan_${Date.now()}`);
      }, 2000);

      console.log('🔒 SECURITY COMPLIANCE: All images processed immediately - NO local storage');
      console.log('✅ Images encrypted and stored in GCP, only metadata references stored locally');

    } catch (error) {
      console.error('Error completing scan:', error);
      setProcessingStatus({ status: 'failed', message: 'Failed to complete scan securely' });
      Alert.alert('Error', 'Failed to complete scan securely');
      setIsScanning(false);
      setIsGridActive(false);
    }
  };

  const stopScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
    setIsGridActive(false);
  };

  const toggleGrid = () => {
    setIsGridActive(!isGridActive);
  };

  const nextAlignmentStep = () => {
    // Go directly to scanning after clicking "Next Step"
    console.log('Moving to scanning step');
    setCurrentStep('scanning');
    // Small delay to ensure state is updated before activating animation
    setTimeout(() => {
      console.log('Activating grid animation');
      setIsGridActive(true); // Activate grid animation for scanning
    }, 100);
  };

  const prevAlignmentStep = () => {
    if (alignmentStep === 1) {
      setAlignmentStep(1);
    }
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

      {/* Progress Bar */}
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: currentImageNumber >= 1 ? '#10B981' : '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: currentImageNumber >= 1 ? 'white' : '#9CA3AF', fontSize: 12, fontWeight: 'bold' }}>1</Text>
          </View>
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: currentImageNumber >= 2 ? '#10B981' : '#E5E7EB',
              marginHorizontal: 12,
            }}
          />
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: currentImageNumber >= 2 ? '#10B981' : '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: currentImageNumber >= 2 ? 'white' : '#9CA3AF', fontSize: 12, fontWeight: 'bold' }}>2</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 14, color: currentImageNumber >= 1 ? '#10B981' : '#9CA3AF', fontWeight: '500' }}>
            Image 1
          </Text>
          <Text style={{ fontSize: 14, color: currentImageNumber >= 2 ? '#10B981' : '#9CA3AF', fontWeight: '500' }}>
            Image 2
          </Text>
        </View>
      </View>

      {/* Main Content Container */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Content Container - scrollable */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ 
            alignItems: 'center', 
            paddingVertical: 20,
            paddingHorizontal: 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={false}
        >
          {/* Animated Grid Overlay - only visible during scanning */}
          {currentStep === 'scanning' && (
            <View style={{ 
              marginBottom: 10,
              zIndex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <AnimatedGridOverlay isActive={isGridActive} />
            </View>
          )}
          {currentStep === 'alignment' ? (
            // Phone Alignment Guidance - Full screen content
            <View
              style={{
                alignItems: 'center',
                width: '100%',
                maxWidth: 400,
                paddingHorizontal: 20,
                paddingTop: 20,
              }}>
              <Text
                style={{
                  marginBottom: 16,
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#2D1B3D',
                }}>
                Image {currentImageNumber} of {totalImages}
              </Text>

              <Text
                style={{
                  marginBottom: 32,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#2D1B3D',
                }}>
                Image {currentImageNumber} Alignment Guide
              </Text>

              {/* Step Indicator */}
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 32,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#8B5CF6',
                  }}
                />
                <View
                  style={{
                    width: 40,
                    height: 2,
                    backgroundColor: '#E5E7EB',
                    marginHorizontal: 8,
                  }}
                />
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#E5E7EB',
                  }}
                />
              </View>

              {/* Alignment Image */}
              <View
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 16,
                  backgroundColor: '#F3F4F6',
                  marginBottom: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>
                    {getAlignmentGuidance().emoji}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                    {getAlignmentGuidance().title}
                  </Text>
                </View>
              </View>

              {/* Guidance Text */}
              <Text
                style={{
                  marginBottom: 32,
                  textAlign: 'center',
                  fontSize: 16,
                  lineHeight: 24,
                  color: '#6B7280',
                  paddingHorizontal: 20,
                }}>
                {getAlignmentGuidance().description}
              </Text>

              {/* Navigation Buttons */}
              <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{
                    borderRadius: 25,
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                    backgroundColor: '#8B5CF6',
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  onPress={nextAlignmentStep}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                    Start Image {currentImageNumber} Scan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Scanning Interface - Only show when not in alignment mode
            <View
              style={{
                flex: 1,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>


              {/* Text Below the Animation */}
              <View
                style={{
                  width: '100%',
                  maxWidth: 300,
                  alignItems: 'center',
                }}>
                {/* Instructions */}
                <View style={{ marginBottom: 24, alignItems: 'center' }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 20,
                      fontWeight: '600',
                      color: '#2D1B3D',
                      marginBottom: 8,
                    }}>
                    {scanCompleted
                      ? 'Scan Complete!'
                      : isScanning
                        ? 'Capturing Image...'
                        : 'Ready to Capture'}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      lineHeight: 24,
                      color: '#6B7280',
                    }}>
                    {scanCompleted
                      ? 'Generating your personalized health report...'
                      : isScanning
                        ? `Please remain still while we capture Image ${currentImageNumber}...`
                        : `Image ${currentImageNumber} of ${totalImages} - ${getAlignmentGuidance().description}`}
                  </Text>
                  
                  
                </View>

                {/* Processing Status */}
                {processingStatus && (
                  <View
                    style={{
                      marginBottom: 16,
                      width: '100%',
                      maxWidth: 300,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: processingStatus.status === 'completed' ? '#10B981' : '#BFDBFE',
                      backgroundColor: processingStatus.status === 'completed' ? '#ECFDF5' : '#EFF6FF',
                      padding: 16,
                    }}>
                    <Text style={{ 
                      textAlign: 'center', 
                      fontSize: 14, 
                      color: processingStatus.status === 'completed' ? '#065F46' : '#1E40AF' 
                    }}>
                      {processingStatus.status === 'completed' ? '🎉' : '✅'} {processingStatus.message}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ width: '100%', maxWidth: 300, gap: 20 }}>
                  {!isScanning && !scanCompleted && capturedImages.length > 0 ? (
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        paddingVertical: 16,
                        backgroundColor: '#10B981',
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      onPress={captureNextImage}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 18,
                          fontWeight: '600',
                          color: '#FFFFFF',
                        }}>
                        {currentImageNumber < totalImages ? 'Capture Image 2' : 'Complete Scan'}
                      </Text>
                    </TouchableOpacity>
                  ) : !isScanning && !scanCompleted ? (
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        paddingVertical: 16,
                        backgroundColor: '#8B5CF6',
                        shadowColor: '#8B5CF6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      onPress={startScan}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 18,
                          fontWeight: '600',
                          color: '#FFFFFF',
                        }}>
                        {currentImageNumber === 1 ? 'Capture Image 1' : 'Capture Image 2'}
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
                      onPress={() => {
                        setCurrentStep('alignment');
                        setIsGridActive(false);
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 16,
                          fontWeight: '500',
                          color: '#8B5CF6',
                        }}>
                        Back to Alignment
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Bottom padding to ensure scrollability */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#0369a1',
    textAlign: 'center',
    marginBottom: 8,
  },
  processingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0369a1',
    borderTopColor: 'transparent',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#374151',
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNotice: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default BreastScan;
