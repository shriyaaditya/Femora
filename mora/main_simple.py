import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Configuration & Initialization ---
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=api_key)

# Simple conversation history storage (in-memory for testing)
conversation_history = {}

def get_chat_history(session_id):
    """Get chat history for a session (simplified version)"""
    return conversation_history.get(session_id, [])

def add_message_to_history(session_id, message, role):
    """Add message to chat history (simplified version)"""
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    
    conversation_history[session_id].append({
        "message": message,
        "role": role,
        "timestamp": "2024-01-01T00:00:00Z"
    })

# --- API Endpoints ---

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the Mora chatbot service."""
    try:
        # Basic health checks
        health_status = {
            "status": "healthy",
            "service": "Mora Chatbot (Simplified)",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "1.0.0"
        }
        
        # Check if the LLM is accessible
        try:
            # Simple test to see if the LLM responds
            test_response = llm.invoke("Hello")
            health_status["llm_status"] = "connected"
        except Exception as e:
            health_status["llm_status"] = "error"
            health_status["llm_error"] = str(e)
        
        return jsonify(health_status), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }), 500

@app.route("/chat", methods=["POST"])
def chat():
    """Chat endpoint for the Mora chatbot."""
    try:
        data = request.json
        user_input = data.get("input")
        session_id = data.get("session_id")
        user_id = data.get("user_id")

        if not user_input or not session_id:
            return jsonify({"error": "Missing 'input' or 'session_id' in request"}), 400

        # Create enhanced session ID if user_id is provided
        if user_id:
            enhanced_session_id = f"{user_id}_{session_id}"
        else:
            enhanced_session_id = session_id

        # Get chat history
        chat_history = get_chat_history(enhanced_session_id)
        
        # Create a simple prompt for the LLM
        if chat_history:
            # Include recent context
            recent_messages = chat_history[-5:]  # Last 5 messages
            context = "\n".join([f"{msg['role']}: {msg['message']}" for msg in recent_messages])
            prompt = f"Previous conversation:\n{context}\n\nUser: {user_input}\n\nMora (breast health assistant):"
        else:
            prompt = f"You are Mora, a helpful breast care health assistant. The user asks: {user_input}\n\nMora:"

        # Get response from LLM
        response = llm.invoke(prompt)
        response_text = response.content if hasattr(response, 'content') else str(response)

        # Add messages to history
        add_message_to_history(enhanced_session_id, user_input, "human")
        add_message_to_history(enhanced_session_id, response_text, "ai")

        return jsonify({"response": response_text})

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/", methods=["GET"])
def root():
    """Root endpoint to confirm the service is running."""
    return jsonify({
        "message": "Mora Chatbot Service is running!",
        "endpoints": {
            "health": "/health",
            "chat": "/chat"
        }
    })

if __name__ == "__main__":
    print("🚀 Starting Mora Chatbot Backend (Simplified)...")
    print("📍 Service will be available at: http://localhost:5002")
    print("🔑 Using Google Gemini AI model")
    app.run(host="0.0.0.0", port=5002, debug=True)
