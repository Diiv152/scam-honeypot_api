import React from 'react';
import { ConversationState } from '../types';

interface StatusBadgeProps {
  state: ConversationState | 'SCAM' | 'LEGIT' | 'UNCERTAIN';
  type: 'state' | 'classification';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ state, type }) => {
  let colorClass = "bg-gray-700 text-gray-300";

  if (type === 'state') {
    switch (state) {
      case ConversationState.DETECTION:
        colorClass = "bg-blue-900/50 text-blue-200 border border-blue-700";
        break;
      case ConversationState.ENGAGEMENT:
        colorClass = "bg-yellow-900/50 text-yellow-200 border border-yellow-700";
        break;
      case ConversationState.EXTRACTION:
        colorClass = "bg-red-900/50 text-red-200 border border-red-700 animate-pulse";
        break;
    }
  } else {
    switch (state) {
      case 'SCAM':
        colorClass = "bg-red-600 text-white font-bold";
        break;
      case 'LEGIT':
        colorClass = "bg-green-600 text-white";
        break;
      case 'UNCERTAIN':
        colorClass = "bg-gray-600 text-gray-200";
        break;
    }
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-mono uppercase tracking-wider ${colorClass}`}>
      {state}
    </span>
  );
};

export default StatusBadge;
