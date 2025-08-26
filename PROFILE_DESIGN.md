# Profile Page Design

## Overview
The profile page has been redesigned to match a modern, clean aesthetic with a wave-like header design and menu-style navigation options. The app now uses local storage instead of Firebase for data persistence.

## Design Features

### Header Section
- **Light Blue Background**: Uses `#87CEEB` color for the header
- **Wave-like Curve**: Smooth curved transition from header to content area
- **Back Button**: Left-aligned back arrow for navigation
- **Title**: "profile" text centered in the header

### Profile Picture Section
- **Circular Profile Picture**: 96x96px circular image with fallback icon
- **Camera Icon**: Small camera button overlay for changing profile picture
- **User Name**: Large, bold text displaying the user's name
- **View Full Profile Link**: Clickable text to access detailed profile information

### Menu Options
Each menu item is displayed as a card with:
- **Icons**: Ionicons for visual representation
- **Titles**: Clear, descriptive text
- **Shadows**: Subtle elevation for depth
- **Rounded Corners**: Modern 16px border radius

#### Menu Items
1. **Account Information** - User account details
2. **Password** - Password management
3. **Settings** - App preferences
4. **Help & Support** - Support and assistance
5. **Log out** - Sign out (highlighted in red)

## Data Integration

### Local Storage Data Source
The profile information is automatically populated from the onboarding questionnaire answers stored locally:

- **Basic Information**: Name, age, email
- **Medical History**: Previous scans, family history, conditions
- **Women's Health**: Period information, pregnancy status, medications
- **Lifestyle**: Smoking/alcohol habits, chronic conditions

### Data Flow
1. User completes onboarding questionnaire
2. Answers are saved to AsyncStorage with key `onboarding_{userId}`
3. Profile page fetches data from local storage
4. Data is displayed in both main profile and detailed profile views

## Components

### UserProfile.tsx
- Main profile page component
- Handles navigation and menu interactions
- Fetches data from local storage
- Fallback to basic user data if no onboarding data exists

### AuthContext.tsx
- Local authentication system using AsyncStorage
- User data management without external dependencies
- Simple email/password authentication for demo purposes

## Technical Implementation

### Styling
- **Tailwind CSS**: Utility-first styling approach
- **NativeWind**: React Native Tailwind integration
- **Responsive Design**: Adapts to different screen sizes

### State Management
- **React Hooks**: useState and useEffect for data management
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error management with fallbacks

### Data Persistence
- **AsyncStorage**: Local data storage for user information
- **No External Dependencies**: Self-contained authentication system
- **Offline-First**: All data stored locally on device

### Navigation
- **Screen Transitions**: Smooth navigation between profile views
- **Back Navigation**: Consistent back button behavior
- **Modal-like Experience**: Detailed profile as overlay

## Future Enhancements

### Planned Features
- Profile picture upload functionality
- Edit profile information
- Privacy settings management
- Account deletion options
- Data export functionality

### UI Improvements
- Profile picture cropping
- Custom avatar generation
- Theme customization
- Accessibility improvements

## Usage

### Accessing Profile
1. Navigate to the profile tab from the main app
2. View basic profile information
3. Tap "View full profile" for detailed information
4. Use menu options for various actions

### Data Updates
- Profile data automatically updates when onboarding is completed
- Data is stored locally using AsyncStorage
- No internet connection required for data access

## Dependencies

### Required Packages
- `@expo/vector-icons` - Icon library
- `@react-native-async-storage/async-storage` - Local data storage
- `nativewind` - Styling framework
- `react-native` - Core framework

### Data Storage
- **User Authentication**: Stored in AsyncStorage with key 'user'
- **Onboarding Data**: Stored in AsyncStorage with key 'onboarding_{userId}'
- **Profile Information**: Derived from user and onboarding data

## Migration Notes

### From Firebase to Local Storage
- **Authentication**: Replaced Firebase Auth with local AsyncStorage-based system
- **Data Storage**: Replaced Firestore with AsyncStorage for local persistence
- **Real-time Updates**: Removed Firebase real-time listeners
- **Offline Support**: Enhanced offline capabilities with local-first approach

### Benefits of Local Storage
- **No Internet Required**: App works completely offline
- **Faster Performance**: No network latency for data access
- **Privacy**: All data stays on user's device
- **Simplified Setup**: No external service configuration required
