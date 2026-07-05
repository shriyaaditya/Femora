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
import { useAuth } from '../contexts/AuthContext';

interface ScanReportProps {
  scanId: string;
  onNavigateToHome: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToUserProfile?: () => void;
  onNavigateToReport?: (scanId: string) => void;
}

interface ReportData {
  patientInfo: {
    name: string;
    patientId: string;
    ageSex: string;
    dateOfReport: string;
    referringPhysician: string;
  };
  clinicalHistory: {
    familyHistory: string;
    ageAtMenarche: string;
    ageAtFirstPregnancy: string;
    breastfeedingHistory: string;
    menopauseStatus: string;
    hormonalTherapy: string;
    pastBiopsy: string;
    lifestyleFactors: string;
  };
  reportedSymptoms: {
    lump: string;
    painTenderness: string;
    nippleDischarge: string;
    nippleSkinChanges: string;
    axillarySwelling: string;
  };
  aiRiskAssessment: {
    riskScore: number;
    riskCategory: 'Low' | 'Moderate' | 'High';
    contributingFactors: string[];
  };
  impression: string;
}

const { width: screenWidth } = Dimensions.get('window');

const ScanReport: React.FC<ScanReportProps> = ({
  scanId,
  onNavigateToHome,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToUserProfile,
  onNavigateToReport,
}) => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading report data
    setTimeout(() => {
      // Mock report data - in real app, this would come from backend
      const mockReport: ReportData = {
        patientInfo: {
          name: user?.email?.split('@')[0] || 'Patient',
          patientId: `PID-${Date.now()}`,
          ageSex: '32 / Female',
          dateOfReport: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          referringPhysician: 'Dr. Sarah Johnson, MD'
        },
        clinicalHistory: {
          familyHistory: 'No family history of breast/ovarian cancer',
          ageAtMenarche: '13 years',
          ageAtFirstPregnancy: '28 years',
          breastfeedingHistory: 'Breastfed for 12 months',
          menopauseStatus: 'Pre-menopausal',
          hormonalTherapy: 'No current hormonal therapy',
          pastBiopsy: 'No previous breast biopsies',
          lifestyleFactors: 'Non-smoker, moderate alcohol consumption, regular exercise'
        },
        reportedSymptoms: {
          lump: 'No palpable lumps detected',
          painTenderness: 'Mild tenderness reported',
          nippleDischarge: 'No nipple discharge',
          nippleSkinChanges: 'No changes in nipple or skin',
          axillarySwelling: 'No axillary or collarbone swelling'
        },
        aiRiskAssessment: {
          riskScore: 23,
          riskCategory: 'Low',
          contributingFactors: [
            'Young age (32 years)',
            'No family history of breast cancer',
            'Regular exercise and healthy lifestyle',
            'Early pregnancy and breastfeeding history'
          ]
        },
        impression: 'Based on the comprehensive assessment including clinical history, reported symptoms, and AI analysis of breast images, the overall risk assessment indicates a LOW RISK profile. The combination of young age, absence of family history, healthy lifestyle factors, and normal imaging findings supports this assessment. Regular self-examinations and routine screening as per standard guidelines are recommended.'
      };
      
      setReportData(mockReport);
      setIsLoading(false);
    }, 1500);
  }, [user]);

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'Low': return '#10B981';
      case 'Moderate': return '#F59E0B';
      case 'High': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskCategoryBackground = (category: string) => {
    switch (category) {
      case 'Low': return '#ECFDF5';
      case 'Moderate': return '#FFFBEB';
      case 'High': return '#FEF2F2';
      default: return '#F3F4F6';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar title="Generating Report..." onBack={onNavigateToHome} />
        <View style={styles.loadingContainer}>
          <Ionicons name="medical" size={64} color="#8B5CF6" />
          <Text style={styles.loadingTitle}>Generating Your Report</Text>
          <Text style={styles.loadingSubtitle}>
            Analyzing your breast health data and generating comprehensive risk assessment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reportData) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar title="Report Error" onBack={onNavigateToHome} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Generate Report</Text>
          <Text style={styles.errorSubtitle}>
            There was an error processing your scan data. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Navbar title="Breast Health Report" onBack={onNavigateToHome} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Report Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Femora - Breast Health Risk Assessment Report</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Analysis & Clinical Assessment</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{reportData.patientInfo.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient ID:</Text>
              <Text style={styles.infoValue}>{reportData.patientInfo.patientId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age / Sex:</Text>
              <Text style={styles.infoValue}>{reportData.patientInfo.ageSex}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Report:</Text>
              <Text style={styles.infoValue}>{reportData.patientInfo.dateOfReport}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Referring Physician:</Text>
              <Text style={styles.infoValue}>{reportData.patientInfo.referringPhysician}</Text>
            </View>
          </View>
        </View>

        {/* Clinical History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical History (from Questionnaire)</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family History:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.familyHistory}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age at Menarche:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.ageAtMenarche}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age at First Pregnancy:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.ageAtFirstPregnancy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Breastfeeding History:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.breastfeedingHistory}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Menopause Status:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.menopauseStatus}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hormonal Therapy:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.hormonalTherapy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Past Biopsy/Surgery:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.pastBiopsy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lifestyle Factors:</Text>
              <Text style={styles.infoValue}>{reportData.clinicalHistory.lifestyleFactors}</Text>
            </View>
          </View>
        </View>

        {/* Reported Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reported Symptoms</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lump:</Text>
              <Text style={styles.infoValue}>{reportData.reportedSymptoms.lump}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pain/Tenderness:</Text>
              <Text style={styles.infoValue}>{reportData.reportedSymptoms.painTenderness}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nipple Discharge:</Text>
              <Text style={styles.infoValue}>{reportData.reportedSymptoms.nippleDischarge}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nipple/Skin Changes:</Text>
              <Text style={styles.infoValue}>{reportData.reportedSymptoms.nippleSkinChanges}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Axillary/Collarbone Swelling:</Text>
              <Text style={styles.infoValue}>{reportData.reportedSymptoms.axillarySwelling}</Text>
            </View>
          </View>
        </View>

        {/* AI Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Femora AI Risk Assessment</Text>
          <View style={styles.riskContainer}>
            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScoreLabel}>Risk Score:</Text>
              <Text style={styles.riskScoreValue}>{reportData.aiRiskAssessment.riskScore}%</Text>
            </View>
            
            <View style={styles.riskCategoryContainer}>
              <Text style={styles.riskCategoryLabel}>Risk Category:</Text>
              <View style={[
                styles.riskCategoryBadge,
                {
                  backgroundColor: getRiskCategoryBackground(reportData.aiRiskAssessment.riskCategory),
                  borderColor: getRiskCategoryColor(reportData.aiRiskAssessment.riskCategory)
                }
              ]}>
                <Text style={[
                  styles.riskCategoryText,
                  { color: getRiskCategoryColor(reportData.aiRiskAssessment.riskCategory) }
                ]}>
                  {reportData.aiRiskAssessment.riskCategory}
                </Text>
              </View>
            </View>

            <View style={styles.contributingFactorsContainer}>
              <Text style={styles.contributingFactorsLabel}>Contributing Factors Identified:</Text>
              {reportData.aiRiskAssessment.contributingFactors.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <Text style={styles.factorBullet}>•</Text>
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Impression */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impression</Text>
          <Text style={styles.impressionText}>{reportData.impression}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigateToReport?.(scanId)}>
            <Text style={styles.primaryButtonText}>Save Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onNavigateToHome}>
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D1B3D',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1B3D',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: screenWidth * 0.35,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  riskContainer: {
    gap: 20,
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  riskScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  riskScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
  },
  riskCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riskCategoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  riskCategoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  riskCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contributingFactorsContainer: {
    gap: 8,
  },
  contributingFactorsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  factorBullet: {
    fontSize: 16,
    color: '#8B5CF6',
    marginRight: 8,
    marginTop: 2,
  },
  factorText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  impressionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'justify',
  },
  actionButtons: {
    padding: 24,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1B3D',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1B3D',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ScanReport;
