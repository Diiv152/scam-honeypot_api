
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, Smartphone, Globe, CreditCard, Activity, Lock, AlertTriangle, Code, LayoutDashboard, Terminal, Copy, Check } from 'lucide-react';
import { AgentResponse, ConversationState, ExtractedIntel } from '../types';
import StatusBadge from './StatusBadge';

interface IntelDashboardProps {
  lastAgentResponse: AgentResponse | null;
  overallIntel: ExtractedIntel;
}

const IntelDashboard: React.FC<IntelDashboardProps> = ({ lastAgentResponse, overallIntel }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json' | 'api'>('visual');
  const [copied, setCopied] = useState(false);

  const confidenceData = [
    {
      name: 'Scam Confidence',
      score: lastAgentResponse ? lastAgentResponse.confidence_score * 100 : 0,
    },
  ];

  const hasIntel = 
    overallIntel.upi_ids.length > 0 ||
    overallIntel.bank_account_numbers.length > 0 ||
    overallIntel.phishing_urls.length > 0 ||
    overallIntel.phone_numbers.length > 0;

  const requiredJsonOutput = lastAgentResponse ? {
      classification: lastAgentResponse.classification,
      confidence_score: lastAgentResponse.confidence_score,
      current_state: lastAgentResponse.current_state,
      agent_response: lastAgentResponse.reply_text,
      extracted_intel: {
        upi: lastAgentResponse.extracted_intel.upi_ids,
        links: lastAgentResponse.extracted_intel.phishing_urls,
        bank_details: lastAgentResponse.extracted_intel.bank_account_numbers,
        phones: lastAgentResponse.extracted_intel.phone_numbers,
        category: lastAgentResponse.extracted_intel.scam_category
      },
      explanation: lastAgentResponse.explanation
  } : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-6 flex flex-col">
      
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-emerald-500" />
            System Control
          </h2>
        </div>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
                onClick={() => setViewMode('visual')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'visual' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                title="Visual Dashboard"
            >
                <LayoutDashboard size={18} />
            </button>
            <button 
                onClick={() => setViewMode('json')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'json' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Structured JSON Log"
            >
                <Code size={18} />
            </button>
            <button 
                onClick={() => setViewMode('api')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'api' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Public API Console"
            >
                <Terminal size={18} />
            </button>
        </div>
      </div>

      {viewMode === 'visual' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-2 uppercase font-semibold">Current State</p>
                <StatusBadge type="state" state={lastAgentResponse?.current_state || ConversationState.DETECTION} />
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-2 uppercase font-semibold">Classification</p>
                <StatusBadge type="classification" state={lastAgentResponse?.classification || 'UNCERTAIN'} />
                </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Scam Confidence</p>
                    <span className="text-emerald-400 font-mono text-lg font-bold">
                        {lastAgentResponse ? (lastAgentResponse.confidence_score * 100).toFixed(1) : 0}%
                    </span>
                </div>
                <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={confidenceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                        <Cell fill={(lastAgentResponse?.confidence_score || 0) > 0.8 ? '#ef4444' : (lastAgentResponse?.confidence_score || 0) > 0.5 ? '#f59e0b' : '#10b981'} />
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-md font-semibold text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    Extracted Intelligence
                </h3>
                {!hasIntel && <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">No actionable intelligence yet.</div>}
                {overallIntel.upi_ids.length > 0 && <IntelCard title="UPI IDs" icon={<CreditCard size={16} className="text-purple-400" />} items={overallIntel.upi_ids} color="border-purple-900 bg-purple-900/10" />}
                {overallIntel.bank_account_numbers.length > 0 && <IntelCard title="Bank Details" icon={<Shield size={16} className="text-blue-400" />} items={overallIntel.bank_account_numbers} color="border-blue-900 bg-blue-900/10" />}
                {overallIntel.phishing_urls.length > 0 && <IntelCard title="Links" icon={<Globe size={16} className="text-orange-400" />} items={overallIntel.phishing_urls} color="border-orange-900 bg-orange-900/10" />}
            </div>
        </div>
      )}

      {viewMode === 'json' && (
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-auto animate-in fade-in duration-300">
            <h3 className="text-slate-400 mb-2 uppercase font-bold tracking-wider border-b border-slate-800 pb-2 flex justify-between">
                Structured Response 
                <span className="text-[10px] text-emerald-500 lowercase font-normal">content-type: application/json</span>
            </h3>
            {requiredJsonOutput ? (
                <pre className="text-emerald-400 whitespace-pre-wrap">
                    {JSON.stringify(requiredJsonOutput, null, 2)}
                </pre>
            ) : (
                <div className="text-slate-600 italic">Waiting for API request...</div>
            )}
        </div>
      )}

      {viewMode === 'api' && (
        <div className="flex-1 space-y-4 animate-in fade-in duration-300">
            <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-xl">
                <h3 className="text-blue-300 font-bold text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={14} /> Public API Endpoint
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Live URL (Mocked for Demo)</p>
                        <div className="flex gap-2">
                            <code className="bg-slate-950 p-2 rounded border border-slate-800 text-xs text-blue-400 flex-1 truncate">
                                https://agentic-honeypot.api/v1/engage
                            </code>
                            <button onClick={() => copyToClipboard("https://agentic-honeypot.api/v1/engage")} className="p-2 bg-slate-800 rounded hover:bg-slate-700">
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Authentication Key (X-API-KEY)</p>
                        <div className="flex gap-2">
                            <code className="bg-slate-950 p-2 rounded border border-slate-800 text-xs text-emerald-400 flex-1">
                                HONEYPOT_SECURE_EXTRACTION_2025
                            </code>
                            <button onClick={() => copyToClipboard("HONEYPOT_SECURE_EXTRACTION_2025")} className="p-2 bg-slate-800 rounded hover:bg-slate-700">
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-blue-800/50 pt-4">
                    <p className="text-xs text-blue-200 mb-2 font-semibold">Quick Start Guide:</p>
                    <div className="bg-slate-950 p-3 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p className="text-emerald-500"># Call using cURL</p>
                        <p>curl -X POST https://your-live-url.com/api/v1/engage \</p>
                        <p>  -H "X-API-KEY: HONEYPOT_SECURE_EXTRACTION_2025" \</p>
                        <p>  -H "Content-Type: application/json" \</p>
                        <p>  -d '{"message": "I have your prize money!", "history": []}'</p>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    The structured JSON output is verified against the challenge criteria. You can toggle to the <strong>JSON tab</strong> above to see the raw API responses in real-time.
                </p>
            </div>
        </div>
      )}

    </div>
  );
};

const IntelCard: React.FC<{ title: string; icon: React.ReactNode; items: string[]; color: string }> = ({ title, icon, items, color }) => (
    <div className={`p-4 rounded-lg border ${color}`}>
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</span>
        </div>
        <ul className="space-y-1">
            {items.map((item, idx) => (
                <li key={idx} className="font-mono text-sm text-slate-100 break-all bg-slate-950/50 p-1.5 rounded">{item}</li>
            ))}
        </ul>
    </div>
);

export default IntelDashboard;
