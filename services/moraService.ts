interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  response: string;
}

class MoraService {
  // Use the computer's IP address instead of localhost for device/simulator access
  private baseUrl: string = 'http://192.168.28.179:5002';
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

  // Send a message to Mora and get a response
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
      return data.response;
    } catch (error) {
      console.error('Error sending message to Mora:', error);
      // Return a fallback response when the backend is not available
      return this.getFallbackResponse(message);
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
}

export default MoraService;
export type { ChatMessage, ChatResponse };
