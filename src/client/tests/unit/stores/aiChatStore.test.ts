import { describe, it, expect, beforeEach } from 'vitest';
import { useAIChatStore } from '../../../src/stores/aiChatStore';
import type { ChatMessage } from '../../../src/stores/aiChatStore';

/**
 * Reset the zustand store to its initial state before each test.
 * The store initializes with a welcome message from the assistant.
 */
function resetStore() {
  useAIChatStore.setState({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hello! I'm your AI Project Management Assistant. I can help you analyze projects, identify risks, optimize schedules, and answer questions about your portfolio. What would you like to know?",
        timestamp: new Date().toISOString(),
      },
    ],
    isLoading: false,
    conversationId: null,
    error: null,
  });
}

describe('aiChatStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('has a welcome message from the assistant', () => {
      const state = useAIChatStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].id).toBe('welcome');
      expect(state.messages[0].role).toBe('assistant');
    });

    it('welcome message contains introductory text', () => {
      const state = useAIChatStore.getState();
      expect(state.messages[0].content).toContain('AI Project Management Assistant');
    });

    it('has isLoading set to false', () => {
      expect(useAIChatStore.getState().isLoading).toBe(false);
    });

    it('has conversationId set to null', () => {
      expect(useAIChatStore.getState().conversationId).toBeNull();
    });

    it('has error set to null', () => {
      expect(useAIChatStore.getState().error).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // addMessage
  // ---------------------------------------------------------------------------

  describe('addMessage', () => {
    it('adds a user message to the messages array', () => {
      useAIChatStore.getState().addMessage({
        role: 'user',
        content: 'What are the current project risks?',
      });

      const state = useAIChatStore.getState();
      expect(state.messages).toHaveLength(2); // welcome + new message
      expect(state.messages[1].role).toBe('user');
      expect(state.messages[1].content).toBe('What are the current project risks?');
    });

    it('auto-generates an id starting with "msg-"', () => {
      useAIChatStore.getState().addMessage({
        role: 'user',
        content: 'Hello',
      });

      const newMessage = useAIChatStore.getState().messages[1];
      expect(newMessage.id).toBeDefined();
      expect(newMessage.id).toMatch(/^msg-/);
    });

    it('auto-generates a timestamp in ISO format', () => {
      useAIChatStore.getState().addMessage({
        role: 'assistant',
        content: 'Here are the risks...',
      });

      const newMessage = useAIChatStore.getState().messages[1];
      expect(newMessage.timestamp).toBeDefined();
      expect(new Date(newMessage.timestamp).toISOString()).toBe(newMessage.timestamp);
    });

    it('clears any existing error when adding a message', () => {
      // Set an error first
      useAIChatStore.getState().setError('Something went wrong');
      expect(useAIChatStore.getState().error).toBe('Something went wrong');

      // Add a message -- should clear the error
      useAIChatStore.getState().addMessage({
        role: 'user',
        content: 'Try again',
      });

      expect(useAIChatStore.getState().error).toBeNull();
    });

    it('appends messages in order', () => {
      const { addMessage } = useAIChatStore.getState();
      addMessage({ role: 'user', content: 'First' });
      addMessage({ role: 'assistant', content: 'Second' });
      addMessage({ role: 'user', content: 'Third' });

      const messages = useAIChatStore.getState().messages;
      expect(messages).toHaveLength(4); // welcome + 3
      expect(messages[1].content).toBe('First');
      expect(messages[2].content).toBe('Second');
      expect(messages[3].content).toBe('Third');
    });
  });

  // ---------------------------------------------------------------------------
  // setLoading
  // ---------------------------------------------------------------------------

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      useAIChatStore.getState().setLoading(true);
      expect(useAIChatStore.getState().isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      useAIChatStore.getState().setLoading(true);
      useAIChatStore.getState().setLoading(false);
      expect(useAIChatStore.getState().isLoading).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // setError
  // ---------------------------------------------------------------------------

  describe('setError', () => {
    it('sets the error message', () => {
      useAIChatStore.getState().setError('API connection failed');
      expect(useAIChatStore.getState().error).toBe('API connection failed');
    });

    it('clears isLoading when setting an error', () => {
      useAIChatStore.getState().setLoading(true);
      expect(useAIChatStore.getState().isLoading).toBe(true);

      useAIChatStore.getState().setError('Timeout');
      expect(useAIChatStore.getState().isLoading).toBe(false);
    });

    it('can clear the error by setting null', () => {
      useAIChatStore.getState().setError('Some error');
      expect(useAIChatStore.getState().error).toBe('Some error');

      useAIChatStore.getState().setError(null);
      expect(useAIChatStore.getState().error).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // clearChat
  // ---------------------------------------------------------------------------

  describe('clearChat', () => {
    it('resets messages to only the welcome message', () => {
      const { addMessage, clearChat } = useAIChatStore.getState();
      addMessage({ role: 'user', content: 'Hello' });
      addMessage({ role: 'assistant', content: 'Hi there' });

      expect(useAIChatStore.getState().messages).toHaveLength(3);

      clearChat();

      const state = useAIChatStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].id).toBe('welcome');
      expect(state.messages[0].role).toBe('assistant');
    });

    it('resets conversationId to null', () => {
      useAIChatStore.getState().setConversationId('conv-abc');
      expect(useAIChatStore.getState().conversationId).toBe('conv-abc');

      useAIChatStore.getState().clearChat();
      expect(useAIChatStore.getState().conversationId).toBeNull();
    });

    it('clears any error', () => {
      useAIChatStore.getState().setError('Some error');
      useAIChatStore.getState().clearChat();
      expect(useAIChatStore.getState().error).toBeNull();
    });

    it('resets isLoading to false', () => {
      useAIChatStore.getState().setLoading(true);
      useAIChatStore.getState().clearChat();
      expect(useAIChatStore.getState().isLoading).toBe(false);
    });
  });
});
