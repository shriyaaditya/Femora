import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentProps {
  onNavigateToHome: () => void;
  onNavigateToUserProfile: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToAskMora: () => void;
  onNavigateToScan: () => void;
}

interface DayData {
  date: number;
  day: string;
  isAvailable: boolean;
  isBooked: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  image: string;
  isAvailable: boolean;
}

const Appointments: React.FC<AppointmentProps> = ({
  onNavigateToHome,
  onNavigateToUserProfile,
  onNavigateToCalendar,
  onNavigateToAskMora,
  onNavigateToScan,
}) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'search' | 'booking'>('search');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM - 12:00 PM');
  const [currentMonth, setCurrentMonth] = useState<string>('January 2023');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCalendarHint, setShowCalendarHint] = useState<boolean>(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Sample doctors data
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Breast Health Specialist',
      rating: 4.8,
      distance: '0.5 km',
      image: 'SJ',
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Oncologist',
      rating: 4.9,
      distance: '1.2 km',
      image: 'MC',
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Radiologist',
      rating: 4.7,
      distance: '0.8 km',
      image: 'ER',
      isAvailable: false,
    },
    {
      id: '4',
      name: 'Dr. David Kim',
      specialty: 'Surgeon',
      rating: 4.6,
      distance: '1.5 km',
      image: 'DK',
      isAvailable: true,
    },
    {
      id: '5',
      name: 'Dr. Lisa Thompson',
      specialty: 'Breast Health Specialist',
      rating: 4.9,
      distance: '0.3 km',
      image: 'LT',
      isAvailable: true,
    },
    {
      id: '6',
      name: 'Dr. James Wilson',
      specialty: 'Oncologist',
      rating: 4.7,
      distance: '1.8 km',
      image: 'JW',
      isAvailable: true,
    },
    {
      id: '7',
      name: 'Dr. Maria Garcia',
      specialty: 'Radiologist',
      rating: 4.8,
      distance: '0.9 km',
      image: 'MG',
      isAvailable: false,
    },
    {
      id: '8',
      name: 'Dr. Robert Brown',
      specialty: 'Surgeon',
      rating: 4.5,
      distance: '2.1 km',
      image: 'RB',
      isAvailable: true,
    },
    {
      id: '9',
      name: 'Dr. Jennifer Lee',
      specialty: 'Breast Health Specialist',
      rating: 4.9,
      distance: '0.7 km',
      image: 'JL',
      isAvailable: true,
    },
    {
      id: '10',
      name: 'Dr. Christopher Davis',
      specialty: 'Oncologist',
      rating: 4.6,
      distance: '1.4 km',
      image: 'CD',
      isAvailable: true,
    },
  ];

  // Sample calendar data for January 2023
  const calendarDays: DayData[] = [
    { date: 1, day: 'Sat', isAvailable: true, isBooked: false },
    { date: 2, day: 'Sun', isAvailable: true, isBooked: false },
    { date: 3, day: 'Mon', isAvailable: false, isBooked: true },
    { date: 4, day: 'Tue', isAvailable: true, isBooked: false },
    { date: 5, day: 'Wed', isAvailable: false, isBooked: true },
    { date: 6, day: 'Thu', isAvailable: true, isBooked: false },
    { date: 7, day: 'Fri', isAvailable: true, isBooked: false },
    { date: 8, day: 'Sat', isAvailable: true, isBooked: false },
    { date: 9, day: 'Sun', isAvailable: false, isBooked: true },
    { date: 10, day: 'Mon', isAvailable: true, isBooked: false },
    { date: 11, day: 'Tue', isAvailable: true, isBooked: false },
    { date: 12, day: 'Wed', isAvailable: true, isBooked: false },
    { date: 13, day: 'Thu', isAvailable: true, isBooked: false },
    { date: 14, day: 'Fri', isAvailable: true, isBooked: false },
    { date: 15, day: 'Sat', isAvailable: true, isBooked: false },
    { date: 16, day: 'Sun', isAvailable: true, isBooked: false },
    { date: 17, day: 'Mon', isAvailable: true, isBooked: false },
    { date: 18, day: 'Tue', isAvailable: true, isBooked: false },
    { date: 19, day: 'Wed', isAvailable: true, isBooked: false },
    { date: 20, day: 'Thu', isAvailable: true, isBooked: false },
    { date: 21, day: 'Fri', isAvailable: true, isBooked: false },
    { date: 22, day: 'Sat', isAvailable: true, isBooked: false },
    { date: 23, day: 'Sun', isAvailable: true, isBooked: false },
    { date: 24, day: 'Mon', isAvailable: true, isBooked: false },
    { date: 25, day: 'Tue', isAvailable: true, isBooked: false },
    { date: 26, day: 'Wed', isAvailable: true, isBooked: false },
    { date: 27, day: 'Thu', isAvailable: true, isBooked: false },
    { date: 28, day: 'Fri', isAvailable: true, isBooked: false },
    { date: 29, day: 'Sat', isAvailable: true, isBooked: false },
    { date: 30, day: 'Sun', isAvailable: true, isBooked: false },
    { date: 31, day: 'Mon', isAvailable: true, isBooked: false },
  ];

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('booking');
    setSelectedDate(null);
    setShowCalendarHint(true);
  };

  const handleDateSelect = (date: number) => {
    const dayData = calendarDays.find(day => day.date === date);
    if (dayData && dayData.isAvailable && !dayData.isBooked) {
      setSelectedDate(date);
      setShowCalendarHint(false);
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedDoctor) {
      console.log(`Booking appointment with ${selectedDoctor.name} for ${selectedDate} at ${selectedTime}`);
    }
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(currentScrollY);
    
    if (currentScrollY > 50 && showCalendarHint) {
      setShowCalendarHint(false);
    }
  };

  const renderDoctorCard = (doctor: Doctor) => (
    <TouchableOpacity
      key={doctor.id}
      onPress={() => handleDoctorSelect(doctor)}
      style={{
        backgroundColor: '#FFFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 4,
        shadowColor: '#F7ECFD',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#FFE5F0',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#F7ECFD',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
          borderWidth: 2,
          borderColor: '#333333',
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600',
            color: '#333333',
            letterSpacing: 1,
          }}>
            {doctor.image}
          </Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#000000',
            marginBottom: 4,
          }}>
            {doctor.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#000000',
            marginBottom: 4,
          }}>
            {doctor.specialty}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={{
              fontSize: 14,
              color: '#000000',
              marginLeft: 4,
              marginRight: 12,
            }}>
              {doctor.rating}
            </Text>
            <Ionicons name="location" size={16} color="#FFB6C1" />
            <Text style={{
              fontSize: 14,
              color: '#000000',
              marginLeft: 4,
            }}>
              {doctor.distance}
            </Text>
          </View>
        </View>
        
        <View style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: doctor.isAvailable ? '#E6F7FF' : '#FFE5E5',
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: doctor.isAvailable ? '#000000' : '#000000',
          }}>
            {doctor.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCalendarDay = (day: DayData) => {
    const isSelected = selectedDate === day.date;
    const isClickable = day.isAvailable && !day.isBooked;

    return (
      <TouchableOpacity
        key={day.date}
        onPress={() => handleDateSelect(day.date)}
        disabled={!isClickable}
        style={{
          width: 45,
          height: 60,
          borderRadius: 12,
          backgroundColor: day.isBooked 
            ? '#FFB6C1' 
            : isSelected 
              ? '#D9B9F8' 
              : '#FFFFFF',
          borderWidth: 2,
          borderColor: day.isBooked 
            ? '#FFB6C1' 
            : isSelected 
              ? '#D9B9F8' 
              : isClickable 
                ? '#FFE5F0' 
                : '#F0F0F0',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 4,
          shadowColor: isSelected ? '#D9B9F8' : '#FFB6C1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: isSelected ? 4 : 2,
        }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: day.isBooked || isSelected ? '#FFFFFF' : isClickable ? '#000000' : '#CCCCCC',
          marginBottom: 2,
        }}>
          {day.date}
        </Text>
        <Text style={{
          fontSize: 10,
          fontWeight: '500',
          color: day.isBooked || isSelected ? '#FFFFFF' : isClickable ? '#000000' : '#CCCCCC',
        }}>
          {day.day}
        </Text>
        {day.isBooked && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
          }} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchView = () => (
    <ScrollView 
      className="flex-1 px-4" 
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View className="items-center mb-6 mt-4">
        <Text className="text-2xl font-thin text-gray-500 mb-5 mt-6">
          Get Your Doctor
        </Text>
        <Text className="text-center text-black mb-2">
          Search for specialists near you and book appointments
        </Text>
      </View>

      {/* Search Bar */}
      <View className="mb-6">
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#FFE5F0',
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#FFB6C1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Ionicons name="search" size={20} color="#FFB6C1" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              marginBottom: 6,
              fontSize: 16,
              color: '#000000',
            }}
            placeholder="Search doctors, specialties..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Doctors List */}
      <View className="mb-6">
        <Text className="text-lg font-thin text-black mb-5">
          Available Doctors ({filteredDoctors.length})
        </Text>
        {filteredDoctors.map(renderDoctorCard)}
      </View>
    </ScrollView>
  );

  const renderBookingView = () => (
    <View style={{ flex: 1 }}>
      {/* Scroll Up Hint - Fixed at top */}
      {showCalendarHint && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(217, 185, 248, 0.9)',
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="chevron-up" size={16} color="#000000" />
          <Text style={{
            color: '#000000',
            fontSize: 14,
            fontWeight: '500',
            marginLeft: 4,
          }}>
            Scroll up to select a date
          </Text>
          <Ionicons name="chevron-up" size={16} color="#000000" />
        </Animated.View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: showCalendarHint ? 40 : 0 }}>
        
        {/* Calendar Section - At the top for scroll up */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 20,
          backgroundColor: '#FAFAFA',
          borderBottomWidth: 1,
          borderBottomColor: '#FFE5F0',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#000000',
              textAlign: 'center',
            }}>
              Select Your Appointment Date
            </Text>
          </View>
          
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#000000',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            {currentMonth}
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            paddingHorizontal: 10,
          }}>
            {calendarDays.map(renderCalendarDay)}
          </View>
          
          {selectedDate && (
            <View style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#D9B9F8',
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Selected: {currentMonth.split(' ')[0]} {selectedDate}, {currentMonth.split(' ')[1]}
              </Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => setCurrentView('search')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
            }}>
            <Ionicons name="arrow-back" size={24} color="#D9B9F8" />
            <Text style={{
              marginLeft: 8,
              fontSize: 16,
              fontWeight: '600',
              color: '#000000',
            }}>
              Back to Search
            </Text>
          </TouchableOpacity>

          {/* Doctor Profile Section */}
          <View style={{
            alignItems: 'center',
            marginBottom: 30,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            shadowColor: '#FFB6C1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
            borderWidth: 2,
            borderColor: '#333333',
          }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#F7ECFD',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 2,
              borderColor: '#333333',
            }}>
              <Text style={{ fontSize: 40, color: '#000000' }}>{selectedDoctor?.image}</Text>
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: '300',
              color: '#000000',
              marginBottom: 6,
              textAlign: 'center',
            }}>
              {selectedDoctor?.name}
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#000000',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              {selectedDoctor?.specialty}
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: '##F7ECFD',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={{
                fontSize: 16,
                color: '#000000',
                marginLeft: 4,
                marginRight: 16,
                fontWeight: '600',
              }}>
                {selectedDoctor?.rating}
              </Text>
              <Ionicons name="location" size={18} color="#333333" />
              <Text style={{
                fontSize: 16,
                color: '#000000',
                marginLeft: 4,
                fontWeight: '600',
              }}>
                {selectedDoctor?.distance}
              </Text>
            </View>
          </View>

          {/* Time Slot Selection */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#000000',
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Choose Your Time Slot
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 4 }}>
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleTimeSelect(time)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 25,
                      backgroundColor: selectedTime === time ? '#D9B9F8' : '#FFFFFF',
                      borderWidth: 2,
                      borderColor: selectedTime === time ? '#D9B9F8' : '#FFB6C1',
                      marginHorizontal: 6,
                      shadowColor: selectedTime === time ? '#D9B9F8' : '#FFB6C1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                    <Text style={{
                      color: selectedTime === time ? '#FFFFFF' : '#000000',
                      fontSize: 14,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Appointment Summary */}
          {selectedDate && (
            <View style={{
              backgroundColor: '#f7e8ea',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#333333',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#000000',
                marginBottom: 12,
                textAlign: 'center',
              }}>
                Appointment Summary
              </Text>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#000000', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '600' }}>Date:</Text> {currentMonth.split(' ')[0]} {selectedDate}, {currentMonth.split(' ')[1]}
                </Text>
                <Text style={{ fontSize: 16, color: '#000000', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '600' }}>Time:</Text> {selectedTime}
                </Text>
                <Text style={{ fontSize: 16, color: '#000000' }}>
                  <Text style={{ fontWeight: '600' }}>Doctor:</Text> {selectedDoctor?.name}
                </Text>
              </View>
            </View>
          )}

          {/* Book Appointment Button - Above Bottom Bar */}
          <TouchableOpacity
            onPress={handleBookAppointment}
            disabled={!selectedDate}
            style={{
              backgroundColor: selectedDate ? '#D9B9F8' : '#bf96ea',
              paddingVertical: 18,
              borderRadius: 16,
              marginBottom: 100, // Space for bottom bar
              shadowColor: selectedDate ? '#D9B9F8' : '#bf96ea',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: selectedDate ? 0.3 : 0,
              shadowRadius: 8,
              elevation: selectedDate ? 6 : 0,
            }}>
            <Text style={{
              color: selectedDate ? '#FFFFFF' : '#333333',
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
            }}>
              {selectedDate ? 'Confirm Appointment' : 'Please Select a Date First'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <Navbar
        title={currentView === 'search' ? 'Find Doctors' : 'Book Appointment'}
        onBack={onNavigateToHome}
      />

      {currentView === 'search' ? renderSearchView() : renderBookingView()}
      
      {/* Bottom Navigation Bar */}
      <BottomBar
        onScanPress={onNavigateToScan}
        onHomePress={onNavigateToHome}
        onCalendarPress={onNavigateToCalendar}
        onAIChatPress={onNavigateToAskMora}
        onDoctorPress={() => {
          // In appointments context, doctor icon toggles between search and booking views
          if (currentView === 'search') {
            // If we're in search view, doctor icon does nothing (already active)
            return;
          } else {
            // If we're in booking view, go back to search
            setCurrentView('search');
          }
        }}
        activeTab="doctor"
      />
    </SafeAreaView>
  );
};

export default Appointments;
