import os
import time
import hashlib
import asyncio
from functools import lru_cache
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import redis
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

# RAG-specific imports
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain.chains import create_history_aware_retriever

from langchain_chroma import Chroma

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Configuration & Initialization ---
api_key = os.getenv("GOOGLE_API_KEY")
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
firestore_credentials_path = os.path.join(project_root, "config", "femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json")
db_path = "./chroma_db"

# Redis for caching (optional - fallback to in-memory if not available)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    CACHE_ENABLED = True
except:
    redis_client = None
    CACHE_ENABLED = False
    print("⚠️ Redis not available, using in-memory cache")

# In-memory cache fallback
response_cache = {}

if not api_key or not firestore_credentials_path:
    raise ValueError("API key or Firestore credentials path not found in environment variables.")

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firestore_credentials_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize LLM and Embeddings model with optimized settings
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", 
    api_key=api_key,
    temperature=0.7,
    max_output_tokens=150,  # Limit response length for speed
    request_timeout=30
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    request_timeout=30
)

# --- RAG Setup with Performance Optimizations ---
try:
    vector_store = Chroma(persist_directory=db_path, embedding_function=embeddings)
    retriever = vector_store.as_retriever(
        search_kwargs={"k": 3}  # Limit to top 3 most relevant documents
    )
except Exception as e:
    print(f"Error loading ChromaDB from disk: {e}")
    retriever = None

# --- Optimized LangChain Chain ---
history_aware_prompt = ChatPromptTemplate.from_messages([
    MessagesPlaceholder("chat_history"),
    ("user", "{input}"),
    ("user", "Given the previous conversation and the user's new question, generate a standalone question. Keep it concise."),
])

history_aware_retriever = create_history_aware_retriever(llm, retriever, history_aware_prompt)

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are Mora, a breast care health assistant. Use the context to answer briefly and accurately. Keep responses under 100 words.\n\n{context}"),
    MessagesPlaceholder("chat_history"),
    ("user", "{input}"),
])

document_chain = create_stuff_documents_chain(llm, qa_prompt)
retrieval_chain = create_retrieval_chain(history_aware_retriever, document_chain)

# --- Performance Optimizations ---

def generate_cache_key(user_input: str, session_id: str) -> str:
    """Generate a cache key for the user input"""
    # Normalize input for better cache hits
    normalized_input = user_input.lower().strip()
    return hashlib.md5(f"{session_id}:{normalized_input}".encode()).hexdigest()

def get_cached_response(cache_key: str) -> str:
    """Get cached response if available"""
    if CACHE_ENABLED and redis_client:
        try:
            cached = redis_client.get(cache_key)
            return json.loads(cached) if cached else None
        except:
            pass
    
    # Fallback to in-memory cache
    return response_cache.get(cache_key)

def cache_response(cache_key: str, response: str, ttl: int = 3600):
    """Cache response with TTL"""
    if CACHE_ENABLED and redis_client:
        try:
            redis_client.setex(cache_key, ttl, json.dumps(response))
        except:
            pass
    
    # Fallback to in-memory cache
    response_cache[cache_key] = response

@lru_cache(maxsize=1000)
def get_chat_history_cached(session_id: str):
    """Cached version of chat history retrieval"""
    return get_chat_history(session_id)

def get_chat_history(session_id):
    """Get chat history from Firestore"""
    try:
        messages = []
        doc_ref = db.collection('chat_sessions').document(session_id)
        if doc_ref.get().exists:
            messages_ref = doc_ref.collection('messages').order_by('timestamp').limit(10)  # Limit to last 10 messages
            for doc in messages_ref.stream():
                message_data = doc.to_dict()
                content = message_data.get('message', '')
                role = message_data.get('role', '')
                if role == "human":
                    messages.append(HumanMessage(content=content))
                elif role == "ai":
                    messages.append(AIMessage(content=content))
        return messages
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return []

def add_message_to_history_async(session_id: str, message: str, role: str):
    """Async version of adding message to history"""
    try:
        # Fire and forget - don't wait for completion
        asyncio.create_task(add_message_to_history_task(session_id, message, role))
    except:
        # Fallback to sync if async fails
        add_message_to_history(session_id, message, role)

async def add_message_to_history_task(session_id: str, message: str, role: str):
    """Async task for adding message to history"""
    try:
        messages_ref = db.collection('chat_sessions').document(session_id).collection('messages')
        messages_ref.add({
            "message": message,
            "role": role,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
    except Exception as e:
        print(f"Error adding message to history: {e}")

def add_message_to_history(session_id: str, message: str, role: str):
    """Sync version of adding message to history"""
    try:
        messages_ref = db.collection('chat_sessions').document(session_id).collection('messages')
        messages_ref.add({
            "message": message,
            "role": role,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
    except Exception as e:
        print(f"Error adding message to history: {e}")

# --- API Endpoints ---

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the Mora chatbot service."""
    try:
        health_status = {
            "status": "healthy",
            "service": "Mora Chatbot (Optimized)",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "2.0.0",
            "cache_enabled": CACHE_ENABLED,
            "cache_type": "redis" if CACHE_ENABLED else "memory"
        }
        
        # Check if the LLM is accessible
        try:
            test_response = llm.invoke("Hello")
            health_status["llm_status"] = "connected"
        except Exception as e:
            health_status["llm_status"] = "error"
            health_status["llm_error"] = str(e)
        
        # Check if the retriever is accessible
        if retriever:
            health_status["retriever_status"] = "connected"
        else:
            health_status["retriever_status"] = "not_available"
        
        return jsonify(health_status), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }), 500

@app.route("/chat", methods=["POST"])
def chat():
    start_time = time.time()
    
    try:
        data = request.json
        user_input = data.get("input")
        session_id = data.get("session_id")
        user_id = data.get("user_id")

        if not user_input or not session_id:
            return jsonify({"error": "Missing 'input' or 'session_id' in request"}), 400

        # Create enhanced session ID
        enhanced_session_id = f"{user_id}_{session_id}" if user_id else session_id
        
        # Check cache first
        cache_key = generate_cache_key(user_input, enhanced_session_id)
        cached_response = get_cached_response(cache_key)
        
        if cached_response:
            print(f"🚀 Cache hit! Response time: {time.time() - start_time:.2f}s")
            # Add to history asynchronously
            add_message_to_history_async(enhanced_session_id, user_input, "human")
            add_message_to_history_async(enhanced_session_id, cached_response, "ai")
            
            return jsonify({
                "response": cached_response,
                "cached": True,
                "response_time": f"{time.time() - start_time:.2f}s"
            })

        # Get chat history (cached)
        chat_history = get_chat_history_cached(enhanced_session_id)
        
        # Process with RAG chain
        print(f"🔍 Processing with RAG...")
        rag_start = time.time()
        
        response = retrieval_chain.invoke(
            {"input": user_input, "chat_history": chat_history},
            config={"callbacks": None, "max_output_tokens": 150}
        )
        
        rag_time = time.time() - rag_start
        print(f"✅ RAG processing completed in {rag_time:.2f}s")
        
        answer = response['answer']
        
        # Cache the response
        cache_response(cache_key, answer)
        
        # Add to history asynchronously
        add_message_to_history_async(enhanced_session_id, user_input, "human")
        add_message_to_history_async(enhanced_session_id, answer, "ai")
        
        total_time = time.time() - start_time
        
        return jsonify({
            "response": answer,
            "cached": False,
            "rag_time": f"{rag_time:.2f}s",
            "total_time": f"{total_time:.2f}s"
        })
        
    except Exception as e:
        total_time = time.time() - start_time
        print(f"❌ Chat error after {total_time:.2f}s: {e}")
        return jsonify({
            "error": f"Chat processing failed: {str(e)}",
            "response_time": f"{total_time:.2f}s"
        }), 500

@app.route("/chat/fast", methods=["POST"])
def chat_fast():
    """Fast chat endpoint with minimal processing for simple queries"""
    start_time = time.time()
    
    try:
        data = request.json
        user_input = data.get("input")
        session_id = data.get("session_id")
        
        if not user_input or not session_id:
            return jsonify({"error": "Missing 'input' or 'session_id' in request"}), 400
        
        # For simple queries, skip RAG and use direct LLM
        if len(user_input.split()) < 10:  # Short questions
            response = llm.invoke(f"Answer briefly: {user_input}")
            answer = response.content
            
            total_time = time.time() - start_time
            
            return jsonify({
                "response": answer,
                "mode": "fast",
                "response_time": f"{total_time:.2f}s"
            })
        
        # Fallback to regular chat for complex queries
        return chat()
        
    except Exception as e:
        total_time = time.time() - start_time
        return jsonify({
            "error": f"Fast chat failed: {str(e)}",
            "response_time": f"{total_time:.2f}s"
        }), 500

if __name__ == "__main__":
    print("🚀 Starting Optimized Mora Chatbot...")
    print(f"📦 Cache enabled: {CACHE_ENABLED}")
    print(f"🔍 RAG retriever: {'✅' if retriever else '❌'}")
    print(f"🤖 LLM model: gemini-1.5-flash")
    
    app.run(host="0.0.0.0", port=5003, debug=False)  # Disable debug for production
