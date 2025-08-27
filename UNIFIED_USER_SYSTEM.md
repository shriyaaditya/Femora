# Unified User ID System - Femora App

## Overview

The Femora app now uses a unified user ID system that ensures all user data (encoded images, chat history, personal details, scan results) are properly linked and accessible through a single, consistent identifier.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Firebase Auth                            │
│                    (user.uid = Primary Key)                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UserService (Singleton)                      │
│              Centralized User Data Management                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firestore Database                           │
│                                                                 │
│  users/{uid}/                                                   │
│  ├── profile (UserProfile)                                      │
│  ├── Features                                                   │
│  ├── scans/{scanId} (ScanSession)                               │
│  
└─────────────────────────────────────────────────────────────────┘
```

## Data Structure

### 1. User Profile (`users/{uid}/profile`)
```typescript
interface UserProfile {
  uid: string;           // Firebase Auth UID (Primary Key)
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  onboarding?: OnboardingData;
  preferences?: UserPreferences;
}
```

### 2. Textual Features (`users/{uid}/textualFeatures`)
```typescript
interface TextualFeatures {
  completedAt: Date;
  age: number;
  familyHistory: 'Yes' | 'No';
  lumpsOrThickening: boolean;  // Any lumps or thickening in your breasts
  chronicHealthIssues: boolean; // Any chronic health issues
  discomfortOrTenderness: number; // Scale of 0-3: Are you feeling any discomfort or tenderness
  changeInBreastSize: number;   // Scale of 0-3: Change in size of breasts
  rednessOrWarmth: boolean;     // Any redness or warmth in the breast region
  nippleChanges: boolean;       // Discharge or changes like inversion of nipples
  breastPainOrHeaviness: number; // Scale of 0-5: Any usual pain or heaviness in the breasts
  smokingStatus: boolean;       // Do you smoke
}
```

### 3. Scan Sessions (`users/{uid}/scans/{scanId}`)
```typescript
interface ScanSession {
  id: string;            // Auto-generated scan ID
  userId: string;        // Links to user.uid
  scanType: 'breast-scan' | 'mammogram' | 'ultrasound';
  scanTime: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  images: string[];      // Base64 or URLs
  analysisResults?: ScanAnalysis;
  processingStatus?: ProcessingStatus;
  backendUsed?: 'python' | 'local';
  gcsUrls?: string[];
  metadata?: Record<string, any>;
}
```

### 4. Chat Sessions (`users/{uid}/chat_sessions/{sessionId}`)
```typescript
interface ChatSession {
  id: string;            // Auto-generated chat ID
  userId: string;        // Links to user.uid
  sessionId: string;     // Mora session ID
  messages: ChatMessage[];
  createdAt: Date;
  lastActivityAt: Date;
  metadata?: Record<string, any>;
}
```

## Data Flow

### 1. User Authentication
```
User Signs In → Firebase Auth → user.uid Generated → UserService.getUserProfile()
```

### 2. Textual Features Flow
```
User Completes Questionnaire → UserService.saveTextualFeatures(uid, data) → 
Stored in users/{uid}/textualFeatures
```

### 3. Scan Flow
```
User Starts Scan → UserService.createScanSession(uid, scanData) → 
Scan ID Generated → Images Processed → UserService.updateScanSession(uid, scanId, results)
```

### 4. Chat Flow
```
User Sends Message → MoraService.sendMessage() → 
Backend Processes → UserService.saveChatSession(uid, sessionId, messages)
```

## Key Benefits

### 1. **Data Consistency**
- All user data is linked by the same `user.uid`
- No orphaned data or broken references
- Single source of truth for user identity

### 2. **Privacy & Security**
- User data is isolated by UID
- No cross-user data leakage
- Firebase security rules can be easily configured

### 3. **Scalability**
- Efficient queries using user ID as index
- Easy to implement user-specific features
- Simple data export/deletion for GDPR compliance

### 4. **Maintainability**
- Centralized data management through UserService
- Consistent data structure across components
- Easy to add new user-related features

## Implementation Details

### UserService Methods

```typescript
// Get or create user profile
getUserProfile(user: User): Promise<UserProfile>

// Save textual features data
saveTextualFeatures(uid: string, data: TextualFeatures): Promise<void>

// Create scan session
createScanSession(userId: string, data: Partial<ScanSession>): Promise<string>

// Update scan session
updateScanSession(userId: string, scanId: string, updates: Partial<ScanSession>): Promise<void>

// Save chat session
saveChatSession(userId: string, sessionId: string, messages: ChatMessage[]): Promise<void>

// Get user statistics
getUserStats(uid: string): Promise<UserStats>

// Delete all user data (GDPR compliance)
deleteUserData(uid: string): Promise<void>
```

### Component Integration

All components now use the UserService instead of direct Firebase calls:

```typescript
// Before (direct Firebase)
const userRef = doc(db, 'users', user.uid);
await setDoc(userRef, { textualFeatures: data });

// After (UserService)
await UserService.saveTextualFeatures(user.uid, data);
```

### Mora Chatbot Integration

The Mora chatbot now includes user ID in all requests:

```typescript
// MoraService sends user ID with each message
body: JSON.stringify({
  input: message,
  session_id: this.sessionId,
  user_id: this.userId,  // Links chat to specific user
})
```

## Data Relationships

```
User (uid: "abc123")
├── Profile
│   ├── email: "user@example.com"
│   ├── displayName: "Jane Doe"(from the onboarding form )
│   └── createdAt: "2024-01-01"
├── Textual Features
│   └── completedAt: "2024-01-01"
│   ├── age: 35(from the onboarding form )
│   ├── familyHistory: "Yes"(from the onboarding form )
│   └── Any lumps or thickening in your breasts--> binary
|   └── any chronic health issues --> binary (from the onboarding form )
|   └── are you feeling any discomfort or tenderness--> scale of 3
|   └── change in size of breasts --> scale of 3
|   └── any redness or warmth in the breast region -->binary
|   └── discharge or changes like inversion of nipples --> binary
|   └── any usual pain or heaviness in the breasts --> scale of 5
|   └── do you smoke --> binary
├── Scans
│   ├── scan_001
│   │   ├── scanType: "breast-scan"
│   │   ├── images: ["base64_1", "base64_2"]
│   │   └── analysisResults: {...}
│   └── scan_002
│       ├── scanType: "breast-scan"
│       ├── images: ["base64_3"]
│       └── analysisResults: {...}

## Security Considerations

### 1. **Firebase Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcollections inherit parent permissions
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 2. **Data Validation**
- All data is validated before storage
- TypeScript interfaces ensure data consistency
- UserService methods include error handling

### 3. **Privacy Controls**
- User data is isolated by UID
- No cross-user data access
- GDPR-compliant data deletion

## Testing

### 1. **Unit Tests**
```typescript
// Test user data linking
const user = await UserService.getUserProfile(firebaseUser);
expect(user.uid).toBe(firebaseUser.uid);

// Test scan session creation
const scanId = await UserService.createScanSession(user.uid, scanData);
const scan = await UserService.getScanSession(user.uid, scanId);
expect(scan.userId).toBe(user.uid);
```

### 2. **Integration Tests**
```typescript
// Test complete user flow
const profile = await UserService.getUserProfile(user);
await UserService.saveTextualFeatures(user.uid, textualFeaturesData);
const scanId = await UserService.createScanSession(user.uid, scanData);
await UserService.saveChatSession(user.uid, sessionId, messages);

// Verify all data is linked
const stats = await UserService.getUserStats(user.uid);
expect(stats.totalScans).toBe(1);
expect(stats.totalChats).toBe(1);
```

## Migration Guide

### 1. **Existing Users**
- Data will be automatically migrated when users sign in
- UserService.getUserProfile() creates profile if it doesn't exist
- No data loss during transition

### 2. **New Features**
- Always use UserService for user-related operations
- Include user.uid in all data operations
- Follow the established data structure patterns

### 3. **Backend Integration**
- Mora chatbot now receives user ID with each message
- Backend can implement user-specific features
- Chat history is properly linked to users

## Conclusion

The unified user ID system provides a robust foundation for the Femora app, ensuring:

- **Data Integrity**: All user data is properly linked
- **Privacy**: User isolation and secure data access
- **Scalability**: Efficient data management and queries
- **Maintainability**: Centralized service architecture
- **Compliance**: GDPR-ready data management

This system will support the app's growth while maintaining data security and user privacy.
