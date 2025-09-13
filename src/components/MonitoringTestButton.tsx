import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SecurityPerformanceMonitor } from '@/components/SecurityPerformanceMonitor';

export function MonitoringTestButton() {
  const [showMonitor, setShowMonitor] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-4 right-4 z-50"
        variant="outline"
      >
        Test Monitoring
      </Button>
      
      {showMonitor && (
        <SecurityPerformanceMonitor 
          isOpen={showMonitor}
          onClose={() => setShowMonitor(false)}
        />
      )}
    </>
  );
}
