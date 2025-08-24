import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { UserService, ScanSession } from '../services/userService';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

interface ScanReportProps {
  scanId: string;
  onNavigateToHome: () => void;
  onNavigateToUserProfile: () => void;
}

const ScanReport: React.FC<ScanReportProps> = ({ scanId, onNavigateToHome, onNavigateToUserProfile }) => {
  const { user } = useAuth();
  const [scanData, setScanData] = useState<ScanSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScanData = async () => {
      if (user && scanId) {
        try {
          const userService = UserService.getInstance();
          const scan = await userService.getScanSession(user.uid, scanId);
          setScanData(scan);
        } catch (error) {
          console.error('Error loading scan data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadScanData();
  }, [user, scanId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Navbar title="Scan Report" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading scan report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!scanData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Navbar title="Scan Report" />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-gray-600 text-center">Scan report not found</Text>
          <TouchableOpacity
            onPress={onNavigateToHome}
            className="mt-4 bg-femora-pink px-6 py-3 rounded-full">
            <Text className="text-white font-semibold">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Navbar title="Scan Report" />
      
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Scan Summary */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-2">Scan Summary</Text>
          <View className="space-y-2">
            <Text className="text-gray-700">Type: {scanData.scanType}</Text>
            <Text className="text-gray-700">Status: {scanData.status}</Text>
            <Text className="text-gray-700">
              Date: {scanData.scanTime?.toLocaleDateString() || 'N/A'}
            </Text>
            <Text className="text-gray-700">Images: {scanData.images?.length || 0}</Text>
          </View>
        </View>

        {/* Analysis Results */}
        {scanData.analysisResults && (
          <View className="bg-blue-50 rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold mb-2">Analysis Results</Text>
            <View className="space-y-2">
              <Text className="text-gray-700">
                <Text className="font-medium">Findings:</Text> {scanData.analysisResults.findings}
              </Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Confidence:</Text> {scanData.analysisResults.confidence}%
              </Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Risk Level:</Text> {scanData.analysisResults.riskLevel}
              </Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Recommendation:</Text> {scanData.analysisResults.recommendation}
              </Text>
            </View>
          </View>
        )}

        {/* Processing Details */}
        {scanData.processingStatus && (
          <View className="bg-green-50 rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold mb-2">Processing Details</Text>
            <View className="space-y-2">
              <Text className="text-gray-700">
                <Text className="font-medium">Status:</Text> {scanData.processingStatus.status}
              </Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Progress:</Text> {scanData.processingStatus.progress}%
              </Text>
              {scanData.processingStatus.error && (
                <Text className="text-red-600">
                  <Text className="font-medium">Error:</Text> {scanData.processingStatus.error}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Backend Information */}
        <View className="bg-purple-50 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-2">Technical Details</Text>
          <View className="space-y-2">
            <Text className="text-gray-700">
              <Text className="font-medium">Backend:</Text> {scanData.backendUsed || 'Unknown'}
            </Text>
            <Text className="text-gray-700">
              <Text className="font-medium">Analysis ID:</Text> {scanData.analysisResults?.analysisId || 'N/A'}
            </Text>
            <Text className="text-gray-700">
              <Text className="font-medium">Scan Time:</Text> {scanData.scanTime?.toLocaleDateString() || 'N/A'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomBar
        onScanPress={() => {}} // Scan is not active here
        onHomePress={onNavigateToHome}
        onProfilePress={onNavigateToUserProfile}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

export default ScanReport;
