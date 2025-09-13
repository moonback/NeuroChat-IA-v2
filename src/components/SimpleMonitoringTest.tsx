import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SimpleMonitoringTest() {
  const [showTest, setShowTest] = useState(false);

  if (!showTest) {
    return (
      <Button
        onClick={() => setShowTest(true)}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
      >
        Test Simple
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test de Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Le monitoring fonctionne !</p>
          <Button 
            onClick={() => setShowTest(false)}
            className="mt-4"
          >
            Fermer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
