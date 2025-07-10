export function MemoryThresholdSection({ semanticThreshold, setSemanticThreshold, semanticLoading }: { semanticThreshold: number; setSemanticThreshold: (v: number) => void; semanticLoading?: boolean }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl p-3 sm:p-4 mb-4 shadow-inner border border-blue-100 dark:border-slate-600">
      <label htmlFor="semantic-threshold" className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-200 flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Seuil de similarité sémantique : <span className="font-mono bg-blue-100 dark:bg-blue-900/60 px-2 py-1 rounded text-xs">{semanticThreshold}</span>
      </label>
      <input
        id="semantic-threshold"
        type="range"
        min={0.5}
        max={0.95}
        step={0.01}
        value={semanticThreshold}
        onChange={e => setSemanticThreshold(Number(e.target.value))}
        className="w-full h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="text-xs text-muted-foreground mt-1">Plus le seuil est élevé, plus la détection est stricte.</div>
      {semanticLoading && (
        <div className="flex items-center gap-2 mt-2 bg-blue-100 dark:bg-blue-900/60 rounded-lg px-3 py-2 animate-pulse">
          <svg className="animate-spin w-4 h-4 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-xs">Analyse sémantique en cours...</span>
        </div>
      )}
    </div>
  );
} 