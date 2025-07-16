import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface AgendaEvent {
  id: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  organizer?: string;
  isAllDay: boolean;
}

interface AgendaContextType {
  events: AgendaEvent[];
  setEvents: (events: AgendaEvent[]) => void;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

const LOCALSTORAGE_ICAL = 'user_ical_events';

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [events, setEventsState] = useState<AgendaEvent[]>([]);

  // Charger depuis le localStorage au montage
  useEffect(() => {
    const raw = localStorage.getItem(LOCALSTORAGE_ICAL);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const restored = parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEventsState(restored);
      } catch {
        setEventsState([]);
      }
    }
  }, []);

  // Sauvegarder à chaque modification
  const setEvents = useCallback((newEvents: AgendaEvent[]) => {
    setEventsState(newEvents);
    localStorage.setItem(LOCALSTORAGE_ICAL, JSON.stringify(newEvents));
  }, []);

  return (
    <AgendaContext.Provider value={{ events, setEvents }}>
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda doit être utilisé dans un AgendaProvider');
  return ctx;
} 