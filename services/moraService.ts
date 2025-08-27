interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  response: string;
  cached?: boolean;
  response_time?: number;
}

interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

class MoraService {
  // Use configured backend URL or fallback to the correct local IP
  private baseUrl: string = process.env.MORA_BACKEND_URL || 'http://192.168.0.115:5002';
  private sessionId: string;

  constructor() {
    // Generate a unique session ID for this chat session
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check to see if the backend is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.log('Mora backend not available:', error);
      return false;
    }
  }

  // Send a message to Mora and get a response (regular)
  async sendMessage(message: string, userId?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: message,
          session_id: this.sessionId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      // Log performance metrics
      if (data.cached) {
        console.log('🚀 Cache HIT - Instant response!');
      } else if (data.response_time) {
        console.log(`⚡ Response generated in ${data.response_time.toFixed(2)}s`);
      }
      
      return data.response;
    } catch (error) {
      console.error('Error sending message to Mora:', error);
      // Return a fallback response when the backend is not available
      return this.getFallbackResponse(message);
    }
  }

  // Send a message with streaming support
  async sendMessageStreaming(
    message: string, 
    userId?: string, 
    options: StreamingOptions = {}
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: message,
          session_id: this.sessionId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available for streaming');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              
              if (data === '[DONE]') {
                // Stream complete
                if (options.onComplete) {
                  options.onComplete(fullResponse);
                }
                return;
              } else if (data.startsWith('Error:')) {
                // Error occurred
                if (options.onError) {
                  options.onError(data);
                }
                return;
              } else {
                // Regular chunk
                fullResponse += data;
                if (options.onChunk) {
                  options.onChunk(data);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error in streaming message to Mora:', error);
      if (options.onError) {
        options.onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // Get a fallback response when the backend is not available
  private getFallbackResponse(message: string): string {
    const fallbackResponses = [
      "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact support if the issue persists.",
      "I'm experiencing some technical difficulties at the moment. I'll be back online soon to help you with your breast health questions.",
      "I'm temporarily unavailable, but I'm here to help when I'm back online. In the meantime, please consult with your healthcare provider for urgent questions.",
      "I'm having trouble accessing my information right now. Please check your internet connection and try again.",
    ];
    
    // Return a random fallback response
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  // Get the current session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Create a new session (useful for starting fresh conversations)
  createNewSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if streaming is supported
  async checkStreamingSupport(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/performance`);
      const data = await response.json();
      return data.streaming === true;
    } catch (error) {
      console.log('Could not check streaming support:', error);
      return false;
    }
  }
}

export default MoraService;
export type { ChatMessage, ChatResponse };
