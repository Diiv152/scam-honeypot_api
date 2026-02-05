import React, { useEffect, useRef } from 'react';
import { Send, User, Bot, ShieldAlert, Zap, Skull } from 'lucide-react';
import { ChatMessage, Sender } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onSimulateScam: (scenario: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, onSendMessage, onSimulateScam }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900 flex flex-col gap-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h2 className="text-slate-100 font-semibold text-lg">Live Scam Simulator</h2>
                    <p className="text-xs text-slate-400">Autonomous Honey-Pot System</p>
                </div>
            </div>
        </div>

        {/* Mock Scammer Controls */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-mono text-slate-500 uppercase self-center mr-2 hidden md:block">Simulate Attack:</span>
            <button 
                onClick={() => onSimulateScam("Lottery Fraud")}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors whitespace-nowrap"
            >
                <Zap size={12} className="text-yellow-400" />
                Lottery
            </button>
            <button 
                onClick={() => onSimulateScam("Part-time Job Scam")}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors whitespace-nowrap"
            >
                <Zap size={12} className="text-blue-400" />
                Job Offer
            </button>
            <button 
                onClick={() => onSimulateScam("Bank KYC Phishing")}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors whitespace-nowrap"
            >
                <Zap size={12} className="text-red-400" />
                Bank KYC
            </button>
            <button 
                onClick={() => onSimulateScam("Sextortion or Blackmail")}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors whitespace-nowrap"
            >
                <Skull size={12} className="text-purple-400" />
                Threats
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <ShieldAlert className="w-16 h-16 mb-4" />
                <p>No messages yet.</p>
                <p className="text-sm">Type manually or use the "Simulate Attack" buttons.</p>
            </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${
              msg.sender === Sender.User ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex max-w-[80%] gap-3 ${
                msg.sender === Sender.User ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === Sender.User
                    ? 'bg-purple-600'
                    : 'bg-emerald-600'
                }`}
              >
                {msg.sender === Sender.User ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === Sender.User
                    ? 'bg-purple-600/20 text-purple-100 border border-purple-600/30 rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div className="mt-1 text-[10px] opacity-50 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot size={14} />
                </div>
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message manually..."
            className="w-full bg-slate-800 text-slate-100 border border-slate-600 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;
