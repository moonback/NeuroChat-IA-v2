import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, X, Download, Upload, Filter, Search, ChevronLeft } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday, isThisWeek, isThisYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import ICAL from 'ical.js';
import { useAgenda } from '@/hooks/AgendaContext';

interface ICalEvent {
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

interface ICalViewerModalProps {
  open: boolean;
  onClose: () => void;
}

export function ICalViewerModal({ open, onClose }: ICalViewerModalProps) {
  const [events, setEvents] = useState<ICalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ICalEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { setEvents: setAgendaEvents } = useAgenda();
  // Clé de persistance
  const LOCALSTORAGE_ICAL = 'user_ical_events';

  // Charger les événements depuis le localStorage au montage
  useEffect(() => {
    if (!open) return; // Ne charger que quand le modal est ouvert
    
    const raw = localStorage.getItem(LOCALSTORAGE_ICAL);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // On reconstruit les dates
        const restored = parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(restored);
        setFilteredEvents(restored);
        setShowCalendar(true); // Afficher le calendrier si des événements existent
        // Synchronise le contexte global
        setAgendaEvents(restored);
      } catch {
        setEvents([]);
        setFilteredEvents([]);
        setAgendaEvents([]);
        setShowCalendar(false);
      }
    } else {
      setEvents([]);
      setFilteredEvents([]);
      setAgendaEvents([]);
      setShowCalendar(false);
    }
  }, [open, setAgendaEvents]);

  // Fonction pour parser un fichier iCal
  const parseICalFile = useCallback((content: string): ICalEvent[] => {
    try {
      const jcalData = ICAL.parse(content);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');
      
      return vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent);
        const start = event.startDate?.toJSDate();
        const end = event.endDate?.toJSDate();
        
        return {
          id: event.uid || Math.random().toString(36).substr(2, 9),
          summary: event.summary || 'Sans titre',
          description: event.description,
          start: start || new Date(),
          end: end || new Date(),
          location: event.location,
          attendees: event.attendees?.map((a: any) => String(a)) || [],
          organizer: event.organizer ? String(event.organizer) : undefined,
          isAllDay: event.startDate?.isDate || false,
        };
      }).sort((a: ICalEvent, b: ICalEvent) => a.start.getTime() - b.start.getTime());
    } catch (err) {
      console.error('Erreur lors du parsing iCal:', err);
      throw new Error('Format de fichier iCal invalide');
    }
  }, []);

  // Gestion du fichier uploadé
  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await file.text();
      const parsedEvents = parseICalFile(content);
      setEvents(parsedEvents);
      setFilteredEvents(parsedEvents);
      localStorage.setItem(LOCALSTORAGE_ICAL, JSON.stringify(parsedEvents));
      setAgendaEvents(parsedEvents); // Met à jour le contexte global
      setShowCalendar(true); // Afficher le calendrier après import
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du fichier');
    } finally {
      setIsLoading(false);
    }
  }, [parseICalFile, setAgendaEvents]);

  // Filtrage des événements
  useEffect(() => {
    let filtered = events;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par période
    const now = new Date();
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(event => isToday(event.start));
        break;
      case 'week':
        filtered = filtered.filter(event => isThisWeek(event.start, { weekStartsOn: 1 }));
        break;
      case 'month':
        filtered = filtered.filter(event => {
          const eventMonth = event.start.getMonth();
          const eventYear = event.start.getFullYear();
          return eventMonth === now.getMonth() && eventYear === now.getFullYear();
        });
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedFilter]);

  // Fonction pour formater la date relative
  const formatRelativeDate = (date: Date): string => {
    if (isToday(date)) return 'Aujourd\'hui';
    if (isTomorrow(date)) return 'Demain';
    if (isYesterday(date)) return 'Hier';
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  // Fonction pour formater l'heure
  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
  };

  // Fonction pour obtenir la couleur de l'événement
  const getEventColor = (event: ICalEvent): string => {
    if (event.isAllDay) return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (isToday(event.start)) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (event.start < new Date()) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';
  };

  // Fonction pour obtenir les événements d'une date
  const getEventsForDate = (date: Date): ICalEvent[] => {
    return events.filter(event => isSameDay(event.start, date));
  };

  // Fonction pour générer les jours du calendrier
  const getCalendarDays = (month: Date) => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  // Navigation du calendrier
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Composant pour afficher un jour du calendrier
  const CalendarDay = ({ date, isCurrentMonth }: { date: Date; isCurrentMonth: boolean }) => {
    const dayEvents = getEventsForDate(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);

    return (
      <div
        className={`min-h-[80px] p-1 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
          isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
        } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        onClick={() => setSelectedDate(date)}
      >
        <div className={`text-xs font-medium mb-1 ${
          isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
        } ${isTodayDate ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
          {format(date, 'd')}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className={`text-xs p-1 rounded truncate ${
                event.isAllDay 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              }`}
              title={event.summary}
            >
              {event.summary}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{dayEvents.length - 2} autres
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showCalendar ? 'Calendrier Agenda' : 'Visualiseur d\'Agenda iCal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showCalendar ? (
            // Interface d'import
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Importer votre fichier iCal
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Glissez-déposez votre fichier .ics ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  accept=".ics"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="ical-file-input"
                />
                <label
                  htmlFor="ical-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Sélectionner un fichier
                </label>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>
          ) : (
            // Interface du calendrier
            <div className="space-y-6">
              {/* Contrôles du calendrier */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </h3>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* Calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {/* En-têtes des jours */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                
                {/* Jours du calendrier */}
                {getCalendarDays(currentMonth).map((date, index) => (
                  <CalendarDay
                    key={index}
                    date={date}
                    isCurrentMonth={isSameMonth(date, currentMonth)}
                  />
                ))}
              </div>

              {/* Événements du jour sélectionné */}
              {selectedDate && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Événements du {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </h4>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border ${getEventColor(event)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {event.summary}
                              </h3>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>
                                    {event.isAllDay 
                                      ? 'Toute la journée'
                                      : `${formatTime(event.start)} - ${formatTime(event.end)}`
                                    }
                                  </span>
                                </div>
                              </div>

                              {event.location && (
                                <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{event.location}</span>
                                </div>
                              )}

                              {event.description && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Aucun événement pour cette date
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Bouton pour revenir à l'import */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowCalendar(false);
                    setEvents([]);
                    setFilteredEvents([]);
                    setAgendaEvents([]);
                    localStorage.removeItem(LOCALSTORAGE_ICAL);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Importer un autre fichier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 