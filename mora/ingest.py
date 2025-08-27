import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Set up the embedding model
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# --- RAG Ingestion Process ---
def ingest_data(file_path, persist_directory):
    """Loads a document, splits it, and stores it in a Chroma vector store."""
    try:
        # 1. Load the document
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        # 2. Split the document into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        document_chunks = text_splitter.split_documents(docs)

        # 3. Create a persistent Chroma vector store from the chunks
        print("Creating ChromaDB vector store...")
        vector_store = Chroma.from_documents(
            documents=document_chunks,
            embedding=embeddings,
            persist_directory=persist_directory
        )
        print("Vector store created successfully.")

    except Exception as e:
        print(f"Error during data ingestion: {e}")
        vector_store = None

if __name__ == "__main__":
    pdf_path = "your_app_guide.pdf"  # Make sure this file exists
    db_path = "./chroma_db"
    ingest_data(pdf_path, db_path)