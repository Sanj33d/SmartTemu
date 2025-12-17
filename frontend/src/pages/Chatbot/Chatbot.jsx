import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../services/chatbotService';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your SmartTemu shopping assistant. I can help you find products, check prices, and answer questions about our store. What are you looking for today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Send message to API
      const response = await sendChatMessage(userMessage);
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
          context: response.data.context,
        },
      ]);
    } catch (error) {
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action buttons
  const quickActions = [
    'What products do you have?',
    'Show me electronics',
    'Products under $50',
    'What categories are available?',
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">AI Shopping Assistant</h1>
          <p className="text-base-content/70">
            Ask me anything about our products and I'll help you find what you need!
          </p>
        </div>

        {/* Chat Container */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-0">
            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat ${
                    message.role === 'user' ? 'chat-end' : 'chat-start'
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      {message.role === 'user' ? (
                        <div className="bg-primary w-full h-full flex items-center justify-center text-primary-content font-bold">
                          U
                        </div>
                      ) : (
                        <div className="bg-secondary w-full h-full flex items-center justify-center text-secondary-content font-bold">
                          AI
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                    <time className="text-xs opacity-50 ml-2">
                      {new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble ${
                      message.role === 'user'
                        ? 'chat-bubble-primary'
                        : message.isError
                        ? 'chat-bubble-error'
                        : 'chat-bubble-secondary'
                    } whitespace-pre-wrap`}
                  >
                    {message.content}
                  </div>
                  {message.context && (
                    <div className="chat-footer opacity-50 text-xs mt-1">
                      Found {message.context.productsFound} products
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <div className="bg-secondary w-full h-full flex items-center justify-center text-secondary-content font-bold">
                        AI
                      </div>
                    </div>
                  </div>
                  <div className="chat-bubble chat-bubble-secondary">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-6 pb-4">
                <p className="text-sm text-base-content/70 mb-2">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="btn btn-sm btn-outline"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-base-300 p-4">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about products, prices, categories..."
                  className="input input-bordered flex-1"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">🛍️</div>
              <h3 className="font-bold">Product Search</h3>
              <p className="text-sm text-base-content/70">
                Find products by name, category, or price range
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold">Price Queries</h3>
              <p className="text-sm text-base-content/70">
                Ask about prices and filter by budget
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold">Store Info</h3>
              <p className="text-sm text-base-content/70">
                Get details about categories and availability
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

