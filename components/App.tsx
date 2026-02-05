import React, { useState } from 'react';
import ChatArea from './components/ChatArea';
import IntelDashboard from './components/IntelDashboard';
import { processMessage, generateScamMessage } from './services/geminiService';
import { ChatMessage, Sender, AgentResponse, ExtractedIntel, ConversationState } from './types';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid lib, let's use a simple generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAgentResponse, setLastAgentResponse] = useState<AgentResponse | null>(null);
  
  // Accumulated Intel State
  const [overallIntel, setOverallIntel] = useState<ExtractedIntel>({
    upi_ids: [],
    bank_account_numbers: [],
    phishing_urls: [],
    phone_numbers: [],
    scam_category: "Unknown"
  });

  const handleSendMessage = async (text: string) => {
    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: generateId(),
      sender: Sender.User,
      text: text,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // 2. Call Gemini Service
    try {
      const response = await processMessage(updatedMessages, text);
      
      // 3. Update Intel
      setLastAgentResponse(response);
      setOverallIntel(prev => {
        // Merge arrays without duplicates
        const merge = (arr1: string[], arr2: string[]) => Array.from(new Set([...arr1, ...arr2]));
        
        return {
          upi_ids: merge(prev.upi_ids, response.extracted_intel.upi_ids || []),
          bank_account_numbers: merge(prev.bank_account_numbers, response.extracted_intel.bank_account_numbers || []),
          phishing_urls: merge(prev.phishing_urls, response.extracted_intel.phishing_urls || []),
          phone_numbers: merge(prev.phone_numbers, response.extracted_intel.phone_numbers || []),
          scam_category: response.extracted_intel.scam_category !== "Unknown" ? response.extracted_intel.scam_category : prev.scam_category
        };
      });

      // 4. Add Agent Reply
      const agentMsg: ChatMessage = {
        id: generateId(),
        sender: Sender.Agent,
        text: response.reply_text,
        timestamp: new Date(),
        metadata: response
      };
      setMessages([...updatedMessages, agentMsg]);

    } catch (error) {
      console.error("Failed to process message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScam = async (scenario: string) => {
      setIsLoading(true);
      try {
          // 1. Generate the Scam Message (Mocking the Scammer API)
          const scamText = await generateScamMessage(scenario, messages);
          setIsLoading(false); // Briefly stop loading to show the scammer message being "typed"
          
          // 2. Feed it into the normal flow
          await handleSendMessage(scamText);
      } catch (error) {
          console.error("Simulation failed", error);
          setIsLoading(false);
      }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      {/* Left Panel: Chat Interface (60%) */}
      <div className="w-full md:w-[60%] lg:w-[65%] h-full">
        <ChatArea 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={handleSendMessage}
          onSimulateScam={handleSimulateScam}
        />
      </div>

      {/* Right Panel: Intelligence Dashboard (40%) */}
      <div className="hidden md:block w-[40%] lg:w-[35%] h-full border-l border-slate-800 bg-slate-950">
        <IntelDashboard 
          lastAgentResponse={lastAgentResponse} 
          overallIntel={overallIntel} 
        />
      </div>
    </div>
  );
};

export default App;
