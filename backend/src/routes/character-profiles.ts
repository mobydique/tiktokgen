import { Router, Request, Response } from 'express';
import { getDatabase } from '../services/database';
import {
  CreateCharacterProfileSchema,
  UpdateCharacterProfileSchema,
} from '../models/CharacterProfile';
import { z } from 'zod';

const router = Router();
const db = getDatabase();

// POST /api/character-profiles - Create a new character profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = CreateCharacterProfileSchema.parse(req.body);
    const profile = db.createCharacterProfile(data);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error creating character profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/character-profiles - List all character profiles
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = db.getAllCharacterProfiles();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching character profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/character-profiles/:id - Get a specific character profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = db.getCharacterProfile(id);

    if (!profile) {
      res.status(404).json({ error: 'Character profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching character profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/character-profiles/:id - Update a character profile
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = UpdateCharacterProfileSchema.parse(req.body);
    const profile = db.updateCharacterProfile(id, data);

    if (!profile) {
      res.status(404).json({ error: 'Character profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error updating character profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/character-profiles/:id - Delete a character profile
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCharacterProfile(id);

    if (!deleted) {
      res.status(404).json({ error: 'Character profile not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting character profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
