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
  addEvent: (event: Omit<AgendaEvent, 'id'>) => string;
  updateEvent: (id: string, updates: Partial<AgendaEvent>) => boolean;
  deleteEvent: (id: string) => boolean;
  getEventById: (id: string) => AgendaEvent | undefined;
  getEventsByDate: (date: Date) => AgendaEvent[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => AgendaEvent[];
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

  // Ajouter un événement
  const addEvent = useCallback((eventData: Omit<AgendaEvent, 'id'>): string => {
    const newEvent: AgendaEvent = {
      ...eventData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updatedEvents = [...events, newEvent].sort((a, b) => a.start.getTime() - b.start.getTime());
    setEventsState(updatedEvents);
    localStorage.setItem(LOCALSTORAGE_ICAL, JSON.stringify(updatedEvents));
    return newEvent.id;
  }, [events]);

  // Modifier un événement
  const updateEvent = useCallback((id: string, updates: Partial<AgendaEvent>): boolean => {
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return false;
    
    const updatedEvents = [...events];
    updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], ...updates };
    const sortedEvents = updatedEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    setEventsState(sortedEvents);
    localStorage.setItem(LOCALSTORAGE_ICAL, JSON.stringify(sortedEvents));
    return true;
  }, [events]);

  // Supprimer un événement
  const deleteEvent = useCallback((id: string): boolean => {
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return false;
    
    const updatedEvents = events.filter(e => e.id !== id);
    setEventsState(updatedEvents);
    localStorage.setItem(LOCALSTORAGE_ICAL, JSON.stringify(updatedEvents));
    return true;
  }, [events]);

  // Obtenir un événement par ID
  const getEventById = useCallback((id: string): AgendaEvent | undefined => {
    return events.find(e => e.id === id);
  }, [events]);

  // Obtenir les événements d'une date spécifique
  const getEventsByDate = useCallback((date: Date): AgendaEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  // Obtenir les événements dans une plage de dates
  const getEventsByDateRange = useCallback((startDate: Date, endDate: Date): AgendaEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }, [events]);

  return (
    <AgendaContext.Provider value={{ 
      events, 
      setEvents, 
      addEvent, 
      updateEvent, 
      deleteEvent, 
      getEventById, 
      getEventsByDate, 
      getEventsByDateRange 
    }}>
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda doit être utilisé dans un AgendaProvider');
  return ctx;
} 