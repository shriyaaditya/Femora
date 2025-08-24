# Breast Scan AI Backend

This Python backend integrates with your React Native app to provide secure image processing and AI analysis using the `SecureImagePipeline`.

## Features

- 🔐 **Secure Image Processing**: AES-GCM encryption for all images
- 🚀 **FastAPI Backend**: High-performance async API
- ☁️ **Google Cloud Storage**: Secure cloud storage integration
- 🤖 **AI Analysis**: Breast scan analysis with confidence scoring
- 🔒 **Authentication**: JWT-based security
- 📱 **CORS Support**: Compatible with React Native apps

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file with your configuration:

```bash
# Copy the example
cp .env.example .env

# Edit with your values
ENCRYPTION_KEY=your-base64-encryption-key-here
GCS_BUCKET=your-gcs-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### 3. Google Cloud Setup

1. **Create a GCS Bucket**:
   ```bash
   gsutil mb gs://your-bucket-name
   ```

2. **Service Account Setup**:
   - Go to Google Cloud Console → IAM & Admin → Service Accounts
   - Create a new service account with "Storage Admin" role
   - Download the JSON key file
   - Set the path in your `.env` file

### 4. Generate Encryption Key

```python
import base64
import secrets

# Generate 32-byte key for AES-256
key = secrets.token_bytes(32)
key_b64 = base64.b64encode(key).decode('utf-8')
print(f"Your encryption key: {key_b64}")
```

### 5. Run the Backend

```bash
# Development
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
- `GET /health` - Backend status and pipeline readiness

### Image Processing
- `POST /api/upload-image` - Upload and process image asynchronously
- `POST /api/process-image` - Process image directly and return results
- `GET /api/status/{processing_id}` - Check processing status

## Integration with React Native

The backend is designed to work seamlessly with the `SecureImageService` in your React Native app. Update the `BACKEND_CONFIG.baseUrl` in `secureImageService.ts` to point to your backend:

```typescript
const BACKEND_CONFIG = {
  baseUrl: 'http://localhost:8000/api',  // Local development
  // baseUrl: 'https://your-backend.com/api',  // Production
  // ... other config
};
```

## Security Features

- **AES-GCM Encryption**: Military-grade encryption for all images
- **JWT Authentication**: Secure API access
- **CORS Protection**: Configured for mobile app security
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Secure error responses without data leakage

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### API Documentation
Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure `secure_image_pipeline.py` is in the same directory
2. **GCS Permissions**: Verify your service account has proper storage permissions
3. **CORS Issues**: Check that your React Native app's origin is in `ALLOWED_ORIGINS`
4. **Encryption Key**: Ensure your key is exactly 32 bytes when base64 decoded

### Logs
Check the console output for detailed logging of all operations.

## Production Deployment

For production deployment:

1. Use a production WSGI server (Gunicorn)
2. Set up proper SSL/TLS certificates
3. Configure environment variables securely
4. Use a production database for status tracking
5. Implement proper rate limiting
6. Set up monitoring and alerting

## Support

For issues or questions, check the logs and ensure all dependencies are properly installed.

