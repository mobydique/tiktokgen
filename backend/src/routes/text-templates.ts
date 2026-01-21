import { Router, Request, Response } from 'express';
import { getDatabase } from '../services/database';
import {
  CreateTextTemplateSchema,
  UpdateTextTemplateSchema,
} from '../models/TextTemplate';
import { z } from 'zod';

const router = Router();
const db = getDatabase();

// POST /api/text-templates - Create a new text template
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = CreateTextTemplateSchema.parse(req.body);
    const template = db.createTextTemplate(data);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error creating text template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/text-templates - List all text templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const templates = db.getAllTextTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching text templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/text-templates/:id - Get a specific text template
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = db.getTextTemplate(id);

    if (!template) {
      res.status(404).json({ error: 'Text template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching text template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/text-templates/:id - Update a text template
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = UpdateTextTemplateSchema.parse(req.body);
    const template = db.updateTextTemplate(id, data);

    if (!template) {
      res.status(404).json({ error: 'Text template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error updating text template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/text-templates/:id - Delete a text template
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteTextTemplate(id);

    if (!deleted) {
      res.status(404).json({ error: 'Text template not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting text template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
