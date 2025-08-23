/**
 * 🧪 Tests ElevenLabs TTS - NeuroChat-IA-v2
 * 
 * Tests unitaires et d'intégration pour la synthèse vocale ElevenLabs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeElevenLabs,
  getVoices,
  getModels,
  generateSpeech,
  testVoice,
  validateApiKey,
  getUsageStats,
  clearCache,
  filterVoicesByLanguage,
  getOptimalSettingsForLanguage,
} from '../services/elevenLabsApi';

// Mock de l'environnement
const mockEnv = {
  VITE_ELEVENLABS_API_KEY: 'test_api_key_123',
};

// Mock de fetch
global.fetch = vi.fn();

describe('ElevenLabs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
    // Mock de l'environnement
    Object.defineProperty(import.meta, 'env', {
      value: mockEnv,
      writable: true,
    });
  });

  afterEach(() => {
    clearCache();
  });

  describe('Configuration', () => {
    it('devrait initialiser ElevenLabs avec une clé API valide', () => {
      expect(() => initializeElevenLabs('valid_key')).not.toThrow();
    });

    it('devrait rejeter une clé API vide', () => {
      expect(() => initializeElevenLabs('')).toThrow('Clé API ElevenLabs requise');
    });

    it('devrait rejeter une clé API null', () => {
      expect(() => initializeElevenLabs(null as any)).toThrow('Clé API ElevenLabs requise');
    });
  });

  describe('Validation de clé API', () => {
    it('devrait valider une clé API valide', async () => {
      // Mock d'une réponse réussie
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ voice_id: 'test', name: 'Test Voice' }],
      });

      const result = await validateApiKey();
      expect(result).toBe(true);
    });

    it('devrait rejeter une clé API invalide', async () => {
      // Mock d'une réponse d'erreur
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await validateApiKey();
      expect(result).toBe(false);
    });
  });

  describe('Récupération des voix', () => {
    it('devrait récupérer la liste des voix', async () => {
      const mockVoices = [
        { voice_id: '1', name: 'Rachel', category: 'cloned', labels: { language: 'english' } },
        { voice_id: '2', name: 'Antoine', category: 'cloned', labels: { language: 'french' } },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVoices,
      });

      const voices = await getVoices();
      expect(voices).toHaveLength(2);
      expect(voices[0].name).toBe('Rachel');
      expect(voices[1].name).toBe('Antoine');
    });

    it('devrait utiliser le cache pour les requêtes suivantes', async () => {
      const mockVoices = [{ voice_id: '1', name: 'Test' }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVoices,
      });

      // Première requête
      await getVoices();
      // Deuxième requête (devrait utiliser le cache)
      await getVoices();

      // fetch ne devrait être appelé qu'une seule fois
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Récupération des modèles', () => {
    it('devrait récupérer la liste des modèles', async () => {
      const mockModels = [
        { model_id: '1', name: 'Eleven Multilingual v2', language: 'multilingual' },
        { model_id: '2', name: 'Eleven English v2', language: 'english' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockModels,
      });

      const models = await getModels();
      expect(models).toHaveLength(2);
      expect(models[0].name).toBe('Eleven Multilingual v2');
    });
  });

  describe('Génération de synthèse vocale', () => {
    it('devrait générer de l\'audio à partir de texte', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/mp3' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockAudioBlob,
      });

      const result = await generateSpeech('Test text', { voice_id: 'test_voice' });
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('audio/mp3');
    });

    it('devrait utiliser les paramètres par défaut', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/mp3' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockAudioBlob,
      });

      await generateSpeech('Test text', { voice_id: 'test_voice' });

      // Vérifier que la requête contient les paramètres par défaut
      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.model_id).toBe('eleven_multilingual_v2');
      expect(requestBody.voice_settings.stability).toBe(0.5);
      expect(requestBody.voice_settings.similarity_boost).toBe(0.75);
    });
  });

  describe('Test de voix', () => {
    it('devrait tester une voix avec du texte par défaut', async () => {
      const mockAudioBlob = new Blob(['test audio'], { type: 'audio/mp3' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockAudioBlob,
      });

      const result = await testVoice('test_voice');
      expect(result).toBeInstanceOf(Blob);
    });

    it('devrait tester une voix avec du texte personnalisé', async () => {
      const mockAudioBlob = new Blob(['custom audio'], { type: 'audio/mp3' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockAudioBlob,
      });

      const result = await testVoice('test_voice', 'Texte personnalisé');
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('Filtrage des voix', () => {
    it('devrait filtrer les voix par langue', () => {
      const voices = [
        { voice_id: '1', name: 'Rachel', labels: { language: 'english' } },
        { voice_id: '2', name: 'Antoine', labels: { language: 'french' } },
        { voice_id: '3', name: 'Maria', labels: { language: 'spanish' } },
      ];

      const frenchVoices = filterVoicesByLanguage(voices, 'french');
      expect(frenchVoices).toHaveLength(1);
      expect(frenchVoices[0].name).toBe('Antoine');

      const englishVoices = filterVoicesByLanguage(voices, 'english');
      expect(englishVoices).toHaveLength(1);
      expect(englishVoices[0].name).toBe('Rachel');
    });

    it('devrait gérer les voix sans label de langue', () => {
      const voices = [
        { voice_id: '1', name: 'Unknown', labels: {} },
        { voice_id: '2', name: 'French', labels: { language: 'french' } },
      ];

      const filtered = filterVoicesByLanguage(voices, 'french');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('French');
    });
  });

  describe('Paramètres optimaux par langue', () => {
    it('devrait retourner les paramètres pour le français', () => {
      const settings = getOptimalSettingsForLanguage('fr');
      expect(settings.stability).toBe(0.6);
      expect(settings.similarity_boost).toBe(0.8);
      expect(settings.style).toBe(0.1);
    });

    it('devrait retourner les paramètres pour l\'anglais', () => {
      const settings = getOptimalSettingsForLanguage('en');
      expect(settings.stability).toBe(0.5);
      expect(settings.similarity_boost).toBe(0.75);
      expect(settings.style).toBe(0.0);
    });

    it('devrait retourner les paramètres par défaut pour les langues inconnues', () => {
      const settings = getOptimalSettingsForLanguage('unknown');
      expect(settings.stability).toBe(0.5);
      expect(settings.similarity_boost).toBe(0.75);
      expect(settings.style).toBe(0.0);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de réseau', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(getVoices()).rejects.toThrow('Network error');
    });

    it('devrait gérer les erreurs d\'API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ detail: 'Invalid request' }),
      });

      await expect(generateSpeech('test', { voice_id: 'invalid' }))
        .rejects.toThrow('ElevenLabs API Error 400: Invalid request');
    });

    it('devrait gérer les timeouts', async () => {
      // Mock d'un timeout
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(generateSpeech('test', { voice_id: 'test' }))
        .rejects.toThrow('Timeout');
    });
  });

  describe('Cache et performance', () => {
    it('devrait nettoyer le cache', () => {
      expect(() => clearCache()).not.toThrow();
    });

    it('devrait expirer le cache après la durée configurée', async () => {
      const mockVoices = [{ voice_id: '1', name: 'Test' }];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockVoices,
      });

      // Première requête
      await getVoices();
      
      // Simuler l'expiration du cache
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000); // 5 minutes + 1 seconde
      
      // Deuxième requête (devrait recharger)
      await getVoices();

      // fetch devrait être appelé deux fois
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Statistiques d\'utilisation', () => {
    it('devrait récupérer les statistiques d\'utilisation', async () => {
      const mockStats = {
        character_count: 1000,
        tier: 'free',
        next_character_count_reset: '2024-01-01',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const stats = await getUsageStats();
      expect(stats.character_count).toBe(1000);
      expect(stats.tier).toBe('free');
    });

    it('devrait gérer les erreurs de statistiques', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const stats = await getUsageStats();
      expect(stats).toBeNull();
    });
  });
});

// Tests d'intégration
describe('ElevenLabs TTS - Intégration', () => {
  it('devrait fonctionner avec une configuration complète', async () => {
    // Configuration
    initializeElevenLabs('test_key');

    // Mock des réponses
    const mockVoices = [{ voice_id: '1', name: 'Test Voice' }];
    const mockModels = [{ model_id: '1', name: 'Test Model' }];
    const mockAudio = new Blob(['audio'], { type: 'audio/mp3' });

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockVoices })
      .mockResolvedValueOnce({ ok: true, json: async () => mockModels })
      .mockResolvedValueOnce({ ok: true, blob: async () => mockAudio });

    // Test du workflow complet
    const voices = await getVoices();
    const models = await getModels();
    const audio = await generateSpeech('Test', { voice_id: '1' });

    expect(voices).toHaveLength(1);
    expect(models).toHaveLength(1);
    expect(audio).toBeInstanceOf(Blob);
  });
});
