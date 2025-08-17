import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import {
  discussions,
  messages,
  messageSources,
  type NewDiscussion,
  type NewMessage,
  type NewMessageSource,
} from '../db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

// Schémas de validation Zod
const createDiscussionSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1).max(200),
  childMode: z.boolean().optional().default(false),
});

const createMessageSchema = z.object({
  discussionId: z.string(),
  content: z.string().min(1),
  isUser: z.boolean(),
  imageUrl: z.string().url().optional(),
  memoryFactsCount: z.number().int().min(0).optional().default(0),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional(),
    type: z.enum(['rag', 'web']),
  })).optional(),
});

const updateDiscussionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  childMode: z.boolean().optional(),
});

// GET /api/discussions/:workspaceId - Récupérer toutes les discussions d'un workspace
router.get('/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    
    // Récupérer les discussions avec une requête SQL simple
    const discussionsList = await db.select().from(discussions)
      .where(eq(discussions.workspaceId, workspaceId))
      .orderBy(desc(discussions.updatedAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    // Transformer pour inclure le nombre de messages et le dernier message
    const discussionsWithStats = await Promise.all(
      discussionsList.map(async (discussion) => {
        // Compter les messages
        const messageCountResult = await db.select({ count: messages.id }).from(messages)
          .where(eq(messages.discussionId, discussion.id));
        const messageCount = messageCountResult.length;
        
        // Récupérer le dernier message
        const lastMessageResult = await db.select().from(messages)
          .where(eq(messages.discussionId, discussion.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        return {
          ...discussion,
          messageCount,
          lastMessage: lastMessageResult[0] || null,
        };
      })
    );
    
    // Compter le total des discussions
    const totalResult = await db.select({ count: discussions.id }).from(discussions)
      .where(eq(discussions.workspaceId, workspaceId));
    
    res.json({
      discussions: discussionsWithStats,
      total: totalResult.length,
    });
  } catch (error) {
    console.error('Erreur récupération discussions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/discussions/detail/:discussionId - Récupérer une discussion complète avec ses messages
router.get('/detail/:discussionId', async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    const discussionResult = await db.select().from(discussions)
      .where(eq(discussions.id, discussionId))
      .limit(1);
    const discussion = discussionResult[0];
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }
    
    res.json(discussion);
  } catch (error) {
    console.error('Erreur récupération discussion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/discussions - Créer une nouvelle discussion
router.post('/', async (req, res) => {
  try {
    const validatedData = createDiscussionSchema.parse(req.body);
    
    const discussionId = `discussion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const newDiscussion: NewDiscussion = {
      id: discussionId,
      ...validatedData,
    };
    
    await db.insert(discussions).values(newDiscussion);
    
    // Récupérer la discussion créée
    const createdDiscussionResult = await db.select().from(discussions)
      .where(eq(discussions.id, discussionId))
      .limit(1);
    const createdDiscussion = createdDiscussionResult[0];
    
    res.status(201).json(createdDiscussion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création discussion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/discussions/:discussionId - Mettre à jour une discussion
router.put('/:discussionId', async (req, res) => {
  try {
    const { discussionId } = req.params;
    const validatedData = updateDiscussionSchema.parse(req.body);
    
    const updatedDiscussion = await db
      .update(discussions)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(discussions.id, discussionId))
      .returning();
    
    if (updatedDiscussion.length === 0) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }
    
    res.json(updatedDiscussion[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur mise à jour discussion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/discussions/:discussionId - Supprimer une discussion
router.delete('/:discussionId', async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    // Supprimer d'abord les sources des messages
    await db.delete(messageSources)
      .where(
        eq(messageSources.messageId, 
          db.select({ id: messages.id })
            .from(messages)
            .where(eq(messages.discussionId, discussionId))
        )
      );
    
    // Supprimer les messages
    await db.delete(messages).where(eq(messages.discussionId, discussionId));
    
    // Supprimer la discussion
    const deletedDiscussion = await db
      .delete(discussions)
      .where(eq(discussions.id, discussionId))
      .returning();
    
    if (deletedDiscussion.length === 0) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }
    
    res.json({ message: 'Discussion supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression discussion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/discussions/:discussionId/messages - Ajouter un message à une discussion
router.post('/:discussionId/messages', async (req, res) => {
  try {
    const { discussionId } = req.params;
    const validatedData = createMessageSchema.parse(req.body);
    
    // Vérifier que la discussion existe
    const discussionResult = await db.select().from(discussions)
      .where(eq(discussions.id, discussionId))
      .limit(1);
    const discussion = discussionResult[0];
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }
    
    const messageId = `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const newMessage: NewMessage = {
      id: messageId,
      discussionId,
      content: validatedData.content,
      isUser: validatedData.isUser,
      imageUrl: validatedData.imageUrl,
      memoryFactsCount: validatedData.memoryFactsCount,
    };
    
    await db.insert(messages).values(newMessage);
    
    // Ajouter les sources si présentes
    if (validatedData.sources && validatedData.sources.length > 0) {
      const sourcesToInsert: NewMessageSource[] = validatedData.sources.map(source => ({
        messageId,
        title: source.title,
        url: source.url,
        type: source.type,
      }));
      
      await db.insert(messageSources).values(sourcesToInsert);
    }
    
    // Mettre à jour la date de modification de la discussion
    await db
      .update(discussions)
      .set({ updatedAt: new Date() })
      .where(eq(discussions.id, discussionId));
    
    // Récupérer le message créé avec ses sources
    const createdMessageResult = await db.select().from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);
    const createdMessage = createdMessageResult[0];
    
    // Récupérer les sources du message
    if (createdMessage) {
      const sourcesResult = await db.select().from(messageSources)
        .where(eq(messageSources.messageId, messageId));
      createdMessage.sources = sourcesResult;
    }
    
    res.status(201).json(createdMessage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/discussions/:discussionId/messages - Récupérer les messages d'une discussion
router.get('/:discussionId/messages', async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { limit = '100', offset = '0' } = req.query;
    
    // Récupérer les messages
    const messagesList = await db.select().from(messages)
      .where(eq(messages.discussionId, discussionId))
      .orderBy(messages.createdAt)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    // Ajouter les sources pour chaque message
    const messagesWithSources = await Promise.all(
      messagesList.map(async (message) => {
        const sourcesResult = await db.select().from(messageSources)
          .where(eq(messageSources.messageId, message.id));
        return {
          ...message,
          sources: sourcesResult,
        };
      })
    );
    
    res.json({
      messages: messagesWithSources,
      total: messagesWithSources.length,
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/discussions/messages/:messageId - Supprimer un message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Supprimer d'abord les sources
    await db.delete(messageSources).where(eq(messageSources.messageId, messageId));
    
    // Supprimer le message
    const deletedMessage = await db
      .delete(messages)
      .where(eq(messages.id, messageId))
      .returning();
    
    if (deletedMessage.length === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/discussions/search/:workspaceId - Recherche full-text dans les discussions
router.get('/search/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { q, limit = '20' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Paramètre de recherche requis' });
    }
    
    // Récupérer les IDs des discussions du workspace
    const workspaceDiscussions = await db.select({ id: discussions.id })
      .from(discussions)
      .where(eq(discussions.workspaceId, workspaceId));
    
    const discussionIds = workspaceDiscussions.map(d => d.id);
    
    if (discussionIds.length === 0) {
      return res.json({
        results: [],
        query: q,
      });
    }
    
    // Rechercher les messages contenant le terme
     const searchResults = await db.select().from(messages)
       .where(and(
         sql`content LIKE ${'%' + q + '%'}`,
         sql`discussion_id IN (${discussionIds.map(id => `'${id}'`).join(',')})`
       ))
       .orderBy(desc(messages.createdAt))
       .limit(parseInt(limit as string));
    
    // Ajouter les informations de discussion et sources
    const resultsWithDetails = await Promise.all(
      searchResults.map(async (message) => {
        // Récupérer la discussion
        const discussionResult = await db.select().from(discussions)
          .where(eq(discussions.id, message.discussionId))
          .limit(1);
        
        // Récupérer les sources
        const sourcesResult = await db.select().from(messageSources)
          .where(eq(messageSources.messageId, message.id));
        
        return {
          ...message,
          discussion: discussionResult[0],
          sources: sourcesResult,
        };
      })
    );
    
    res.json({
      results: resultsWithDetails,
      query: q,
    });
  } catch (error) {
    console.error('Erreur recherche discussions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;