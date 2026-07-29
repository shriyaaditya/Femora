# Integration Guide: React Native → Python → Encrypted Binary Storage

This guide explains how the complete image capture and storage flow works from your React Native app to encrypted binary storage.

## 🔄 Complete Flow Overview

```
React Native App → Python Backend → Encrypted Binary Storage
     ↓                    ↓                    ↓
  Camera Capture → Image Processing → Raw Encrypted Data
```

## 📱 Frontend (React Native)

### 1. **BreastScan.tsx** - Image Capture
- **Camera Integration**: Uses Expo Camera to capture images
- **Automatic Capture**: Takes 5 images every 2 seconds during scan
- **Base64 Encoding**: Converts images to base64 strings
- **Metadata**: Includes user ID, scan type, timestamp

### 2. **SecureImageService.ts** - API Communication
- **Backend URL**: Sends images to `http://localhost:8000/api/process-image`
- **Authentication**: Includes Bearer token in headers
- **Error Handling**: Falls back to local processing if backend fails

## 🐍 Backend (Python)

### 3. **main.py** - API Endpoints
- **FastAPI Server**: Handles incoming image requests
- **Image Processing**: Converts base64 → bytes → NumPy array
- **Pipeline Integration**: Calls `SecureImagePipeline` for processing

### 4. **secure_image_pipeline.py** - Core Processing
- **ImageEncryptor**: Encrypts raw image arrays directly (no PNG/JPEG conversion)
- **Local Storage**: Saves encrypted binary data locally
- **No Format Conversion**: Images stored as raw encrypted bytes only

## 💾 Local Storage

### 5. **Local Encrypted Storage**
- **Format**: AES-256 encrypted binary data (`.enc` files)
- **Location**: Backend server local storage
- **Content**: Raw encrypted image bytes (no PNG/JPEG headers)
- **Cleanup**: Automatic after processing

## 🚀 How to Test the Integration

### Step 1: Set Up Environment Variables
```bash
cd backend

# Generate and set encryption key
python test_pipeline.py
export ENCRYPTION_KEY="generated-key-here"
```

### Step 2: Test Local Processing
```bash
# Test the complete pipeline
python test_pipeline.py --complete
```

### Step 3: Start the Backend
```bash
# Start FastAPI server
python main.py
```

### Step 4: Test from React Native
1. Start your React Native app
2. Navigate to Breast Scan
3. Start a scan
4. Check backend logs for processing
5. Verify encrypted binary files are created locally

## 📊 Data Flow Details

### Image Processing Steps
1. **Capture**: Camera → Base64 string
2. **Transmission**: Base64 → HTTP POST → Python backend
3. **Conversion**: Base64 → Bytes → NumPy array
4. **Encryption**: NumPy array → AES-256 encrypted binary bytes
5. **Storage**: 
   - Encrypted binary → Local `.enc` file
   - Base64 → Firebase Firestore (for app access)
6. **Response**: Processing status + local filename → Frontend

### File Naming Convention
- **Local**: `breast_scan_YYYYMMDD_HHMMSS_ffffff.enc` (encrypted binary)
- **Firebase**: Base64 strings in scan sessions

## 🔐 Security Features

### Client-Side (React Native)
- Base64 encoding for transmission
- Secure API calls with authentication

### Backend (Python)
- **AES-256-GCM encryption** for all image data
- **No PNG/JPEG storage** - only encrypted binary
- **Direct array encryption** without format conversion
- **Local secure storage** with automatic cleanup

### Data Integrity
- **Raw binary encryption** preserves exact image data
- **No format conversion** eliminates potential data loss
- **Direct NumPy array processing** maintains precision

## 🐛 Troubleshooting

### Common Issues

1. **GCP Authentication Error**
   ```bash
   # Check credentials
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   # Or use ADC
   gcloud auth application-default login
   ```

2. **Bucket Not Found**
   ```bash
   # Verify bucket name
   echo $GCS_BUCKET
   # Check bucket exists in GCP Console
   ```

3. **Encryption Key Issues**
   ```bash
   # Generate new key
   python test_pipeline.py
   # Set environment variable
   export ENCRYPTION_KEY="new-key-here"
   ```

4. **Backend Connection Failed**
   ```bash
   # Check if backend is running
   curl http://localhost:8000/health
   # Check logs
   python main.py
   ```

### Debug Mode
```python
# In main.py, enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📈 Monitoring and Logs

### Backend Logs
- Image processing status
- GCP upload confirmations
- Error details and stack traces

### GCP Console
- Storage browser for uploaded images
- Access logs and audit trails
- Cost monitoring and usage statistics

### React Native Console
- Image capture confirmations
- API call results
- Processing status updates

## 🎯 Production Considerations

### Security
- Restrict GCS bucket access
- Implement proper authentication
- Use HTTPS for all communications
- Regular security audits

### Performance
- Image compression and optimization
- Batch processing for multiple images
- CDN integration for image delivery
- Monitoring and alerting

### Compliance
- HIPAA compliance for medical data
- Data retention policies
- Audit logging and reporting
- Regular compliance reviews

## 🔗 API Endpoints

### POST `/api/process-image`
- **Purpose**: Process image directly and return results
- **Input**: Base64 image + metadata
- **Output**: Processing status + GCS URL + analysis results

### POST `/api/upload-image`
- **Purpose**: Upload image for async processing
- **Input**: Base64 image + metadata
- **Output**: Processing ID for status tracking

### GET `/api/status/{processing_id}`
- **Purpose**: Check processing status
- **Input**: Processing ID
- **Output**: Current status + results + GCS URL

## 📝 Next Steps

1. **Test the integration** using the provided test scripts
2. **Configure your GCP bucket** and service account
3. **Set environment variables** for bucket name and encryption key
4. **Start the backend** and test from your React Native app
5. **Monitor logs** to ensure everything works correctly
6. **Customize** the pipeline for your specific needs

The integration is now complete and ready to securely capture breast scan images from your React Native app and upload them to Google Cloud Storage! 🎉
