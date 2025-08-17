import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { db } from '../db/index.js';
import { ragDocuments, documentStats } from '../db/schema.js';
import { eq, and, desc, asc, sql, like, inArray } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Configuration multer pour l'upload de fichiers
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  },
});

// Schémas de validation
const createRagDocumentSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  origin: z.enum(['folder', 'user']).default('user'),
  extension: z.string().optional(),
  fileSize: z.number().min(0).optional(),
});

const updateRagDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  origin: z.enum(['folder', 'user']).optional(),
  extension: z.string().optional(),
  fileSize: z.number().min(0).optional(),
});

const searchRagSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
  origins: z.array(z.enum(['folder', 'user'])).optional(),
  extensions: z.array(z.string()).optional(),
});

const importRagSchema = z.object({
  documents: z.array(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    origin: z.enum(['folder', 'user']).default('user'),
    extension: z.string().optional(),
    fileSize: z.number().min(0).optional(),
  })),
  replaceExisting: z.boolean().default(false),
});

const updateStatsSchema = z.object({
  relevanceScore: z.number().min(0).max(1).optional(),
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
 * Génère un embedding simple pour un document
 */
function generateDocumentEmbedding(content: string): number[] {
  // Simulation d'un embedding de 384 dimensions
  const words = content.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // Hash basé sur les mots et leur position
  for (let i = 0; i < Math.min(words.length, 100); i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode + i * j) % 384;
      embedding[index] += Math.sin(charCode * 0.1 + i * 0.01) * 0.1;
    }
  }
  
  // Normaliser
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (norm || 1));
}

/**
 * Extrait le contenu d'un fichier selon son type
 */
async function extractFileContent(filePath: string, mimetype: string): Promise<string> {
  try {
    switch (mimetype) {
      case 'text/plain':
      case 'text/csv':
      case 'application/json':
        return await fs.readFile(filePath, 'utf-8');
      
      case 'application/pdf':
        // Dans un vrai projet, utiliser pdf-parse ou similar
        return `[Contenu PDF - ${path.basename(filePath)}]\nExtraction PDF non implémentée dans cette démo.`;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // Dans un vrai projet, utiliser mammoth ou similar
        return `[Contenu DOCX - ${path.basename(filePath)}]\nExtraction DOCX non implémentée dans cette démo.`;
      
      default:
        return `[Fichier ${mimetype} - ${path.basename(filePath)}]\nType de fichier non supporté pour l'extraction.`;
    }
  } catch (error) {
    throw new Error(`Erreur extraction contenu: ${error}`);
  }
}

/**
 * Détermine le type de document selon le mimetype
 */
function getDocumentType(mimetype: string): 'text' | 'pdf' | 'docx' | 'csv' | 'json' | 'other' {
  switch (mimetype) {
    case 'text/plain': return 'text';
    case 'application/pdf': return 'pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'docx';
    case 'text/csv': return 'csv';
    case 'application/json': return 'json';
    default: return 'other';
  }
}

/**
 * Trouve des chunks pertinents dans un document
 */
function findMatchedChunks(content: string, query: string, maxChunks = 3): {
  content: string;
  startIndex: number;
  endIndex: number;
  score: number;
}[] {
  const chunkSize = 200;
  const overlap = 50;
  const chunks: { content: string; startIndex: number; endIndex: number; score: number }[] = [];
  
  const queryWords = query.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < content.length; i += chunkSize - overlap) {
    const endIndex = Math.min(i + chunkSize, content.length);
    const chunkContent = content.slice(i, endIndex);
    const chunkLower = chunkContent.toLowerCase();
    
    let score = 0;
    queryWords.forEach(word => {
      if (chunkLower.includes(word)) {
        score += 1;
      }
    });
    
    if (score > 0) {
      chunks.push({
        content: chunkContent,
        startIndex: i,
        endIndex,
        score: score / queryWords.length,
      });
    }
  }
  
  return chunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);
}

/**
 * GET /api/rag/:workspaceId
 * Récupère tous les documents RAG d'un workspace
 */
router.get('/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || 0;
    const origins = req.query.origins ? (req.query.origins as string).split(',') : undefined;
    const extensions = req.query.extensions ? (req.query.extensions as string).split(',') : undefined;
    
    // Construire la requête
    let whereConditions = [eq(ragDocuments.workspaceId, workspaceId)];
    
    if (origins && origins.length > 0) {
      whereConditions.push(inArray(ragDocuments.origin, origins as ('folder' | 'user')[]));
    }
    
    if (extensions && extensions.length > 0) {
      whereConditions.push(inArray(ragDocuments.extension, extensions));
    }
    
    // Construire la requête
    let documents;
    if (limit) {
      documents = await db
        .select()
        .from(ragDocuments)
        .where(and(...whereConditions))
        .orderBy(desc(ragDocuments.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      documents = await db
        .select()
        .from(ragDocuments)
        .where(and(...whereConditions))
        .orderBy(desc(ragDocuments.createdAt));
    }
    
    // Compter le total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ragDocuments)
      .where(and(...whereConditions));
    
    res.json({
      documents: documents,
      total: count,
    });
  } catch (error) {
    console.error('Erreur récupération documents RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/rag/document/:documentId
 * Récupère un document RAG par ID
 */
router.get('/document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const [document] = await db
      .select()
      .from(ragDocuments)
      .where(eq(ragDocuments.id, documentId))
      .limit(1);
    
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Erreur récupération document RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/rag/upload
 * Upload et traite un nouveau document RAG
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    const { workspaceId } = req.body;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId requis' });
    }
    
    // Extraire le contenu du fichier
    const content = await extractFileContent(req.file.path, req.file.mimetype);
    const type = getDocumentType(req.file.mimetype);
    
    // Générer l'embedding
    // Créer le document
    const [newDocument] = await db
      .insert(ragDocuments)
      .values({
        id: randomUUID(),
        workspaceId,
        title: req.file.originalname,
        content,
        origin: 'user',
        extension: path.extname(req.file.originalname),
        fileSize: req.file.size,
      })
      .returning();
    
    // Nettoyer le fichier temporaire
    try {
      await fs.unlink(req.file.path);
    } catch (error) {
      console.warn('Erreur suppression fichier temporaire:', error);
    }
    
    res.status(201).json({
      document: newDocument,
      processingStatus: 'completed',
      chunks: Math.ceil(content.length / 200),
    });
  } catch (error) {
    console.error('Erreur upload document:', error);
    
    // Nettoyer le fichier temporaire en cas d'erreur
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Erreur nettoyage fichier temporaire:', cleanupError);
      }
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/rag
 * Crée un document RAG à partir de texte
 */
router.post('/', async (req, res) => {
  try {
    const data = createRagDocumentSchema.parse(req.body);
    
    const [newDocument] = await db
      .insert(ragDocuments)
      .values({
        id: randomUUID(),
        workspaceId: data.workspaceId,
        title: data.title,
        content: data.content,
        origin: data.origin || 'user',
        extension: data.extension,
        fileSize: data.fileSize,
      })
      .returning();
    
    res.status(201).json(newDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur création document RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/rag/:documentId
 * Met à jour un document RAG
 */
router.put('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const data = updateRagDocumentSchema.parse(req.body);
    
    // Vérifier que le document existe
    const [existingDocument] = await db
      .select()
      .from(ragDocuments)
      .where(eq(ragDocuments.id, documentId))
      .limit(1);
    
    if (!existingDocument) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    
    if (data.origin !== undefined) {
      updateData.origin = data.origin;
    }
    
    if (data.extension !== undefined) {
      updateData.extension = data.extension;
    }
    
    if (data.fileSize !== undefined) {
      updateData.fileSize = data.fileSize;
    }
    
    updateData.updatedAt = new Date();
    
    const [updatedDocument] = await db
      .update(ragDocuments)
      .set(updateData)
      .where(eq(ragDocuments.id, documentId))
      .returning();
    
    res.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur mise à jour document RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/rag/:documentId
 * Supprime un document RAG
 */
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Supprimer aussi les statistiques associées
    await db
      .delete(documentStats)
      .where(eq(documentStats.documentId, documentId));
    
    const result = await db
      .delete(ragDocuments)
      .where(eq(ragDocuments.id, documentId));
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression document RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



/**
 * POST /api/rag/:workspaceId/search
 * Recherche dans les documents RAG
 */
router.post('/:workspaceId/search', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const searchData = searchRagSchema.parse(req.body);
    
    // Construire les conditions de base
    let whereConditions = [eq(ragDocuments.workspaceId, workspaceId)];
    
    if (searchData.origins && searchData.origins.length > 0) {
      whereConditions.push(inArray(ragDocuments.origin, searchData.origins));
    }
    
    if (searchData.extensions && searchData.extensions.length > 0) {
      whereConditions.push(inArray(ragDocuments.extension, searchData.extensions));
    }
    
    let documents = await db
      .select()
      .from(ragDocuments)
      .where(and(...whereConditions))
      .orderBy(desc(ragDocuments.createdAt));
    
    let results = documents.map(doc => ({
      document: doc,
      similarity: 0,
      relevanceScore: 0,
      matchedChunks: [] as any[],
    }));
    
    // Recherche textuelle si query fournie
    if (searchData.query) {
      const queryLower = searchData.query.toLowerCase();
      
      results = results.filter(result => {
        const titleMatch = result.document.title.toLowerCase().includes(queryLower);
        const contentMatch = result.document.content.toLowerCase().includes(queryLower);
        return titleMatch || contentMatch;
      });
      
      // Score de pertinence textuelle et chunks
      results.forEach(result => {
        const queryWords = queryLower.split(/\s+/);
        let score = 0;
        
        // Score basé sur le titre
        queryWords.forEach(word => {
          if (result.document.title.toLowerCase().includes(word)) {
            score += 2; // Poids plus élevé pour le titre
          }
        });
        
        // Score basé sur le contenu
        queryWords.forEach(word => {
          if (result.document.content.toLowerCase().includes(word)) {
            score += 1;
          }
        });
        
        result.relevanceScore = score / (queryWords.length * 3); // Normaliser
        
        // Trouver les chunks pertinents
        result.matchedChunks = findMatchedChunks(
          result.document.content,
          searchData.query!,
          3
        );
      });
    }
    
    // Trier par pertinence
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limiter les résultats
    results = results.slice(0, searchData.limit);
    
    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données de recherche invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur recherche RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/rag/:workspaceId/stats
 * Récupère les statistiques d'usage des documents
 */
router.get('/:workspaceId/stats', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const stats = await db
      .select({
        documentId: documentStats.documentId,
        useCount: documentStats.useCount,
        lastUsedAt: documentStats.lastUsedAt,
        isFavorite: documentStats.isFavorite,
      })
      .from(documentStats)
      .orderBy(desc(documentStats.useCount));
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur récupération statistiques RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/rag/document/:documentId/stats
 * Met à jour les statistiques d'usage d'un document
 */
router.post('/document/:documentId/stats', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { relevanceScore } = updateStatsSchema.parse(req.body);
    
    // Vérifier que le document existe
    const [document] = await db
      .select()
      .from(ragDocuments)
      .where(eq(ragDocuments.id, documentId))
      .limit(1);
    
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    // Récupérer ou créer les statistiques
    const [existingStats] = await db
      .select()
      .from(documentStats)
      .where(eq(documentStats.documentId, documentId))
      .limit(1);
    
    let updatedStats;
    
    if (existingStats) {
      // Mettre à jour les statistiques existantes
      const newUseCount = (existingStats.useCount || 0) + 1;
      
      [updatedStats] = await db
        .update(documentStats)
        .set({
          useCount: newUseCount,
          lastUsedAt: new Date(),
        })
        .where(eq(documentStats.documentId, documentId))
        .returning();
    } else {
      // Créer de nouvelles statistiques
      [updatedStats] = await db
        .insert(documentStats)
        .values({
          documentId,
          useCount: 1,
          lastUsedAt: new Date(),
        })
        .returning();
    }
    
    res.json(updatedStats);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur mise à jour statistiques document:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/rag/:workspaceId/export
 * Exporte tous les documents RAG d'un workspace
 */
router.get('/:workspaceId/export', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const documents = await db
      .select()
      .from(ragDocuments)
      .where(eq(ragDocuments.workspaceId, workspaceId))
      .orderBy(asc(ragDocuments.createdAt));
    
    const stats = await db
      .select()
      .from(documentStats);
    
    res.json({
      documents,
      stats,
      exportedAt: new Date(),
      workspaceId,
      version: '1.0',
    });
  } catch (error) {
    console.error('Erreur export documents RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/rag/:workspaceId/import
 * Importe des documents RAG
 */
router.post('/:workspaceId/import', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const importData = importRagSchema.parse(req.body);
    
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    // Supprimer les données existantes si demandé
    if (importData.replaceExisting) {
      await db
        .delete(ragDocuments)
        .where(eq(ragDocuments.workspaceId, workspaceId));
    }
    
    // Importer les nouveaux documents
    for (const docData of importData.documents) {
      try {
        await db
          .insert(ragDocuments)
          .values({
            id: randomUUID(),
            workspaceId,
            title: docData.title,
            content: docData.content,
            origin: docData.origin || 'user',
            extension: docData.extension,
            fileSize: docData.fileSize,
          });
        
        imported++;
      } catch (error) {
        errors.push(`Erreur import document "${docData.title}": ${error}`);
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
    console.error('Erreur import documents RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



/**
 * GET /api/rag/:workspaceId/overview
 * Statistiques globales RAG
 */
router.get('/:workspaceId/overview', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const [overview] = await db
      .select({
        totalDocuments: sql<number>`count(*)`,
        totalSize: sql<number>`sum(${ragDocuments.fileSize})`,
        averageSize: sql<number>`avg(${ragDocuments.fileSize})`,
        oldestDocument: sql<string>`min(${ragDocuments.createdAt})`,
        newestDocument: sql<string>`max(${ragDocuments.createdAt})`,
      })
      .from(ragDocuments)
      .where(eq(ragDocuments.workspaceId, workspaceId));
    
    // Statistiques par origine
    const originStats = await db
      .select({
        origin: ragDocuments.origin,
        count: sql<number>`count(*)`,
      })
      .from(ragDocuments)
      .where(eq(ragDocuments.workspaceId, workspaceId))
      .groupBy(ragDocuments.origin);
    
    const documentsByOrigin = originStats.reduce((acc, stat) => {
      acc[stat.origin] = stat.count;
      return acc;
    }, {} as Record<string, number>);
    
    // Document le plus utilisé
    const [mostUsedResult] = await db
      .select({
        document: ragDocuments,
        useCount: documentStats.useCount,
      })
      .from(ragDocuments)
      .leftJoin(documentStats, eq(ragDocuments.id, documentStats.documentId))
      .where(eq(ragDocuments.workspaceId, workspaceId))
      .orderBy(desc(documentStats.useCount))
      .limit(1);
    
    // Total d'usage
    const [{ totalUsage }] = await db
      .select({
        totalUsage: sql<number>`coalesce(sum(${documentStats.useCount}), 0)`,
      })
      .from(documentStats)
      .leftJoin(ragDocuments, eq(documentStats.documentId, ragDocuments.id))
      .where(eq(ragDocuments.workspaceId, workspaceId));
    
    res.json({
      totalDocuments: overview.totalDocuments || 0,
      totalSize: overview.totalSize || 0,
      averageSize: Math.round(overview.averageSize || 0),
      documentsByOrigin,
      totalUsage: totalUsage || 0,
      mostUsedDocument: mostUsedResult?.document || null,
      oldestDocument: overview.oldestDocument ? new Date(overview.oldestDocument) : new Date(),
      newestDocument: overview.newestDocument ? new Date(overview.newestDocument) : new Date(),
    });
  } catch (error) {
    console.error('Erreur statistiques globales RAG:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;