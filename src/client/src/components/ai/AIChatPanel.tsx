import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Trash2,
  Sparkles,
  Loader2,
  Bot,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAIChatStore, dashboardQuickActions, projectQuickActions, type QuickAction } from '../../stores/aiChatStore';
import { useUIStore } from '../../stores/uiStore';
import { AIChatContext } from './AIChatContext';
import { QuickActions } from './QuickActions';

export function AIChatPanel() {
  const { aiPanelOpen, aiPanelContext, toggleAIPanel } = useUIStore();
  const { messages, isLoading, error, addMessage, clearChat, sendMessage } = useAIChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const quickActions = aiPanelContext.type === 'project' ? projectQuickActions : dashboardQuickActions;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    addMessage({ role: 'user', content: trimmed });
    setInput('');
    sendMessage(trimmed, aiPanelContext);
  }

  function handleQuickAction(action: QuickAction) {
    if (isLoading) return;
    addMessage({ role: 'user', content: action.prompt });
    sendMessage(action.prompt, aiPanelContext);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!aiPanelOpen) {
    return (
      <button
        onClick={toggleAIPanel}
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-ai-primary px-4 py-3 text-white shadow-lg transition-all hover:bg-ai-primary-hover hover:shadow-xl"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-ai-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Powered by Claude</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={toggleAIPanel}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Context Bar */}
      <AIChatContext context={aiPanelContext} />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === 'assistant'
                    ? 'bg-ai-surface text-ai-primary'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.role === 'assistant'
                    ? 'bg-gray-50 text-gray-800'
                    : 'bg-ai-primary text-white'
                }`}
              >
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={j}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
                {message.isStreaming && (
                  <span className="ml-1 inline-block h-4 w-1.5 animate-ai-typing rounded-full bg-ai-primary" />
                )}
              </div>
            </div>
          ))}

          {isLoading && !messages.some(m => m.isStreaming) && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ai-surface text-ai-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-4 py-3">
                <span className="h-2 w-2 animate-ai-typing rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-ai-typing rounded-full bg-gray-400" style={{ animationDelay: '200ms' }} />
                <span className="h-2 w-2 animate-ai-typing rounded-full bg-gray-400" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2">
          <button
            onClick={scrollToBottom}
            className="rounded-full bg-white p-1.5 shadow-md ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
          >
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <QuickActions actions={quickActions} onAction={handleQuickAction} />
      )}

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your projects..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-ai-primary focus:outline-none focus:ring-1 focus:ring-ai-primary"
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-ai-primary text-white transition-colors hover:bg-ai-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
