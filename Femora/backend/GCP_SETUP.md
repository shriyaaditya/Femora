# GCP Image Upload Setup Guide

This guide explains how to set up Google Cloud Platform (GCP) integration for securely uploading breast scan images to Google Cloud Storage.

## Prerequisites

1. **Google Cloud Project**: You need a GCP project with billing enabled
2. **Google Cloud Storage Bucket**: A bucket to store the uploaded images
3. **Service Account**: A service account with Storage Object Admin permissions
4. **Python Environment**: Python 3.7+ with required packages

## Setup Steps

### 1. Create GCP Storage Bucket

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Storage > Buckets
3. Click "Create Bucket"
4. Choose a unique name for your bucket
5. Select your preferred region
6. Choose "Standard" storage class
7. Set access control to "Uniform"
8. Click "Create"

### 2. Create Service Account

1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Give it a name (e.g., "breast-scan-uploader")
4. Add description: "Service account for uploading breast scan images"
5. Click "Create and Continue"
6. Grant the "Storage Object Admin" role
7. Click "Continue" and "Done"

### 3. Download Service Account Key

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the key file
6. **Important**: Keep this file secure and never commit it to version control

### 4. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Set the following environment variables:

```bash
# Your GCS bucket name
export GCS_BUCKET="your-bucket-name-here"

# Path to your service account key file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"

# Or use Application Default Credentials
gcloud auth application-default login
```

### 6. Generate Encryption Key

Run the test pipeline to generate an encryption key:

```bash
python test_pipeline.py
```

Copy the generated key and set it as an environment variable:

```bash
export ENCRYPTION_KEY="your-generated-base64-key-here"
```

## Usage

### Quick Setup

Run the setup script to configure everything:

```bash
python setup.py
```

### Manual Testing

Test the GCP upload functionality:

```bash
python test_pipeline.py
```

### Run the Backend

Start the FastAPI backend:

```bash
python main.py
```

## API Endpoints

The backend provides these endpoints for image processing:

- `POST /api/upload-image`: Upload and process an image
- `POST /api/process-image`: Process image directly
- `GET /api/status/{processing_id}`: Check processing status

## Security Features

1. **Server-side Encryption**: GCS automatically encrypts data at rest
2. **Client-side Encryption**: Images are encrypted before upload
3. **Secure Access**: Service account with minimal required permissions
4. **Audit Logging**: All operations are logged for compliance

## File Structure

```
backend/
├── secure_image_pipeline.py  # Main pipeline with GCP integration
├── config.py                 # Configuration management
├── setup.py                  # Setup and testing script
├── test_pipeline.py          # Test the pipeline components
├── main.py                   # FastAPI backend
└── requirements.txt          # Python dependencies
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Check your service account key and permissions
2. **Bucket Not Found**: Verify the bucket name and your project
3. **Permission Denied**: Ensure the service account has Storage Object Admin role
4. **Import Error**: Install missing packages with `pip install -r requirements.txt`

### Debug Mode

Enable debug logging by setting the log level:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### GCP Console

Check the GCP Console for:
- Storage browser to see uploaded files
- IAM to verify service account permissions
- Logs for detailed error information

## Production Considerations

1. **Access Control**: Restrict bucket access to authorized users only
2. **Lifecycle Management**: Set up automatic deletion of old images
3. **Monitoring**: Enable Cloud Monitoring and alerting
4. **Backup**: Consider cross-region replication for critical data
5. **Compliance**: Ensure HIPAA compliance if handling medical data

## Support

For issues with:
- **GCP Setup**: Check [GCP Documentation](https://cloud.google.com/docs)
- **Python Code**: Review error logs and check dependencies
- **Authentication**: Verify service account configuration
