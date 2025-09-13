import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonitoringStatusIndicator } from '@/components/MonitoringStatusIndicator';

export function MonitoringIndicatorTest() {
  const [showIndicator, setShowIndicator] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={() => setShowIndicator(!showIndicator)}
        variant="outline"
        size="sm"
      >
        {showIndicator ? 'Masquer' : 'Afficher'} Indicateur
      </Button>
      
      {showIndicator && (
        <MonitoringStatusIndicator 
          onOpenMonitor={() => alert('Monitoring ouvert !')}
          compact={true}
        />
      )}
    </div>
  );
}
