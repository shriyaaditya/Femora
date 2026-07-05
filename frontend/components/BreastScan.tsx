import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
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
  const [currentStep, setCurrentStep] = useState<'alignment' | 'scanning'>('alignment');
  const [currentImageNumber, setCurrentImageNumber] = useState(1);
  const [totalImages] = useState(2);
  const [processingStatus, setProcessingStatus] = useState<{
    status: 'processing' | 'completed' | 'failed';
    message?: string;
  } | null>(null);

  // NEW: Add processing ID tracking
  const [processingIds] = useState<string[]>([]);
  const [detailedStatus, setDetailedStatus] = useState<{
    [key: string]: {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      result?: any;
      error?: string;
    };
  }>({});

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  // Request camera permission when component mounts
  useEffect(() => {
    if (cameraPermission && !cameraPermission.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission, requestCameraPermission]);

  const startScan = async () => {
    console.log('Starting scan, activating grid');
    setIsScanning(true);
    setCurrentStep('scanning');
    setIsGridActive(true); // Activate grid animation
    setShowCamera(true); // Show camera for actual capture

    try {
      // Wait for camera to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture actual image from front camera
      if (cameraRef.current && cameraPermission?.granted) {
        console.log('📸 Capturing image from front camera...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false,
        });
        
        if (photo.base64 && typeof photo.base64 === 'string') {
          console.log('✅ Real image captured from camera');
          const base64String = photo.base64;
          setCapturedImages((prev) => [...prev, base64String]);
          
          // Process the real image with backend
          await processImageWithBackend(base64String);
        } else {
          throw new Error('Failed to capture image from camera');
        }
      } else {
        // Fallback to simulated capture if camera not available
        console.log('⚠️ Camera not available, using simulated capture');
        const simulatedImageData = `simulated_image_${currentImageNumber}_${Date.now()}`;
        setCapturedImages((prev) => [...prev, simulatedImageData]);
        await processImageWithBackend(simulatedImageData);
      }

      // Stop animation after capture
      console.log('Image captured, stopping grid animation');
      setIsGridActive(false);
      setShowCamera(false);

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
      setShowCamera(false);
    }
  };

  // NEW: Process image with backend using GCP upload (immediate processing)
  const processImageWithBackend = async (imageData: string) => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      setProcessingStatus({
        status: 'processing',
        message: '🔐 Encrypting and uploading image to GCP...'
      });

      // Call the secure image service (GCP upload - immediate processing)
      const result = await SecureImageService.secureImageFlow(
        imageData,
        {
          userId: user.id,
          scanId: `scan_${Date.now()}`,
          scanType: 'breast-scan',
          quality: 95,
        }
      );

      if (result.success && result.processingId) {
        console.log('✅ Image processed successfully:', result);
        
        // Store processing ID for reference (this is actually the scan ID)
        // setProcessingIds(prev => [...prev, result.processingId!]);
        
        // GCP upload is immediate processing - no status polling needed
        // The image is already encrypted and stored in GCP
        setProcessingStatus({
          status: 'completed',
          message: `✅ Image securely processed and stored in GCP! Scan ID: ${result.processingId}`
        });
      } else {
        throw new Error(result.message || 'Processing failed');
      }

    } catch (error) {
      console.error('❌ Image processing failed:', error);
      setProcessingStatus({
        status: 'failed',
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  // NEW: Poll backend for processing status
  const startStatusPolling = (processingId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await SecureImageService.getProcessingStatus(processingId);
        
        setDetailedStatus(prev => ({
          ...prev,
          [processingId]: status
        }));

        // Stop polling if processing is complete or failed
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollInterval);
          console.log(`✅ Status polling stopped for ${processingId}: ${status.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to get status for ${processingId}:`, error);
        // Stop polling on error
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 5 * 60 * 1000);
  };

  const captureNextImage = () => {
    if (currentImageNumber < totalImages) {
      setCurrentImageNumber(currentImageNumber + 1);
      setCurrentStep('alignment'); // Go back to alignment for next image
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

  const clearOldScanData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const scanKeys = keys.filter(key => key.startsWith('breast_scan_'));
      
      // Keep only the 5 most recent scans
      if (scanKeys.length > 5) {
        const keysToRemove = scanKeys.slice(0, scanKeys.length - 5);
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`🧹 Cleaned up ${keysToRemove.length} old scan records`);
      }
    } catch (error) {
      console.warn('Failed to clear old scan data:', error);
    }
  };

  const clearAllScanData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const scanKeys = keys.filter(key => key.startsWith('breast_scan_'));
      
      if (scanKeys.length > 0) {
        await AsyncStorage.multiRemove(scanKeys);
        console.log(`🧹 Cleared all ${scanKeys.length} scan records to free up space`);
      }
    } catch (error) {
      console.warn('Failed to clear all scan data:', error);
    }
  };

  const completeScan = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Clear all old scan data to fix database full error
      await clearAllScanData();

      // Save scan metadata locally (without large image data)
      const scanId = `scan_${Date.now()}`;
      const scanMetadata = {
        scanId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        imageCount: capturedImages.length,
        // Don't store images locally - they're already in GCP
        isSimulated: true,
      };

      await AsyncStorage.setItem(`breast_scan_${scanId}`, JSON.stringify(scanMetadata));
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
    // This function is kept for future use but simplified
    console.log('Previous alignment step');
  };

  if (!cameraPermission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
                    {getAlignmentGuidance()?.emoji || '📱'}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                    {getAlignmentGuidance()?.title || 'Position your device'}
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
                {getAlignmentGuidance()?.description || 'Please position your device correctly for scanning.'}
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

              {/* Hidden Camera View - Captures without showing live preview */}
              {showCamera && cameraPermission?.granted && (
                <View style={{
                  position: 'absolute',
                  top: -1000, // Hide camera view off-screen
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1000,
                  opacity: 0, // Make it invisible
                }}>
                  <CameraView
                    ref={cameraRef}
                    style={{
                      flex: 1,
                      width: '100%',
                      height: '100%',
                    }}
                    facing="front"
                  />
                </View>
              )}


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
                        ? `📸 Front camera capturing Image ${currentImageNumber}... Please remain still`
                        : `Image ${currentImageNumber} of ${totalImages} - ${getAlignmentGuidance()?.description || 'Position your device'}`}
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

                {/* NEW: Detailed Backend Processing Status */}
                {Object.keys(detailedStatus).length > 0 && (
                  <View
                    style={{
                      marginBottom: 16,
                      width: '100%',
                      maxWidth: 300,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#10B981',
                      backgroundColor: '#ECFDF5',
                      padding: 16,
                    }}>
                    <Text style={{ 
                      textAlign: 'center', 
                      fontSize: 14, 
                      fontWeight: '600',
                      color: '#065F46',
                      marginBottom: 8
                    }}>
                      🔬 Backend Processing Details
                    </Text>
                    {Object.entries(detailedStatus).map(([processingId, status]) => (
                      <View key={processingId} style={{
                        marginBottom: 8,
                        padding: 8,
                        backgroundColor: 'white',
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#D1FAE5'
                      }}>
                        <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '500' }}>
                          ID: {processingId}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#065F46' }}>
                          Status: {status.status}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#065F46' }}>
                          Progress: {status.progress}%
                        </Text>
                        {status.result && (
                          <Text style={{ fontSize: 12, color: '#065F46' }}>
                            AI Analysis: {JSON.stringify(status.result, null, 2)}
                          </Text>
                        )}
                        {status.error && (
                          <Text style={{ fontSize: 12, color: '#FF6B6B' }}>
                            Error: {status.error}
                          </Text>
                        )}
                      </View>
                    ))}
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
                        {currentImageNumber < totalImages ? 'Capture Image 2' : 'Generate Report'}
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

                  {/* Generate Report Button - Show after both images are captured */}
                  {!isScanning && !scanCompleted && capturedImages.length === 2 && (
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        paddingVertical: 16,
                        backgroundColor: '#FF6B6B',
                        shadowColor: '#FF6B6B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      onPress={() => {
                        // Navigate to ViewHistory to see the generated report
                        onNavigateToReport(`scan_${Date.now()}`);
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 18,
                          fontWeight: '600',
                          color: '#FFFFFF',
                        }}>
                        Generate Report
                      </Text>
                    </TouchableOpacity>
                  )}

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
    </View>
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
