// pages/index.js (or app/page.js if using app router)
'use client'
import { useState } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to help you with Hindu Online Marriage Registration in Karnataka through the Kaveri portal. How can I assist you today? 😊",
      isUser: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }), // Fixed: send the actual message text
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: data.message, // Fixed: use data.message instead of data.response
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, something went wrong. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    

      {/* Chat Container */}
      <div className="max-w-4xl h-screen mx-auto ">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Messages Area */}
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <span className={`text-xs mt-1 block ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about marriage certificate registration..."
                rows="2"
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputText.trim()}
                className="bg-black text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
           
          </div>
        </div>

      </div>
    </div>
  );
}