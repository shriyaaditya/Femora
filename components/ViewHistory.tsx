import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import BottomBar from './BottomBar';
import Navbar from './Navbar';

interface ViewHistoryProps {
  onNavigateToHome: () => void;
  onNavigateToUserProfile: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToScanReport?: (scanId: string) => void;
}

interface ScanResult {
  id: string;
  date: string;
  time: string;
  status: 'completed' | 'processing' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  imageCount: number;
  recommendations: string[];
}

const ViewHistory: React.FC<ViewHistoryProps> = ({
  onNavigateToHome,
  onNavigateToUserProfile,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToScan,
  onNavigateToScanReport,
}) => {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Mock data for scan history - replace with actual data from storage/API
  const scanHistory: ScanResult[] = [
    {
      id: 'scan_001',
      date: '25 Nov 2025',
      time: '2:30 PM',
      status: 'completed',
      riskLevel: 'low',
      summary: 'No abnormalities detected. All scans show normal breast tissue.',
      imageCount: 2,
      recommendations: ['Continue monthly self-examinations', 'Schedule next scan in 6 months']
    },
    {
      id: 'scan_002',
      date: '20 Nov 2025',
      time: '11:15 AM',
      status: 'completed',
      riskLevel: 'medium',
      summary: 'Minor tissue variations observed. Follow-up recommended.',
      imageCount: 2,
      recommendations: ['Schedule follow-up in 3 months', 'Monitor for any changes']
    },
    {
      id: 'scan_003',
      date: '15 Nov 2025',
      time: '4:45 PM',
      status: 'completed',
      riskLevel: 'low',
      summary: 'Normal scan results. Tissue appears healthy.',
      imageCount: 2,
      recommendations: ['Continue regular check-ups', 'Maintain healthy lifestyle']
    },
    {
      id: 'scan_004',
      date: '10 Nov 2025',
      time: '9:20 AM',
      status: 'completed',
      riskLevel: 'low',
      summary: 'Clear scan with no concerns detected.',
      imageCount: 2,
      recommendations: ['Regular monthly self-exams', 'Next scan in 6 months']
    },
    {
      id: 'scan_005',
      date: '05 Nov 2025',
      time: '3:10 PM',
      status: 'completed',
      riskLevel: 'low',
      summary: 'Normal breast tissue appearance. No abnormalities found.',
      imageCount: 2,
      recommendations: ['Continue routine screenings', 'Maintain current health practices']
    }
  ];

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const itemHeight = 280; // Approximate height of each timeline item
    const newIndex = Math.floor(scrollY / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < scanHistory.length) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToItem = (index: number) => {
    const itemHeight = 280;
    scrollViewRef.current?.scrollTo({
      y: index * itemHeight,
      animated: true,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Navbar title="Scan History" onBack={onNavigateToHome} />

      {/* User Info */}
      <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#2D1B3D', marginBottom: 4 }}>
          {user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280' }}>
          {scanHistory.length} scans completed • Last scan: {scanHistory[0]?.date}
        </Text>
      </View>

      {/* Timeline Navigation Dots */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        {scanHistory.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToItem(index)}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: index === activeIndex ? '#f9d4f4' : '#D1D5DB',
              marginHorizontal: 6,
              borderWidth: index === activeIndex ? 2 : 0,
              borderColor: '#333333',
            }}
          />
        ))}
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {scanHistory.map((scan, index) => (
          <View key={scan.id} style={{ marginBottom: 40 }}>
            {/* Timeline Item */}
            <View style={{ flexDirection: 'row' }}>
              {/* Left: Timeline Line & Dot */}
              <View style={{ alignItems: 'center', marginRight: 20 }}>
                {/* Timeline Dot */}
                                 <View style={{
                   width: 20,
                   height: 20,
                   borderRadius: 10,
                   backgroundColor: index === activeIndex ? '#f29de5' : '#D1D5DB',
                   borderWidth: 3,
                   borderColor: '#FFFFFF',
                   shadowColor: index === activeIndex ? '#f29de5' : '#000000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: index === activeIndex ? 0.3 : 0.1,
                   shadowRadius: 4,
                   elevation: index === activeIndex ? 6 : 2,
                   zIndex: 1,
                 }} />
                
                {/* Timeline Line */}
                {index < scanHistory.length - 1 && (
                  <View style={{
                    width: 2,
                    height: 240,
                    backgroundColor: index === activeIndex ? '#f29de5' : '#E5E7EB',
                    marginTop: 10,
                  }} />
                )}
              </View>

              {/* Right: Content Card */}
              <View style={{ flex: 1 }}>
                <View style={{
                  backgroundColor: index === activeIndex ? '#F8FAFC' : '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: index === activeIndex ? '#f9d4f4' : '#E5E7EB',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}>
                  {/* Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View>
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: '700', 
                        color: '#2D1B3D',
                        marginBottom: 4
                      }}>
                        {scan.date}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        {scan.time} • {scan.imageCount} images
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>
                        {getStatusIcon(scan.status)}
                      </Text>
                      <View style={{
                        backgroundColor: getRiskLevelColor(scan.riskLevel),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
                          {getRiskLevelText(scan.riskLevel)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Summary */}
                  <Text style={{ 
                    fontSize: 16, 
                    color: '#374151', 
                    lineHeight: 24,
                    marginBottom: 16
                  }}>
                    {scan.summary}
                  </Text>

                  {/* Recommendations */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: '#2D1B3D',
                      marginBottom: 8
                    }}>
                      Recommendations:
                    </Text>
                    {scan.recommendations.map((rec, recIndex) => (
                      <View key={recIndex} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: '#f9d4f4', marginRight: 8 }}>•</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>{rec}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: index === activeIndex ? '#F7ECFD' : '#F3F4F6',
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderRadius: 25,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#333333',

                    }}
                    onPress={() => {
                      // Navigate to detailed report view
                      onNavigateToScanReport?.(scan.id);
                    }}>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: index === activeIndex ? '#333333' : '#6B7280'
                    }}>
                      View Full Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
        
        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={onNavigateToUserProfile}
        activeTab="home"
      />
    </View>
  );
};

export default ViewHistory;
