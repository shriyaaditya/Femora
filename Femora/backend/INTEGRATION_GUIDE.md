# Integration Guide: React Native → Python → GCP

This guide explains how the complete image capture and upload flow works from your React Native app to Google Cloud Storage.

## 🔄 Complete Flow Overview

```
React Native App → Python Backend → GCP Storage
     ↓                    ↓            ↓
  Camera Capture → Image Processing → Secure Upload
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
- **Image Processing**: Converts base64 → bytes → PIL Image → NumPy array
- **Pipeline Integration**: Calls `SecureImagePipeline` for processing

### 4. **secure_image_pipeline.py** - Core Processing
- **ImageEncryptor**: Encodes images to PNG and encrypts with AES-256
- **GCPImageUploader**: Uploads original PNG to Google Cloud Storage
- **Local Storage**: Saves encrypted version locally

## ☁️ Cloud Storage (GCP)

### 5. **Google Cloud Storage**
- **Bucket**: Stores original PNG images
- **Encryption**: Server-side encryption (automatic)
- **Organization**: Images stored in `images/` folder with timestamps
- **Access**: Public URLs returned (configurable for production)

## 🚀 How to Test the Integration

### Step 1: Set Up Environment Variables
```bash
cd backend

# Set your GCS bucket name
export GCS_BUCKET="your-bucket-name-here"

# Generate and set encryption key
python test_pipeline.py
export ENCRYPTION_KEY="generated-key-here"
```

### Step 2: Test GCP Upload
```bash
# Test the complete pipeline
python test_gcp_upload.py
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
5. Verify images appear in GCS bucket

## 📊 Data Flow Details

### Image Processing Steps
1. **Capture**: Camera → Base64 string
2. **Transmission**: Base64 → HTTP POST → Python backend
3. **Conversion**: Base64 → Bytes → PIL Image → NumPy array
4. **Encoding**: NumPy array → PNG bytes
5. **Encryption**: PNG bytes → AES-256 encrypted bytes
6. **Storage**: 
   - Encrypted → Local file (`.enc` extension)
   - Original PNG → GCS bucket
7. **Response**: GCS URL + processing status → Frontend

### File Naming Convention
- **Local**: `breast_scan_YYYYMMDD_HHMMSS_ffffff.png.enc`
- **GCS**: `images/YYYY-MM-DDTHH:MM:SS.ffffff_breast_scan_YYYYMMDD_HHMMSS_ffffff.png`

## 🔐 Security Features

### Client-Side (React Native)
- Base64 encoding for transmission
- Secure API calls with authentication

### Backend (Python)
- AES-256 encryption for local storage
- Secure image processing pipeline
- Audit logging for compliance

### Cloud Storage (GCP)
- Server-side encryption at rest
- Service account with minimal permissions
- Access control and monitoring

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
