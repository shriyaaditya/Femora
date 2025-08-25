import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

interface ScanResultsProps {
  scanId: string;
  onNavigateToHome: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToUserProfile?: () => void;
}

interface ScanData {
  id: string;
  date: Date;
  status: 'normal' | 'abnormal' | 'inconclusive';
  confidence: number;
  findings: string[];
  recommendations: string[];
}

const ScanResults: React.FC<ScanResultsProps> = ({
  scanId,
  onNavigateToHome,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToUserProfile,
}) => {
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from your backend
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setScanData({
        id: scanId,
        date: new Date(),
        status: 'normal',
        confidence: 94,
        findings: [
          'No suspicious masses detected',
          'Tissue density appears normal',
          'No calcifications observed',
          'Symmetrical breast tissue distribution',
        ],
        recommendations: [
          'Continue regular self-examinations',
          'Schedule next screening as recommended by your doctor',
          'Maintain healthy lifestyle habits',
        ],
      });
      setLoading(false);
    }, 1000);
  }, [scanId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#4CAF50';
      case 'abnormal':
        return '#F44336';
      case 'inconclusive':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return 'checkmark-circle';
      case 'abnormal':
        return 'alert-circle';
      case 'inconclusive':
        return 'help-circle';
      default:
        return 'information-circle';
    }
  };

  const renderScanSummary = () => {
    if (!scanData) return null;

    return (
      <View style={styles.summaryCard}>
        {/* Main Circular Health Status */}
        <View style={styles.healthCircleContainer}>
          <View style={[styles.healthCircle, { borderColor: getStatusColor(scanData.status) }]}>
            <Text style={styles.healthPercentage}>{scanData.confidence}%</Text>
            <Text style={styles.healthLabel}>Health Score</Text>
            <View style={styles.statusIndicator}>
              <Ionicons
                name={getStatusIcon(scanData.status) as any}
                size={20}
                color={getStatusColor(scanData.status)}
              />
              <Text style={[styles.statusText, { color: getStatusColor(scanData.status) }]}>
                {scanData.status.charAt(0).toUpperCase() + scanData.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Date and Scan Info */}
        <View style={styles.dateInfoContainer}>
          <Text style={styles.dateText}>
            {scanData.date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.scanTypeText}>Breast Health Scan</Text>
        </View>
      </View>
    );
  };

  const renderFindings = () => {
    if (!scanData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan Insights</Text>
        <Text style={styles.sectionSubtitle}>Updated today</Text>

        {/* Visual Findings Chart */}
        <View style={styles.findingsChart}>
          {scanData.findings.map((finding, index) => (
            <View key={index} style={styles.findingBar}>
              <View style={[styles.findingBarFill, { width: `${85 - index * 10}%` }]} />
              <View style={styles.findingItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.findingText}>{finding}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!scanData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Recommendations</Text>
        <View style={styles.recommendationsContainer}>
          {scanData.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationIcon}>
                <Ionicons name="arrow-forward-circle" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderHealthTips = () => {
    const healthTips = [
      {
        title: 'Regular Self-Examination',
        description: 'Perform monthly self-exams to become familiar with your breast tissue',
        icon: 'hand-left',
        color: '#4CAF50',
      },
      {
        title: 'Healthy Diet',
        description: 'Include plenty of fruits, vegetables, and whole grains in your diet',
        icon: 'nutrition',
        color: '#FF9800',
      },
      {
        title: 'Regular Exercise',
        description: 'Aim for at least 150 minutes of moderate exercise per week',
        icon: 'fitness',
        color: '#2196F3',
      },
      {
        title: 'Limit Alcohol',
        description: 'Keep alcohol consumption to moderate levels',
        icon: 'wine',
        color: '#9C27B0',
      },
      {
        title: 'Maintain Healthy Weight',
        description: 'Stay within a healthy BMI range for your height',
        icon: 'scale',
        color: '#607D8B',
      },
      {
        title: 'Regular Check-ups',
        description: 'Visit your healthcare provider for routine screenings',
        icon: 'medical',
        color: '#E91E63',
      },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Breast Health Tips</Text>
        <Text style={styles.sectionSubtitle}>Keep your health in check</Text>
        <View style={styles.tipsContainer}>
          {healthTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
                <Ionicons name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Navbar title="Scan Results" onBack={onNavigateToHome} />
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading scan results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Navbar title="Scan Results" onBack={onNavigateToHome} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderScanSummary()}
        {renderFindings()}
        {renderRecommendations()}
        {renderHealthTips()}
      </ScrollView>

      <BottomBar
        onScanPress={() => {}}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={onNavigateToUserProfile}
        activeTab="home"
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  healthCircleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  healthCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  healthPercentage: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateInfoContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scanTypeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  findingsChart: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  findingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  findingBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  findingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  recommendationIcon: {
    marginRight: 12,
  },
});

export default ScanResults;
