import React from 'react';

interface MemoryFeedbackProps {
  loading: boolean;
  score: number | null;
}

export const MemoryFeedback: React.FC<MemoryFeedbackProps> = ({ loading, score }) => {
  if (!loading && score === null) return null;
  return (
    <div className="flex items-center gap-2 mt-2">
      {loading && (
        <>
          <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
          <span className="text-blue-700 text-sm">Analyse sémantique en cours...</span>
        </>
      )}
      {!loading && score !== null && (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${score > 0.7 ? 'bg-green-200 text-green-800' : score > 0.4 ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'}`}>
          Similarité : {(score * 100).toFixed(1)}%
        </span>
      )}
    </div>
  );
}; 