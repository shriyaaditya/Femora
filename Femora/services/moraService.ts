import { ChatMessage, ChatSession } from './userService';
import { ENV } from '../config/environment';

export interface ChatResponse {
  response: string;
  error?: string;
}

export class MoraService {
  private static instance: MoraService;
  private baseUrl: string;
  private sessionId: string;
  private userId: string | null = null;

  private constructor() {
    // Use environment variable or fallback to localhost for development
    this.baseUrl = ENV.MORA_BACKEND_URL;
    // Generate session ID only once when service is created
    this.sessionId = this.generateSessionId();
    
    console.log('🤖 [MoraService] Initialized with backend URL:', this.baseUrl);
    console.log('🤖 [MoraService] Session ID created:', this.sessionId);
  }

  public static getInstance(): MoraService {
    if (!MoraService.instance) {
      MoraService.instance = new MoraService();
    }
    return MoraService.instance;
  }

  private generateSessionId(): string {
    // Use a more stable session ID that doesn't change every millisecond
    const timestamp = Math.floor(Date.now() / 1000); // Use seconds instead of milliseconds
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${randomPart}`;
  }

  /**
   * Send a message to the Mora chatbot
   * @param message - The user's message
   * @returns Promise<ChatResponse> - The chatbot's response
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      console.log('🤖 [MoraService] Sending message:', message);
      
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: message,
          session_id: this.sessionId,
          user_id: this.userId,  // Include user ID for better session management
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🤖 [MoraService] Received response:', data);
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('🤖 [MoraService] Error sending message:', errorMessage);
      
      // Return a fallback response for development/testing
      return {
        response: "I'm having trouble connecting right now. Please try again later or check your internet connection.",
        error: errorMessage
      };
    }
  }

  /**
   * Get a welcome message from Mora
   * @returns Promise<string> - Welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    try {
      const response = await this.sendMessage("Hello! Can you introduce yourself?");
      return response.response;
    } catch (error) {
      return "Hey there! I'm Mora, your fabulous piggy assistant! 🐷 How can I help you today?";
    }
  }

  /**
   * Reset the chat session
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    console.log('🤖 [MoraService] Session reset:', this.sessionId);
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    console.log('🤖 [MoraService] Getting session ID:', this.sessionId);
    return this.sessionId;
  }

  /**
   * Update the backend URL (useful for switching between dev/prod)
   */
  updateBackendUrl(newUrl: string): void {
    this.baseUrl = newUrl;
    console.log('🤖 [MoraService] Backend URL updated to:', this.baseUrl);
  }

  /**
   * Get the current backend URL
   */
  getBackendUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set the current user ID for session management
   */
  setUserId(userId: string): void {
    this.userId = userId;
    console.log('🤖 [MoraService] User ID set:', userId);
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Test the connection to the backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('🤖 [MoraService] Connection test failed:', error);
      return false;
    }
  }
}

export default MoraService.getInstance();
