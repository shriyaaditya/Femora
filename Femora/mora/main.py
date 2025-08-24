import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

# RAG-specific imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain.chains import create_history_aware_retriever

# ... (all your existing imports)

from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Configuration & Initialization ---
api_key = os.getenv("GOOGLE_API_KEY")
# Fix the path to use absolute path from project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
firestore_credentials_path = os.path.join(project_root, "config", "femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json")
db_path = "./chroma_db" # Path to your ChromaDB folder

if not api_key or not firestore_credentials_path:
    raise ValueError("API key or Firestore credentials path not found in environment variables.")

# Initialize Firebase Admin SDK
# ... (rest of your Firebase setup)
cred = credentials.Certificate(firestore_credentials_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize LLM and Embeddings model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=api_key)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# --- RAG Setup: Load the existing vector store ---
try:
    vector_store = Chroma(persist_directory=db_path, embedding_function=embeddings)
    retriever = vector_store.as_retriever()
except Exception as e:
    print(f"Error loading ChromaDB from disk: {e}")
    retriever = None

# --- LangChain Conversational RAG Chain ---
# (The rest of your chain logic remains the same)
history_aware_prompt = ChatPromptTemplate.from_messages([
    MessagesPlaceholder("chat_history"),
    ("user", "{input}"),
    ("user", "Given the previous conversation and the user's new question, which might reference context in the chat history, generate a standalone question that can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
])
history_aware_retriever = create_history_aware_retriever(llm, retriever, history_aware_prompt)

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant named Mora, a breast care health assistant Use the following retrieved context to answer the question. If you don't know the answer, just say that you don't know, don't try to make up an answer. Keep your response concise and short.\n\n{context}"),
    MessagesPlaceholder("chat_history"),
    ("user", "{input}"),
])
document_chain = create_stuff_documents_chain(llm, qa_prompt)

retrieval_chain = create_retrieval_chain(history_aware_retriever, document_chain)

# --- Firestore Functions ---
# (Your existing functions: get_chat_history, add_message_to_history)
def get_chat_history(session_id):
    messages = []
    doc_ref = db.collection('chat_sessions').document(session_id)
    if doc_ref.get().exists:
        messages_ref = doc_ref.collection('messages').order_by('timestamp')
        for doc in messages_ref.stream():
            message_data = doc.to_dict()
            content = message_data.get('message', '')
            role = message_data.get('role', '')
            if role == "human":
                messages.append(HumanMessage(content=content))
            elif role == "ai":
                messages.append(AIMessage(content=content))
    return messages


def add_message_to_history(session_id, message, role):
    messages_ref = db.collection('chat_sessions').document(session_id).collection('messages')
    messages_ref.add({
        "message": message,
        "role": role,
        "timestamp": firestore.SERVER_TIMESTAMP
    })

# --- API Endpoints ---

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the Mora chatbot service."""
    try:
        # Basic health checks
        health_status = {
            "status": "healthy",
            "service": "Mora Chatbot",
            "timestamp": "2024-01-01T00:00:00Z",  # Fixed: Use string instead of SERVER_TIMESTAMP
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
            "timestamp": "2024-01-01T00:00:00Z"  # Fixed: Use string instead of SERVER_TIMESTAMP
        }), 500

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("input")
    session_id = data.get("session_id")
    user_id = data.get("user_id")  # New field for user ID

    if not user_input or not session_id:
        return jsonify({"error": "Missing 'input' or 'session_id' in request"}), 400

    # If user_id is provided, use it for better session management
    if user_id:
        # Create a more specific session ID that includes user ID
        enhanced_session_id = f"{user_id}_{session_id}"
    else:
        enhanced_session_id = session_id

    chat_history = get_chat_history(enhanced_session_id)
    
    response = retrieval_chain.invoke(
        {"input": user_input, "chat_history": chat_history},
        config={"callbacks": None, "max_output_tokens": 100}
    )

    add_message_to_history(enhanced_session_id, user_input, "human")
    add_message_to_history(enhanced_session_id, response['answer'], "ai")

    return jsonify({"response": response['answer']})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)