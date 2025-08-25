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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import { useAuth } from '../contexts/AuthContext';

interface CalendarProps {
  onNavigateToHome: () => void;
  onNavigateToUserProfile: () => void;
  onNavigateToReport: (scanId: string) => void;
  onNavigateToAskMora?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToScanResults?: (scanId: string) => void;
}

interface ScanRecord {
  id: string;
  date: Date;
  status: 'completed' | 'pending';
  hasReport: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  onNavigateToHome,
  onNavigateToUserProfile,
  onNavigateToReport,
  onNavigateToAskMora,
  onNavigateToScan,
  onNavigateToScanResults,
}) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthView, setIsMonthView] = useState(true);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([
    {
      id: '1',
      date: new Date(2024, 0, 15),
      status: 'completed',
      hasReport: true,
    },
    {
      id: '2',
      date: new Date(2024, 0, 20),
      status: 'completed',
      hasReport: true,
    },
    {
      id: '3',
      date: new Date(2024, 0, 25),
      status: 'pending',
      hasReport: false,
    },
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const hasScanOnDate = (date: Date) => {
    return scanHistory.some(
      (scan) =>
        scan.date.getDate() === date.getDate() &&
        scan.date.getMonth() === date.getMonth() &&
        scan.date.getFullYear() === date.getFullYear()
    );
  };

  const getScanForDate = (date: Date) => {
    return scanHistory.find(
      (scan) =>
        scan.date.getDate() === date.getDate() &&
        scan.date.getMonth() === date.getMonth() &&
        scan.date.getFullYear() === date.getFullYear()
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.monthViewContainer}>
        {/* Month Navigation Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>{getMonthName(currentMonth)}</Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Week Days Header */}
        <View style={styles.weekDaysHeader}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayHeader}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => (
            <View key={index} style={styles.calendarDay}>
              {day ? (
                <TouchableOpacity
                  style={[
                    styles.dayButton,
                    selectedDate.getDate() === day.getDate() &&
                      selectedDate.getMonth() === day.getMonth() &&
                      selectedDate.getFullYear() === day.getFullYear() &&
                      styles.selectedDay,
                  ]}
                  onPress={() => setSelectedDate(day)}>
                  <Text
                    style={[
                      styles.dayText,
                      selectedDate.getDate() === day.getDate() &&
                        selectedDate.getMonth() === day.getMonth() &&
                        selectedDate.getFullYear() === day.getFullYear() &&
                        styles.selectedDayText,
                    ]}>
                    {day.getDate()}
                  </Text>
                  {hasScanOnDate(day) && (
                    <View
                      style={[
                        styles.scanDot,
                        getScanForDate(day)?.status === 'completed'
                          ? styles.completedDot
                          : styles.pendingDot,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyDay} />
              )}
            </View>
          ))}
        </View>

        {/* Selected Date Info */}
        {renderSelectedDateInfo()}
      </View>
    );
  };

  const renderDayView = () => {
    const scan = getScanForDate(selectedDate);
    const hasScan = !!scan;

    return (
      <View style={styles.dayViewContainer}>
        {/* Day Header */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </Text>
          <Text style={styles.daySubtitle}>
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Main Circular Health Display */}
        <View style={styles.healthCircleContainer}>
          <View style={styles.healthCircle}>
            {hasScan ? (
              <>
                <Text style={styles.healthDayText}>
                  Day {scan.status === 'completed' ? 'Completed' : 'Pending'}
                </Text>
                <Text style={styles.healthSubtext}>
                  {scan.status === 'completed' ? 'Scan completed' : 'Scan scheduled'}
                </Text>
                {scan.hasReport && (
                  <TouchableOpacity
                    style={styles.viewReportButton}
                    onPress={() =>
                      onNavigateToScanResults?.(scan.id) || onNavigateToReport(scan.id)
                    }>
                    <Text style={styles.viewReportText}>View Report</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text style={styles.healthDayText}>Day 1</Text>
                <Text style={styles.healthSubtext}>No scan scheduled</Text>
                <TouchableOpacity style={styles.scheduleScanButton} onPress={onNavigateToScan}>
                  <Text style={styles.scheduleScanText}>Schedule Scan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Action Cards - Only View Reports */}
        <View style={styles.actionCardsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigateToScanResults?.('new') || onNavigateToReport('new')}>
            <View style={styles.actionCardIcon}>
              <Ionicons name="document-text" size={32} color="#EC4899" />
            </View>
            <Text style={styles.actionCardTitle}>View Reports</Text>
            <Text style={styles.actionCardSubtitle}>Check previous scan results</Text>
          </TouchableOpacity>
        </View>

        {/* Health Tips for the Day */}
        <View style={styles.healthTipsSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Health Tip</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="heart" size={24} color="#EF4444" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Regular Self-Examination</Text>
              <Text style={styles.tipDescription}>
                Take a few minutes today to perform your monthly breast self-exam. This simple
                practice can help you become familiar with your breast tissue and detect any changes
                early.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSelectedDateInfo = () => {
    const scan = getScanForDate(selectedDate);

    return (
      <View style={styles.selectedDateInfo}>
        <Text style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        {scan ? (
          <View style={styles.scanInfo}>
            <View style={styles.scanStatus}>
              <View
                style={[
                  styles.statusDot,
                  scan.status === 'completed' ? styles.completedDot : styles.pendingDot,
                ]}
              />
              <Text style={styles.scanStatus}>
                Scan {scan.status === 'completed' ? 'Completed' : 'Pending'}
              </Text>
            </View>
            {scan.hasReport && (
              <TouchableOpacity
                style={styles.viewReportButton}
                onPress={() => onNavigateToScanResults?.(scan.id) || onNavigateToReport(scan.id)}>
                <Text style={styles.viewReportText}>View Report</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.noScanText}>No scan scheduled for this date</Text>
        )}
      </View>
    );
  };

  const renderScanHistory = () => {
    const sortedHistory = [...scanHistory].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
      <View style={styles.scanHistorySection}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {sortedHistory.map((scan) => (
          <TouchableOpacity
            key={scan.id}
            style={styles.scanHistoryItem}
            onPress={() => onNavigateToScanResults?.(scan.id) || onNavigateToReport(scan.id)}>
            <View style={styles.scanHistoryLeft}>
              <View
                style={[
                  styles.scanStatusDot,
                  scan.status === 'completed' ? styles.completedDot : styles.pendingDot,
                ]}
              />
              <View style={styles.scanHistoryText}>
                <Text style={styles.scanDate}>
                  {scan.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.scanStatusText}>
                  {scan.status === 'completed' ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
            <View style={styles.scanHistoryRight}>
              {scan.hasReport && (
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>Report</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Navbar
        title="Calendar"
        showLogo={false}
        rightAction={{
          label: 'Today',
          onPress: () => setSelectedDate(new Date()),
          style: 'secondary',
        }}
      />

      {/* Month/Day Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, isMonthView && styles.activeSegment]}
            onPress={() => setIsMonthView(true)}>
            <Text style={[styles.segmentText, isMonthView && styles.activeSegmentText]}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, !isMonthView && styles.activeSegment]}
            onPress={() => setIsMonthView(false)}>
            <Text style={[styles.segmentText, !isMonthView && styles.activeSegmentText]}>Day</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isMonthView ? renderMonthView() : renderDayView()}

        {/* Scan History - Only show in month view */}
        {isMonthView && renderScanHistory()}
      </ScrollView>

      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={() => {}}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={onNavigateToUserProfile}
        activeTab="calendar"
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
    paddingHorizontal: 24,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeToggleText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  monthViewContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedDay: {
    backgroundColor: '#FF66CC',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scanDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyDay: {
    width: '100%',
    height: '100%',
  },
  dayViewContainer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 24,
  },
  dayHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  daySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  healthCircleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  healthCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF66CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FF1493',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  healthDayText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  healthSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  scheduleScanButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#FF66CC',
  },
  scheduleScanText: {
    color: '#FF66CC',
    fontSize: 16,
    fontWeight: '600',
  },
  actionCardsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionCard: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  healthTipsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scanInfo: {
    gap: 12,
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  pendingDot: {
    backgroundColor: '#FF9800',
  },
  viewReportButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#FF66CC',
  },
  viewReportText: {
    color: '#FF66CC',
    fontSize: 16,
    fontWeight: '600',
  },
  noScanText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  scanHistorySection: {
    marginBottom: 100, // Space for bottom bar
  },
  scanHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scanHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scanHistoryText: {
    gap: 4,
  },
  scanDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scanStatusText: {
    fontSize: 14,
    color: '#666',
  },
  scanHistoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportBadge: {
    backgroundColor: '#FF66CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  segmentButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 80,
  },
  activeSegment: {
    backgroundColor: '#FF66CC',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeSegmentText: {
    color: '#FFFFFF',
  },
  selectedDateInfo: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
});

export default Calendar;
