import express from 'express';
import { getDatabase } from '../database/setup.js';
import { requireOwnership } from '../middleware/auth.js';

const router = express.Router();

// ========================================================================================
// ROUTES DES CONVERSATIONS
// ========================================================================================

/**
 * GET /api/conversations
 * Lister toutes les conversations de l'utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      workspace_id, 
      search, 
      tags,
      sort_by = 'updated_at',
      sort_order = 'desc'
    } = req.query;
    
    const userId = req.user.id;
    const offset = (page - 1) * limit;
    
    const database = getDatabase();
    
    // Construction de la requête avec filtres
    let whereClause = 'WHERE c.user_id = ?';
    let params = [userId];
    
    if (workspace_id) {
      whereClause += ' AND c.workspace_id = ?';
      params.push(workspace_id);
    }
    
    if (search) {
      whereClause += ' AND (c.title LIKE ? OR EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.content LIKE ?))';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereClause += ' AND (';
      tagArray.forEach((tag, index) => {
        if (index > 0) whereClause += ' OR ';
        whereClause += 'c.tags LIKE ?';
        params.push(`%${tag}%`);
      });
      whereClause += ')';
    }
    
    // Validation du tri
    const allowedSortFields = ['created_at', 'updated_at', 'title', 'message_count'];
    const allowedSortOrders = ['asc', 'desc'];
    
    if (!allowedSortFields.includes(sort_by)) {
      sort_by = 'updated_at';
    }
    if (!allowedSortOrders.includes(sort_order.toLowerCase())) {
      sort_order = 'desc';
    }
    
    // Requête pour le total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM conversations c 
      ${whereClause}
    `;
    
    const totalResult = await new Promise((resolve, reject) => {
      database.get(countQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const total = totalResult.total;
    
    // Requête principale avec pagination
    const conversationsQuery = `
      SELECT 
        c.id,
        c.title,
        c.workspace_id,
        c.child_mode,
        c.private_mode,
        c.created_at,
        c.updated_at,
        c.message_count,
        c.tags,
        c.metadata,
        (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.message_order DESC LIMIT 1) as last_message
      FROM conversations c 
      ${whereClause}
      ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;
    
    const conversations = await new Promise((resolve, reject) => {
      database.all(conversationsQuery, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Traitement des métadonnées et tags
    const processedConversations = conversations.map(conv => {
      let metadata = {};
      let tags = [];
      
      try {
        if (conv.metadata) {
          metadata = JSON.parse(conv.metadata);
        }
      } catch (e) {
        metadata = {};
      }
      
      try {
        if (conv.tags) {
          tags = JSON.parse(conv.tags);
        }
      } catch (e) {
        tags = [];
      }
      
      return {
        ...conv,
        metadata,
        tags,
        last_message: conv.last_message ? conv.last_message.substring(0, 100) + '...' : null
      };
    });
    
    res.json({
      success: true,
      data: {
        conversations: processedConversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/conversations/:id
 * Récupérer une conversation spécifique avec tous ses messages
 */
router.get('/:id', requireOwnership('conversation'), async (req, res) => {
  try {
    const conversationId = req.params.id;
    const database = getDatabase();
    
    // Récupérer la conversation
    const conversation = await new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM conversations WHERE id = ?`,
        [conversationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation non trouvée',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    // Récupérer tous les messages de la conversation
    const messages = await new Promise((resolve, reject) => {
      database.all(
        `SELECT * FROM messages WHERE conversation_id = ? ORDER BY message_order ASC`,
        [conversationId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    // Traitement des métadonnées
    let metadata = {};
    let tags = [];
    
    try {
      if (conversation.metadata) {
        metadata = JSON.parse(conversation.metadata);
      }
    } catch (e) {
      metadata = {};
    }
    
    try {
      if (conversation.tags) {
        tags = JSON.parse(conversation.tags);
      }
    } catch (e) {
      tags = [];
    }
    
    const result = {
      ...conversation,
      metadata,
      tags,
      messages: messages.map(msg => {
        let msgMetadata = {};
        try {
          if (msg.metadata) {
            msgMetadata = JSON.parse(msg.metadata);
          }
        } catch (e) {
          msgMetadata = {};
        }
        
        return {
          ...msg,
          metadata: msgMetadata
        };
      })
    };
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/conversations
 * Créer une nouvelle conversation
 */
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      workspace_id = 'default', 
      child_mode = false, 
      private_mode = false,
      tags = [],
      metadata = {},
      initial_messages = []
    } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Le titre de la conversation est requis',
        code: 'MISSING_TITLE'
      });
    }
    
    const userId = req.user.id;
    const database = getDatabase();
    
    // Créer la conversation
    const conversationResult = await new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO conversations (user_id, title, workspace_id, child_mode, private_mode, tags, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          title.trim(),
          workspace_id,
          child_mode ? 1 : 0,
          private_mode ? 1 : 0,
          JSON.stringify(tags),
          JSON.stringify(metadata)
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    const conversationId = conversationResult.id;
    
    // Ajouter les messages initiaux s'il y en a
    if (initial_messages && initial_messages.length > 0) {
      for (let i = 0; i < initial_messages.length; i++) {
        const message = initial_messages[i];
        await new Promise((resolve, reject) => {
          database.run(
            `INSERT INTO messages (conversation_id, content, is_user, message_order, metadata)
             VALUES (?, ?, ?, ?, ?)`,
            [
              conversationId,
              message.content,
              message.is_user ? 1 : 0,
              i,
              JSON.stringify(message.metadata || {})
            ],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      
      // Mettre à jour le nombre de messages
      database.run(
        'UPDATE conversations SET message_count = ? WHERE id = ?',
        [initial_messages.length, conversationId]
      );
    }
    
    // Récupérer la conversation créée
    const newConversation = await new Promise((resolve, reject) => {
      database.get(
        'SELECT * FROM conversations WHERE id = ?',
        [conversationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    res.status(201).json({
      success: true,
      message: 'Conversation créée avec succès',
      data: {
        ...newConversation,
        tags: JSON.parse(newConversation.tags || '[]'),
        metadata: JSON.parse(newConversation.metadata || '{}')
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/conversations/:id
 * Mettre à jour une conversation
 */
router.put('/:id', requireOwnership('conversation'), async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { 
      title, 
      workspace_id, 
      child_mode, 
      private_mode,
      tags,
      metadata
    } = req.body;
    
    const database = getDatabase();
    
    // Construire la requête de mise à jour
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    
    if (workspace_id !== undefined) {
      updates.push('workspace_id = ?');
      params.push(workspace_id);
    }
    
    if (child_mode !== undefined) {
      updates.push('child_mode = ?');
      params.push(child_mode ? 1 : 0);
    }
    
    if (private_mode !== undefined) {
      updates.push('private_mode = ?');
      params.push(private_mode ? 1 : 0);
    }
    
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }
    
    if (metadata !== undefined) {
      updates.push('metadata = ?');
      params.push(JSON.stringify(metadata));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour',
        code: 'NO_UPDATES'
      });
    }
    
    updates.push('updated_at = datetime("now")');
    params.push(conversationId);
    
    const updateQuery = `UPDATE conversations SET ${updates.join(', ')} WHERE id = ?`;
    
    await new Promise((resolve, reject) => {
      database.run(updateQuery, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Récupérer la conversation mise à jour
    const updatedConversation = await new Promise((resolve, reject) => {
      database.get(
        'SELECT * FROM conversations WHERE id = ?',
        [conversationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    res.json({
      success: true,
      message: 'Conversation mise à jour avec succès',
      data: {
        ...updatedConversation,
        tags: JSON.parse(updatedConversation.tags || '[]'),
        metadata: JSON.parse(updatedConversation.metadata || '{}')
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la conversation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/conversations/:id
 * Supprimer une conversation et tous ses messages
 */
router.delete('/:id', requireOwnership('conversation'), async (req, res) => {
  try {
    const conversationId = req.params.id;
    const database = getDatabase();
    
    // Supprimer la conversation (les messages seront supprimés automatiquement via CASCADE)
    await new Promise((resolve, reject) => {
      database.run(
        'DELETE FROM conversations WHERE id = ?',
        [conversationId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({
      success: true,
      message: 'Conversation supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Ajouter un message à une conversation
 */
router.post('/:id/messages', requireOwnership('conversation'), async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { content, is_user, metadata = {} } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu du message est requis',
        code: 'MISSING_CONTENT'
      });
    }
    
    const database = getDatabase();
    
    // Récupérer l'ordre du dernier message
    const lastMessage = await new Promise((resolve, reject) => {
      database.get(
        'SELECT message_order FROM messages WHERE conversation_id = ? ORDER BY message_order DESC LIMIT 1',
        [conversationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    const messageOrder = (lastMessage ? lastMessage.message_order : -1) + 1;
    
    // Ajouter le message
    const messageResult = await new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO messages (conversation_id, content, is_user, message_order, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [
          conversationId,
          content.trim(),
          is_user ? 1 : 0,
          messageOrder,
          JSON.stringify(metadata)
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    // Mettre à jour le nombre de messages et la date de modification
    database.run(
      'UPDATE conversations SET message_count = message_count + 1, updated_at = datetime("now") WHERE id = ?',
      [conversationId]
    );
    
    // Récupérer le message créé
    const newMessage = await new Promise((resolve, reject) => {
      database.get(
        'SELECT * FROM messages WHERE id = ?',
        [messageResult.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    res.status(201).json({
      success: true,
      message: 'Message ajouté avec succès',
      data: {
        ...newMessage,
        metadata: JSON.parse(newMessage.metadata || '{}')
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/conversations/search/semantic
 * Recherche sémantique dans les conversations
 */
router.get('/search/semantic', async (req, res) => {
  try {
    const { query, limit = 10, threshold = 0.7 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'La requête de recherche est requise',
        code: 'MISSING_QUERY'
      });
    }
    
    const userId = req.user.id;
    const database = getDatabase();
    
    // Recherche simple par mots-clés pour l'instant
    // TODO: Implémenter la recherche sémantique avec embeddings
    const searchQuery = `
      SELECT DISTINCT
        c.id,
        c.title,
        c.workspace_id,
        c.created_at,
        c.updated_at,
        c.message_count,
        m.content as matched_content,
        m.timestamp as message_timestamp
      FROM conversations c
      JOIN messages m ON c.id = m.conversation_id
      WHERE c.user_id = ? 
        AND (c.title LIKE ? OR m.content LIKE ?)
      ORDER BY m.timestamp DESC
      LIMIT ?
    `;
    
    const searchTerm = `%${query.trim()}%`;
    const conversations = await new Promise((resolve, reject) => {
      database.all(searchQuery, [userId, searchTerm, searchTerm, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Grouper par conversation et formater les résultats
    const groupedResults = {};
    conversations.forEach(row => {
      if (!groupedResults[row.id]) {
        groupedResults[row.id] = {
          id: row.id,
          title: row.title,
          workspace_id: row.workspace_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          message_count: row.message_count,
          matches: []
        };
      }
      
      groupedResults[row.id].matches.push({
        content: row.matched_content,
        timestamp: row.message_timestamp
      });
    });
    
    const results = Object.values(groupedResults).map(conv => ({
      ...conv,
      relevance_score: conv.matches.length / conv.message_count, // Score simple basé sur le nombre de correspondances
      preview: conv.matches[0]?.content.substring(0, 150) + '...'
    }));
    
    // Trier par score de pertinence
    results.sort((a, b) => b.relevance_score - a.relevance_score);
    
    res.json({
      success: true,
      data: {
        query: query.trim(),
        results,
        total: results.length
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la recherche sémantique:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/conversations/stats/summary
 * Statistiques des conversations de l'utilisateur
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const database = getDatabase();
    
    // Statistiques générales
    const stats = await new Promise((resolve, reject) => {
      database.get(
        `SELECT 
          COUNT(*) as total_conversations,
          SUM(message_count) as total_messages,
          AVG(message_count) as avg_messages_per_conversation,
          MIN(created_at) as first_conversation,
          MAX(created_at) as last_conversation
        FROM conversations 
        WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    // Statistiques par workspace
    const workspaceStats = await new Promise((resolve, reject) => {
      database.all(
        `SELECT 
          workspace_id,
          COUNT(*) as conversation_count,
          SUM(message_count) as message_count
        FROM conversations 
        WHERE user_id = ? 
        GROUP BY workspace_id 
        ORDER BY conversation_count DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    // Statistiques par mois (derniers 12 mois)
    const monthlyStats = await new Promise((resolve, reject) => {
      database.all(
        `SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as conversation_count,
          SUM(message_count) as message_count
        FROM conversations 
        WHERE user_id = ? 
          AND created_at >= datetime('now', '-12 months')
        GROUP BY month 
        ORDER BY month DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          total_conversations: stats.total_conversations || 0,
          total_messages: stats.total_messages || 0,
          avg_messages_per_conversation: Math.round((stats.avg_messages_per_conversation || 0) * 100) / 100,
          first_conversation: stats.first_conversation,
          last_conversation: stats.last_conversation
        },
        by_workspace: workspaceStats,
        by_month: monthlyStats
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
