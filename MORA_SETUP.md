# Mora Chatbot Integration Setup

This guide will help you set up the Mora chatbot integration in your Femora app.

## Prerequisites

1. **Google Generative AI API Key**: You'll need an API key from Google AI Studio
2. **Firebase Service Account**: For chat history storage
3. **Python 3.8+**: For the backend server

## Environment Variables

Add these to your `.env` file:

```bash
# Existing configuration
ENCRYPTION_KEY=your-base64-encryption-key-here
GCS_BUCKET=your-gcs-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
JWT_SECRET_KEY=your-jwt-secret-key-here

# Mora Chatbot Configuration
GOOGLE_API_KEY=your-google-generative-ai-api-key-here
MORA_BACKEND_URL=http://localhost:5002
```

## Backend Setup

1. **Navigate to the mora directory**:
   ```bash
   cd mora
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your environment variables**:
   - Copy your Google API key to the `GOOGLE_API_KEY` variable
   - Ensure your Firebase service account JSON path is correct

4. **Start the Mora backend server**:
   ```bash
   python main.py
   ```

   The server will run on `http://localhost:5002`

## Frontend Integration

The React Native app is already configured to connect to the Mora backend. The integration includes:

- **Real-time chat**: Messages are sent to and received from the Python backend
- **Session management**: Each chat session maintains context
- **Error handling**: Graceful fallbacks when the backend is unavailable
- **Loading states**: Visual feedback during message processing
- **Typing indicators**: Shows when Mora is responding

## Features

- **RAG-powered responses**: Uses ChromaDB for document retrieval
- **Conversation memory**: Maintains chat history in Firebase
- **Gemini AI integration**: Powered by Google's latest AI model
- **Fallback responses**: Works even when backend is down

## Troubleshooting

1. **Backend not responding**: Check if the Python server is running on port 5002
2. **API key errors**: Verify your Google API key is valid and has the right permissions
3. **Firebase connection issues**: Check your service account credentials
4. **Port conflicts**: Change the port in `main.py` if 5002 is already in use

## Development Notes

- The backend runs on Flask and uses LangChain for AI processing
- Chat history is stored in Firebase Firestore
- Vector embeddings are stored in ChromaDB
- The frontend gracefully handles connection errors
