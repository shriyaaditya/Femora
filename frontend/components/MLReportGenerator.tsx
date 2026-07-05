import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

interface MLReportGeneratorProps {
  scanId: string;
  onNavigateToHome: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAskMora?: () => void;
  onNavigateToUserProfile?: () => void;
  onNavigateToReport?: (scanId: string) => void;
}

interface MLModelConfig {
  modelName: string;
  version: string;
  confidence: number;
  processingTime: number;
}

interface ReportSection {
  title: string;
  content: string;
  confidence: number;
  type: 'finding' | 'recommendation' | 'risk-assessment' | 'comparison';
}

const MLReportGenerator: React.FC<MLReportGeneratorProps> = ({
  scanId,
  onNavigateToHome,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToUserProfile,
  onNavigateToReport,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [mlModelConfig, setMlModelConfig] = useState<MLModelConfig | null>(null);
  const [reportSections, setReportSections] = useState<ReportSection[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize ML model configuration
    setMlModelConfig({
      modelName: 'BreastHealthAI-v2.1',
      version: '2.1.0',
      confidence: 0.94,
      processingTime: 0,
    });
  }, []);

  const startMLReportGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setReportSections([]);

    try {
      // Step 1: Initialize ML Model
      setCurrentStep('Initializing ML model...');
      setGenerationProgress(10);
      await simulateProcessing(1000);

      // Step 2: Loading and preprocessing images
      setCurrentStep('Loading and preprocessing images...');
      setGenerationProgress(25);
      await simulateProcessing(1500);

      // Step 3: Feature extraction
      setCurrentStep('Extracting image features...');
      setGenerationProgress(45);
      await simulateProcessing(2000);

      // Step 4: AI analysis
      setCurrentStep('Performing AI analysis...');
      setGenerationProgress(70);
      await simulateProcessing(2500);

      // Step 5: Report generation
      setCurrentStep('Generating comprehensive report...');
      setGenerationProgress(90);
      await simulateProcessing(1500);

      // Step 6: Finalize
      setCurrentStep('Finalizing report...');
      setGenerationProgress(100);
      await simulateProcessing(500);

      // Generate mock report sections
      const mockSections: ReportSection[] = [
        {
          title: 'Tissue Density Analysis',
          content: 'AI analysis indicates normal tissue density distribution with no concerning patterns detected. The tissue appears homogeneous and well-structured.',
          confidence: 0.96,
          type: 'finding',
        },
        {
          title: 'Mass Detection Results',
          content: 'No suspicious masses or lesions were identified in the analyzed images. All detected structures appear benign and within normal parameters.',
          confidence: 0.93,
          type: 'finding',
        },
        {
          title: 'Calcification Assessment',
          content: 'No microcalcifications or concerning calcification patterns were observed. The breast tissue shows normal mineralization.',
          confidence: 0.95,
          type: 'finding',
        },
        {
          title: 'Symmetry Analysis',
          content: 'Bilateral breast tissue demonstrates good symmetry with no significant asymmetrical findings that would warrant concern.',
          confidence: 0.91,
          type: 'finding',
        },
        {
          title: 'Risk Assessment',
          content: 'Based on AI analysis, your current breast health assessment indicates a low-risk profile. Continue with regular screening as recommended.',
          confidence: 0.89,
          type: 'risk-assessment',
        },
        {
          title: 'Follow-up Recommendations',
          content: 'Schedule your next routine screening in 12 months. Maintain regular self-examinations and report any changes to your healthcare provider.',
          confidence: 0.87,
          type: 'recommendation',
        },
        {
          title: 'Lifestyle Factors',
          content: 'Your current lifestyle factors appear to support good breast health. Continue maintaining a balanced diet and regular exercise routine.',
          confidence: 0.85,
          type: 'recommendation',
        },
      ];

      setReportSections(mockSections);
      setGenerationComplete(true);
      setIsGenerating(false);

      // Update processing time
      if (mlModelConfig) {
        setMlModelConfig(prev => prev ? { ...prev, processingTime: 7.5 } : null);
      }

    } catch {
      setError('Failed to generate ML report. Please try again.');
      setIsGenerating(false);
    }
  };

  const simulateProcessing = (duration: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#4CAF50';
    if (confidence >= 0.8) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Moderate';
    return 'Low';
  };

  const renderGenerationProgress = () => {
    if (!isGenerating) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Ionicons name="analytics" size={24} color="#8B5CF6" />
          <Text style={styles.progressTitle}>ML Report Generation</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${generationProgress}%` }]} />
        </View>
        
        <Text style={styles.progressText}>{generationProgress}% Complete</Text>
        <Text style={styles.currentStep}>{currentStep}</Text>
        
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loadingIndicator} />
      </View>
    );
  };

  const renderMLModelInfo = () => {
    if (!mlModelConfig) return null;

    return (
      <View style={styles.modelInfoCard}>
        <View style={styles.modelHeader}>
          <Ionicons name="hardware-chip" size={24} color="#8B5CF6" />
          <Text style={styles.modelTitle}>AI Model Information</Text>
        </View>
        
        <View style={styles.modelDetails}>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Model:</Text>
            <Text style={styles.modelValue}>{mlModelConfig.modelName}</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Version:</Text>
            <Text style={styles.modelValue}>{mlModelConfig.version}</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Confidence:</Text>
            <Text style={styles.modelValue}>{(mlModelConfig.confidence * 100).toFixed(1)}%</Text>
          </View>
          {mlModelConfig.processingTime > 0 && (
            <View style={styles.modelRow}>
              <Text style={styles.modelLabel}>Processing Time:</Text>
              <Text style={styles.modelValue}>{mlModelConfig.processingTime}s</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderReportSections = () => {
    if (reportSections.length === 0) return null;

    return (
      <View style={styles.sectionsContainer}>
        <Text style={styles.sectionsTitle}>AI Analysis Results</Text>
        
        {reportSections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={[styles.confidenceText, { color: getConfidenceColor(section.confidence) }]}>
                  {(section.confidence * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.confidenceLabel, { color: getConfidenceColor(section.confidence) }]}>
                  {getConfidenceLabel(section.confidence)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.sectionContent}>{section.content}</Text>
            
            <View style={styles.sectionType}>
              <Ionicons 
                name={getSectionIcon(section.type)} 
                size={16} 
                color="#8B5CF6" 
              />
              <Text style={styles.sectionTypeText}>
                {section.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'finding': return 'search';
      case 'recommendation': return 'bulb';
      case 'risk-assessment': return 'shield-checkmark';
      case 'comparison': return 'git-compare';
      default: return 'information-circle';
    }
  };

  const handleViewFullReport = () => {
    if (onNavigateToReport) {
      onNavigateToReport(scanId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar title="ML Report Generator" onBack={onNavigateToHome} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI-Powered Breast Health Analysis</Text>
          <Text style={styles.headerSubtitle}>
            Advanced machine learning analysis of your breast scan images
          </Text>
        </View>

        {/* ML Model Information */}
        {renderMLModelInfo()}

        {/* Generation Progress */}
        {renderGenerationProgress()}

        {/* Action Buttons */}
        {!isGenerating && !generationComplete && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={startMLReportGeneration}
              disabled={isGenerating}>
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.generateButtonText}>Generate ML Report</Text>
            </TouchableOpacity>
            
            <Text style={styles.generateInfo}>
              This will analyze your captured images using advanced AI algorithms to provide comprehensive health insights.
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={startMLReportGeneration}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Report Sections */}
        {renderReportSections()}

        {/* Completion Actions */}
        {generationComplete && (
          <View style={styles.completionContainer}>
            <View style={styles.successMessage}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successTitle}>Report Generated Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Your AI-powered breast health analysis is complete.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.viewReportButton}
              onPress={handleViewFullReport}>
              <Text style={styles.viewReportButtonText}>View Full Report</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modelInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  modelDetails: {
    gap: 12,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modelValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentStep: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  generateInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionsContainer: {
    marginBottom: 24,
  },
  sectionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  confidenceBadge: {
    alignItems: 'center',
    minWidth: 60,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTypeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  viewReportButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  viewReportButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
});

export default MLReportGenerator;
