import { sqliteTable, text, integer, blob, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Workspaces
export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Discussions
export const discussions = sqliteTable('discussions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  title: text('title').notNull(),
  childMode: integer('child_mode', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Messages
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  discussionId: text('discussion_id').notNull().references(() => discussions.id),
  content: text('content').notNull(),
  isUser: integer('is_user', { mode: 'boolean' }).notNull(),
  imageUrl: text('image_url'),
  memoryFactsCount: integer('memory_facts_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Sources des messages (RAG/Web)
export const messageSources = sqliteTable('message_sources', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().references(() => messages.id),
  title: text('title').notNull(),
  url: text('url'),
  type: text('type', { enum: ['rag', 'web'] }).notNull(),
});

// Système de mémoire
export const memoryItems = sqliteTable('memory_items', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  content: text('content').notNull(),
  tags: text('tags'), // JSON array
  importance: integer('importance').notNull(), // 1-5
  source: text('source', { enum: ['user', 'assistant', 'system'] }).notNull(),
  originMessageId: text('origin_message_id').references(() => messages.id),
  embedding: blob('embedding'), // Stockage binaire des embeddings
  disabled: integer('disabled', { mode: 'boolean' }).default(false),
  evidenceCount: integer('evidence_count').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Documents RAG
export const ragDocuments = sqliteTable('rag_documents', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  origin: text('origin', { enum: ['folder', 'user'] }).notNull(),
  extension: text('extension'),
  fileSize: integer('file_size'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Statistiques d'usage des documents
export const documentStats = sqliteTable('document_stats', {
  documentId: text('document_id').primaryKey().references(() => ragDocuments.id),
  useCount: integer('use_count').default(0),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
});

// Configurations utilisateur
export const userSettings = sqliteTable('user_settings', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  workspaceId: text('workspace_id').references(() => workspaces.id),
  key: text('key').notNull(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Presets de configuration
export const configurationPresets = sqliteTable('configuration_presets', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  config: text('config').notNull(), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  discussions: many(discussions),
  memoryItems: many(memoryItems),
  ragDocuments: many(ragDocuments),
  userSettings: many(userSettings),
  configurationPresets: many(configurationPresets),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [discussions.workspaceId],
    references: [workspaces.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [messages.discussionId],
    references: [discussions.id],
  }),
  sources: many(messageSources),
  memoryItems: many(memoryItems),
}));

export const messageSourcesRelations = relations(messageSources, ({ one }) => ({
  message: one(messages, {
    fields: [messageSources.messageId],
    references: [messages.id],
  }),
}));

export const memoryItemsRelations = relations(memoryItems, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [memoryItems.workspaceId],
    references: [workspaces.id],
  }),
  originMessage: one(messages, {
    fields: [memoryItems.originMessageId],
    references: [messages.id],
  }),
}));

export const ragDocumentsRelations = relations(ragDocuments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [ragDocuments.workspaceId],
    references: [workspaces.id],
  }),
  stats: one(documentStats, {
    fields: [ragDocuments.id],
    references: [documentStats.documentId],
  }),
}));

export const documentStatsRelations = relations(documentStats, ({ one }) => ({
  document: one(ragDocuments, {
    fields: [documentStats.documentId],
    references: [ragDocuments.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [userSettings.workspaceId],
    references: [workspaces.id],
  }),
}));

export const configurationPresetsRelations = relations(configurationPresets, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [configurationPresets.workspaceId],
    references: [workspaces.id],
  }),
}));

// Types TypeScript inférés
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export type Discussion = typeof discussions.$inferSelect;
export type NewDiscussion = typeof discussions.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type MessageSource = typeof messageSources.$inferSelect;
export type NewMessageSource = typeof messageSources.$inferInsert;

export type MemoryItem = typeof memoryItems.$inferSelect;
export type NewMemoryItem = typeof memoryItems.$inferInsert;

export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;

export type DocumentStats = typeof documentStats.$inferSelect;
export type NewDocumentStats = typeof documentStats.$inferInsert;

export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

export type ConfigurationPreset = typeof configurationPresets.$inferSelect;
export type NewConfigurationPreset = typeof configurationPresets.$inferInsert;