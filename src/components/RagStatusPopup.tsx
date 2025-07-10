import React from 'react';

interface RagStatusPopupProps {
  activated: boolean;
  deactivated: boolean;
}

export const RagStatusPopup: React.FC<RagStatusPopupProps> = ({ activated, deactivated }) => {
  if (!activated && !deactivated) return null;
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-2 animate-fadeIn ${activated ? 'bg-green-600' : 'bg-red-600'}`}>
      {activated ? (
        <>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" className="stroke-white" /><path d="M9 12l2 2 4-4" className="stroke-white" /></svg>
          RAG activé !
        </>
      ) : (
        <>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" className="stroke-white" /><path d="M15 9l-6 6M9 9l6 6" className="stroke-white" /></svg>
          RAG désactivé
        </>
      )}
    </div>
  );
}; 