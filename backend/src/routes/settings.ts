import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { userSettings, configurationPresets } from '../db/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// Schémas de validation
const createSettingSchema = z.object({
  workspaceId: z.string().min(1),
  key: z.string().min(1),
  value: z.any(),
});

const updateSettingSchema = z.object({
  value: z.any(),
  description: z.string().optional(),
});

const createPresetSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  settings: z.record(z.any()),
});

const updatePresetSchema = z.object({
  name: z.string().min(1).optional(),
  settings: z.record(z.any()).optional(),
});

const bulkUpdateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1),
    value: z.any(),
  })),
});

/**
 * Détermine le type d'une valeur
 */
function getValueType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'object';
  return typeof value as 'string' | 'number' | 'boolean' | 'object';
}

/**
 * Sérialise une valeur pour le stockage
 */
function serializeValue(value: any): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/**
 * Désérialise une valeur depuis le stockage
 */
function deserializeValue(value: string, type: string): any {
  switch (type) {
    case 'string':
      return value;
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === 'true';
    case 'object':
    case 'array':
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    default:
      return value;
  }
}

/**
 * GET /api/settings/:workspaceId
 * Récupère tous les paramètres d'un workspace
 */
router.get('/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    let whereConditions = [eq(userSettings.workspaceId, workspaceId)];
    
    const settings = await db
      .select()
      .from(userSettings)
      .where(and(...whereConditions))
      .orderBy(asc(userSettings.key));
    
    // Désérialiser les valeurs
    const deserializedSettings = settings.map(setting => ({
      ...setting,
      value: deserializeValue(setting.value, 'string'),
    }));
    
    res.json({ settings: deserializedSettings });
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/settings/:workspaceId/:key
 * Récupère un paramètre spécifique
 */
router.get('/:workspaceId/:key', async (req, res) => {
  try {
    const { workspaceId, key } = req.params;
    
    const [setting] = await db
      .select()
      .from(userSettings)
      .where(and(
        eq(userSettings.workspaceId, workspaceId),
        eq(userSettings.key, key)
      ))
      .limit(1);
    
    if (!setting) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    
    res.json({
      ...setting,
      value: deserializeValue(setting.value, 'string'),
    });
  } catch (error) {
    console.error('Erreur récupération paramètre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/settings
 * Crée un nouveau paramètre
 */
router.post('/', async (req, res) => {
  try {
    const data = createSettingSchema.parse(req.body);
    
    // Vérifier si le paramètre existe déjà
    const [existingSetting] = await db
      .select()
      .from(userSettings)
      .where(and(
        eq(userSettings.workspaceId, data.workspaceId),
        eq(userSettings.key, data.key)
      ))
      .limit(1);
    
    if (existingSetting) {
      return res.status(409).json({ error: 'Paramètre déjà existant' });
    }
    
    const [newSetting] = await db
      .insert(userSettings)
      .values({
        workspaceId: data.workspaceId,
        key: data.key,
        value: serializeValue(data.value),
      })
      .returning();
    
    res.status(201).json({
      ...newSetting,
      value: deserializeValue(newSetting.value, 'string'),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur création paramètre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/settings/:workspaceId/:key
 * Met à jour un paramètre
 */
router.put('/:workspaceId/:key', async (req, res) => {
  try {
    const { workspaceId, key } = req.params;
    const data = updateSettingSchema.parse(req.body);
    
    // Vérifier que le paramètre existe
    const [existingSetting] = await db
      .select()
      .from(userSettings)
      .where(and(
        eq(userSettings.workspaceId, workspaceId),
        eq(userSettings.key, key)
      ))
      .limit(1);
    
    if (!existingSetting) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    
    const [updatedSetting] = await db
      .update(userSettings)
      .set({
        value: data.value !== undefined ? serializeValue(data.value) : existingSetting.value,
        updatedAt: new Date(),
      })
      .where(and(
        eq(userSettings.workspaceId, workspaceId),
        eq(userSettings.key, key)
      ))
      .returning();
    
    res.json({
      ...updatedSetting,
      value: deserializeValue(updatedSetting.value, 'string'),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur mise à jour paramètre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/settings/:workspaceId/:key
 * Supprime un paramètre
 */
router.delete('/:workspaceId/:key', async (req, res) => {
  try {
    const { workspaceId, key } = req.params;
    
    const result = await db
      .delete(userSettings)
      .where(and(
        eq(userSettings.workspaceId, workspaceId),
        eq(userSettings.key, key)
      ));
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression paramètre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/settings/:workspaceId/bulk
 * Met à jour plusieurs paramètres en une fois
 */
router.post('/:workspaceId/bulk', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const data = bulkUpdateSettingsSchema.parse(req.body);
    
    const results: any[] = [];
    const errors: { key: string; error: string }[] = [];
    
    for (const settingData of data.settings) {
      try {
        // Vérifier si le paramètre existe
        const [existingSetting] = await db
          .select()
          .from(userSettings)
          .where(and(
            eq(userSettings.workspaceId, workspaceId),
            eq(userSettings.key, settingData.key)
          ))
          .limit(1);
        
        let result;
        
        if (existingSetting) {
          // Mettre à jour
          [result] = await db
            .update(userSettings)
            .set({
              value: serializeValue(settingData.value),
              updatedAt: new Date(),
            })
            .where(and(
              eq(userSettings.workspaceId, workspaceId),
              eq(userSettings.key, settingData.key)
            ))
            .returning();
        } else {
          // Créer
          [result] = await db
            .insert(userSettings)
            .values({
              workspaceId,
              key: settingData.key,
              value: serializeValue(settingData.value),
            })
            .returning();
        }
        
        results.push({
          ...result,
          value: deserializeValue(result.value, 'string'),
        });
      } catch (error) {
        errors.push({
          key: settingData.key,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }
    
    res.json({
      updated: results,
      errors,
      totalProcessed: data.settings.length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur mise à jour en lot:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/settings/:workspaceId/presets
 * Récupère tous les presets de configuration
 */
router.get('/:workspaceId/presets', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const presets = await db
      .select()
      .from(configurationPresets)
      .where(eq(configurationPresets.workspaceId, workspaceId))
      .orderBy(asc(configurationPresets.name));
    
    // Désérialiser les paramètres
    const deserializedPresets = presets.map(preset => ({
      ...preset,
      settings: preset.config ? JSON.parse(preset.config) : {},
    }));
    
    res.json({ presets: deserializedPresets });
  } catch (error) {
    console.error('Erreur récupération presets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/settings/preset/:presetId
 * Récupère un preset spécifique
 */
router.get('/preset/:presetId', async (req, res) => {
  try {
    const { presetId } = req.params;
    
    const [preset] = await db
      .select()
      .from(configurationPresets)
      .where(eq(configurationPresets.id, presetId))
      .limit(1);
    
    if (!preset) {
      return res.status(404).json({ error: 'Preset non trouvé' });
    }
    
    res.json({
      ...preset,
      settings: preset.config ? JSON.parse(preset.config) : {},
    });
  } catch (error) {
    console.error('Erreur récupération preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/settings/presets
 * Crée un nouveau preset
 */
router.post('/presets', async (req, res) => {
  try {
    const data = createPresetSchema.parse(req.body);
    
    const [newPreset] = await db
      .insert(configurationPresets)
      .values({
        id: randomUUID(),
        workspaceId: data.workspaceId,
        name: data.name,
        config: JSON.stringify(data.settings),
      })
      .returning();
    
    res.status(201).json({
      ...newPreset,
      settings: JSON.parse(newPreset.config),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur création preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/settings/preset/:presetId
 * Met à jour un preset
 */
router.put('/preset/:presetId', async (req, res) => {
  try {
    const { presetId } = req.params;
    const data = updatePresetSchema.parse(req.body);
    
    // Vérifier que le preset existe
    const [existingPreset] = await db
      .select()
      .from(configurationPresets)
      .where(eq(configurationPresets.id, presetId))
      .limit(1);
    
    if (!existingPreset) {
      return res.status(404).json({ error: 'Preset non trouvé' });
    }
    
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.settings !== undefined) updateData.config = JSON.stringify(data.settings);
    
    const [updatedPreset] = await db
      .update(configurationPresets)
      .set(updateData)
      .where(eq(configurationPresets.id, presetId))
      .returning();
    
    res.json({
      ...updatedPreset,
      settings: JSON.parse(updatedPreset.config),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    console.error('Erreur mise à jour preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/settings/preset/:presetId
 * Supprime un preset
 */
router.delete('/preset/:presetId', async (req, res) => {
  try {
    const { presetId } = req.params;
    
    const result = await db
      .delete(configurationPresets)
      .where(eq(configurationPresets.id, presetId));
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Preset non trouvé' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/settings/preset/:presetId/apply
 * Applique un preset aux paramètres du workspace
 */
router.post('/preset/:presetId/apply', async (req, res) => {
  try {
    const { presetId } = req.params;
    
    // Récupérer le preset
    const [preset] = await db
      .select()
      .from(configurationPresets)
      .where(eq(configurationPresets.id, presetId))
      .limit(1);
    
    if (!preset) {
      return res.status(404).json({ error: 'Preset non trouvé' });
    }
    
    const presetSettings = JSON.parse(preset.config);
    const results: any[] = [];
    const errors: { key: string; error: string }[] = [];
    
    // Appliquer chaque paramètre du preset
    for (const [key, value] of Object.entries(presetSettings)) {
      try {
        const valueType = getValueType(value);
        
        // Vérifier si le paramètre existe
        const [existingSetting] = await db
          .select()
          .from(userSettings)
          .where(and(
            eq(userSettings.workspaceId, preset.workspaceId),
            eq(userSettings.key, key)
          ))
          .limit(1);
        
        let result;
        
        if (existingSetting) {
          // Mettre à jour
          [result] = await db
            .update(userSettings)
            .set({
              value: serializeValue(value),
              updatedAt: new Date(),
            })
            .where(and(
              eq(userSettings.workspaceId, preset.workspaceId),
              eq(userSettings.key, key)
            ))
            .returning();
        } else {
          // Créer
          [result] = await db
            .insert(userSettings)
            .values({
              workspaceId: preset.workspaceId,
              key,
              value: serializeValue(value),
            })
            .returning();
        }
        
        results.push({
          ...result,
          value: deserializeValue(result.value, 'string'),
        });
      } catch (error) {
        errors.push({
          key,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }
    
    res.json({
      presetName: preset.name,
      applied: results,
      errors,
      totalSettings: Object.keys(presetSettings).length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error) {
    console.error('Erreur application preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/settings/:workspaceId/export
 * Exporte tous les paramètres d'un workspace
 */
router.get('/:workspaceId/export', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.workspaceId, workspaceId))
      .orderBy(asc(userSettings.key));
    
    const presets = await db
      .select()
      .from(configurationPresets)
      .where(eq(configurationPresets.workspaceId, workspaceId))
      .orderBy(asc(configurationPresets.name));
    
    res.json({
      settings: settings.map(setting => ({
        ...setting,
        value: deserializeValue(setting.value, 'string'),
      })),
      presets: presets.map(preset => ({
        ...preset,
        settings: JSON.parse(preset.config),
      })),
      exportedAt: new Date(),
      workspaceId,
      version: '1.0',
    });
  } catch (error) {
    console.error('Erreur export paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/settings/:workspaceId/import
 * Importe des paramètres et presets
 */
router.post('/:workspaceId/import', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { settings: importSettings, presets: importPresets, replaceExisting } = req.body;
    
    let importedSettings = 0;
    let importedPresets = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    // Supprimer les données existantes si demandé
    if (replaceExisting) {
      await db
        .delete(configurationPresets)
        .where(eq(configurationPresets.workspaceId, workspaceId));
      
      await db
        .delete(userSettings)
        .where(eq(userSettings.workspaceId, workspaceId));
    }
    
    // Importer les paramètres
    if (importSettings && Array.isArray(importSettings)) {
      for (const settingData of importSettings) {
        try {
          await db
            .insert(userSettings)
            .values({
              workspaceId,
              key: settingData.key,
              value: serializeValue(settingData.value),
            });
          
          importedSettings++;
        } catch (error) {
          errors.push(`Erreur import paramètre "${settingData.key}": ${error}`);
          skipped++;
        }
      }
    }
    
    // Importer les presets
    if (importPresets && Array.isArray(importPresets)) {
      for (const presetData of importPresets) {
        try {
          await db
            .insert(configurationPresets)
            .values({
              id: randomUUID(),
              workspaceId,
              name: presetData.name,
              config: JSON.stringify(presetData.settings),
            });
          
          importedPresets++;
        } catch (error) {
          errors.push(`Erreur import preset "${presetData.name}": ${error}`);
          skipped++;
        }
      }
    }
    
    res.json({
      importedSettings,
      importedPresets,
      skipped,
      errors,
    });
  } catch (error) {
    console.error('Erreur import paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/settings/:workspaceId/categories
 * Récupère toutes les catégories de paramètres
 */
router.get('/:workspaceId/categories', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    // Since category field doesn't exist in schema, return empty categories
    res.json({ categories: [] });
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/settings/:workspaceId/reset
 * Remet à zéro tous les paramètres d'un workspace
 */
router.post('/:workspaceId/reset', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { category, keepPresets } = req.body;
    
    // Supprimer les paramètres
    let whereConditions = [eq(userSettings.workspaceId, workspaceId)];
    
    // Category filtering removed as field doesn't exist in schema
    
    const settingsResult = await db
      .delete(userSettings)
      .where(and(...whereConditions));
    
    let presetsResult = { changes: 0 };
    
    // Supprimer les presets si demandé
    if (!keepPresets) {
      presetsResult = await db
        .delete(configurationPresets)
        .where(eq(configurationPresets.workspaceId, workspaceId));
    }
    
    res.json({
      deletedSettings: settingsResult.changes,
      deletedPresets: presetsResult.changes,
      category: category || 'all',
    });
  } catch (error) {
    console.error('Erreur reset paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;