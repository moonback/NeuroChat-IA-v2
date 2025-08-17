import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { memoryItems } from '../db/schema.js';
import { eq, and, desc, asc, sql, like } from 'drizzle-orm';

const router = Router();

// Schémas de validation
const createMemoryItemSchema = z.object({
  workspaceId: z.string().min(1),
  content: z.string().min(1),
  embedding: z.array(z.number()).optional(),
  tags: z.string().optional(),
  importance: z.number().min(1).max(5).default(3),
  source: z.enum(['user', 'assistant', 'system']).default('user'),
});

const updateMemoryItemSchema = z.object({
  content: z.string().min(1).optional(),
  embedding: z.array(z.number()).optional(),
  tags: z.string().optional(),
  importance: z.number().min(1).max(5).optional(),
  source: z.enum(['user', 'assistant', 'system']).optional(),
});

const searchMemorySchema = z.object({
  query: z.string().optional(),
  embedding: z.array(z.number()).optional(),
  limit: z.number().min(1).max(100).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
  includeEmbeddings: z.boolean().default(false),
});

const importMemorySchema = z.object({
  items: z.array(z.object({
    content: z.string().min(1),
    embedding: z.array(z.number()).optional(),
    tags: z.string().optional(),
    importance: z.number().min(1).max(5).default(3),
    source: z.enum(['user', 'assistant', 'system']).default('user'),
  })),
  replaceExisting: z.boolean().default(false),
});

const generateEmbeddingSchema = z.object({
  text: z.string().min(1),
});

/**
 * Calcule la similarité cosinus entre deux vecteurs
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Génère un embedding simple (simulation)
 * Dans un vrai projet, utiliser OpenAI, Cohere, ou un modèle local
 */
function generateSimpleEmbedding(text: string): number[] {
  // Simulation d'un embedding de 384 dimensions
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // Hash simple basé sur les mots
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode + i * j) % 384;
      embedding[index] += Math.sin(charCode * 0.1) * 0.1;
    }
  }
  
  // Normaliser
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (norm || 1));
}

/**
 * GET /api/memory/:workspaceId
 * Récupère tous les éléments de mémoire d'un workspace
 */
router.get('/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Construire la requête
    let items;
    if (limit) {
      items = await db
        .select()
        .from(memoryItems)
        .where(eq(memoryItems.workspaceId, workspaceId))
        .orderBy(desc(memoryItems.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      items = await db
        .select()
        .from(memoryItems)
        .where(eq(memoryItems.workspaceId, workspaceId))
        .orderBy(desc(memoryItems.createdAt));
    }
    
    // Compter le total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(memoryItems)
      .where(eq(memoryItems.workspaceId, workspaceId));
    
    res.json({
      items: items.map(item => ({
        ...item,
        embedding: item.embedding ? JSON.parse(item.embedding.toString()) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : undefined,
      })),
      total: count,
    });
  } catch (error) {
    console.error('Erreur récupération mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/memory/item/:itemId
 * Récupère un élément de mémoire par ID
 */
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const [item] = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.id, itemId))
      .limit(1);
    
    if (!item) {
      return res.status(404).json({ error: 'Élément de mémoire non trouvé' });
    }
    
    res.json({
      ...item,
      embedding: item.embedding ? JSON.parse(item.embedding.toString()) : undefined,
      tags: item.tags ? JSON.parse(item.tags) : undefined,
    });
  } catch (error) {
    console.error('Erreur récupération élément mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/memory
 * Crée un nouvel élément de mémoire
 */
router.post('/', async (req, res) => {
  try {
    const data = createMemoryItemSchema.parse(req.body);
    
    // Générer un embedding si pas fourni
    let embedding = data.embedding;
    if (!embedding) {
      embedding = generateSimpleEmbedding(data.content);
    }
    
    const [newItem] = await db
      .insert(memoryItems)
      .values({
        workspaceId: data.workspaceId,
        content: data.content,
        embedding: Buffer.from(JSON.stringify(embedding)),
        tags: data.tags ? JSON.stringify([data.tags]) : null,
        importance: data.importance || 3,
        source: data.source || 'user',
      })
      .returning();
    
    res.status(201).json({
      ...newItem,
      embedding,
      tags: newItem.tags ? JSON.parse(newItem.tags) : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur création élément mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/memory/:itemId
 * Met à jour un élément de mémoire
 */
router.put('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const data = updateMemoryItemSchema.parse(req.body);
    
    // Vérifier que l'élément existe
    const [existingItem] = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.id, itemId))
      .limit(1);
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Élément de mémoire non trouvé' });
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (data.content !== undefined) {
      updateData.content = data.content;
      // Régénérer l'embedding si le contenu change
      if (!data.embedding) {
        updateData.embedding = Buffer.from(JSON.stringify(generateSimpleEmbedding(data.content)));
      }
    }
    
    if (data.embedding !== undefined) {
      updateData.embedding = Buffer.from(JSON.stringify(data.embedding));
    }
    
    if (data.tags !== undefined) {
      updateData.tags = JSON.stringify([data.tags]);
    }
    
    if (data.importance !== undefined) {
      updateData.importance = data.importance;
    }
    
    if (data.source !== undefined) {
      updateData.source = data.source;
    }
    
    updateData.updatedAt = new Date();
    
    const [updatedItem] = await db
      .update(memoryItems)
      .set(updateData)
      .where(eq(memoryItems.id, itemId))
      .returning();
    
    res.json({
      ...updatedItem,
      embedding: updatedItem.embedding ? JSON.parse(updatedItem.embedding.toString()) : undefined,
      tags: updatedItem.tags ? JSON.parse(updatedItem.tags) : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur mise à jour élément mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/memory/:itemId
 * Supprime un élément de mémoire
 */
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const result = await db
      .delete(memoryItems)
      .where(eq(memoryItems.id, itemId));
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Élément de mémoire non trouvé' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression élément mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/memory/:workspaceId/clear
 * Supprime tous les éléments de mémoire d'un workspace
 */
router.delete('/:workspaceId/clear', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    await db
      .delete(memoryItems)
      .where(eq(memoryItems.workspaceId, workspaceId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression mémoire workspace:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/memory/:workspaceId/search
 * Recherche dans la mémoire avec similarité vectorielle
 */
router.post('/:workspaceId/search', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const searchData = searchMemorySchema.parse(req.body);
    
    let items = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.workspaceId, workspaceId))
      .orderBy(desc(memoryItems.createdAt));
    
    let results = items.map(item => ({
      item: {
        ...item,
        embedding: item.embedding ? JSON.parse(item.embedding.toString()) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : undefined,
      },
      similarity: 0,
      relevanceScore: 0,
    }));
    
    // Recherche textuelle si query fournie
    if (searchData.query) {
      const queryLower = searchData.query.toLowerCase();
      results = results.filter(result => 
        result.item.content.toLowerCase().includes(queryLower)
      );
      
      // Score de pertinence textuelle
      results.forEach(result => {
        const content = result.item.content.toLowerCase();
        const queryWords = queryLower.split(/\s+/);
        let score = 0;
        
        queryWords.forEach(word => {
          if (content.includes(word)) {
            score += 1;
          }
        });
        
        result.relevanceScore = score / queryWords.length;
      });
    }
    
    // Recherche vectorielle si embedding fourni
    if (searchData.embedding) {
      results.forEach(result => {
        if (result.item.embedding) {
          const similarity = cosineSimilarity(searchData.embedding!, result.item.embedding);
          result.similarity = similarity;
          
          // Combiner avec le score de pertinence textuelle
          result.relevanceScore = Math.max(result.relevanceScore, similarity);
        }
      });
      
      // Filtrer par seuil de similarité
      results = results.filter(result => result.similarity >= searchData.threshold);
    }
    
    // Trier par pertinence
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limiter les résultats
    results = results.slice(0, searchData.limit);
    
    // Supprimer les embeddings si pas demandés
    if (!searchData.includeEmbeddings) {
      results.forEach(result => {
        delete result.item.embedding;
      });
    }
    
    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données de recherche invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur recherche mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/memory/:workspaceId/export
 * Exporte toute la mémoire d'un workspace
 */
router.get('/:workspaceId/export', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const items = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.workspaceId, workspaceId))
      .orderBy(asc(memoryItems.createdAt));
    
    res.json({
      items: items.map(item => ({
        ...item,
        embedding: item.embedding ? JSON.parse(item.embedding.toString()) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : undefined,
      })),
      exportedAt: new Date(),
      workspaceId,
      version: '1.0',
    });
  } catch (error) {
    console.error('Erreur export mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/memory/:workspaceId/import
 * Importe des données de mémoire
 */
router.post('/:workspaceId/import', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const importData = importMemorySchema.parse(req.body);
    
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    // Supprimer les données existantes si demandé
    if (importData.replaceExisting) {
      await db
        .delete(memoryItems)
        .where(eq(memoryItems.workspaceId, workspaceId));
    }
    
    // Importer les nouveaux éléments
    for (const itemData of importData.items) {
      try {
        // Générer un embedding si pas fourni
        let embedding = itemData.embedding;
        if (!embedding) {
          embedding = generateSimpleEmbedding(itemData.content);
        }
        
        await db
          .insert(memoryItems)
          .values({
            workspaceId,
            content: itemData.content,
            embedding: Buffer.from(JSON.stringify(embedding)),
            tags: itemData.tags ? JSON.stringify([itemData.tags]) : null,
            importance: itemData.importance || 3,
            source: itemData.source || 'user',
          });
        
        imported++;
      } catch (error) {
        errors.push(`Erreur import élément "${itemData.content.substring(0, 50)}...": ${error}`);
        skipped++;
      }
    }
    
    res.json({
      imported,
      skipped,
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données d\'import invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur import mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/memory/embedding
 * Génère un embedding pour un texte
 */
router.post('/embedding', async (req, res) => {
  try {
    const { text } = generateEmbeddingSchema.parse(req.body);
    
    const embedding = generateSimpleEmbedding(text);
    
    res.json({ embedding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur génération embedding:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/memory/:workspaceId/stats
 * Statistiques de la mémoire
 */
router.get('/:workspaceId/stats', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const [stats] = await db
      .select({
        totalItems: sql<number>`count(*)`,
        totalSize: sql<number>`sum(length(${memoryItems.content}))`,
        averageLength: sql<number>`avg(length(${memoryItems.content}))`,
        itemsWithEmbeddings: sql<number>`sum(case when ${memoryItems.embedding} is not null then 1 else 0 end)`,
        oldestItem: sql<string>`min(${memoryItems.createdAt})`,
        newestItem: sql<string>`max(${memoryItems.createdAt})`,
      })
      .from(memoryItems)
      .where(eq(memoryItems.workspaceId, workspaceId));
    
    res.json({
      totalItems: stats.totalItems || 0,
      totalSize: stats.totalSize || 0,
      averageLength: Math.round(stats.averageLength || 0),
      itemsWithEmbeddings: stats.itemsWithEmbeddings || 0,
      oldestItem: stats.oldestItem ? new Date(stats.oldestItem) : new Date(),
      newestItem: stats.newestItem ? new Date(stats.newestItem) : new Date(),
    });
  } catch (error) {
    console.error('Erreur statistiques mémoire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;