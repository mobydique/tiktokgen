import { Router, Request, Response } from 'express';
import { getDatabase } from '../services/database';
import { getReplicateService } from '../services/replicate-service';
import { getFFmpegService } from '../services/ffmpeg-service';
import { getStorage } from '../services/storage-service';
import { GenerateVideoRequestSchema } from '../models/GeneratedVideo';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

const router = Router();
const db = getDatabase();
const replicateService = getReplicateService();
const ffmpegService = getFFmpegService();
const storageService = getStorage();

// POST /api/generate - Generate a video
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const requestData = GenerateVideoRequestSchema.parse(req.body);
    const { character_profile_id, text_template_id, options } = requestData;

    // Fetch character profile and text template
    const characterProfile = db.getCharacterProfile(character_profile_id);
    const textTemplate = db.getTextTemplate(text_template_id);

    if (!characterProfile) {
      res.status(404).json({ error: 'Character profile not found' });
      return;
    }

    if (!textTemplate) {
      res.status(404).json({ error: 'Text template not found' });
      return;
    }

    // Create video record
    const videoId = uuidv4();
    const video = db.createGeneratedVideo({
      character_profile_id,
      text_template_id,
      generation_provider: 'replicate',
      status: 'pending',
      model_name: replicateService.getModel(),
      generation_parameters: options || undefined,
    });

    // Start generation asynchronously (don't block response)
    generateVideoAsync(videoId, characterProfile, textTemplate, options).catch(
      (error) => {
        console.error(`Error generating video ${videoId}:`, error);
        db.updateGeneratedVideo(videoId, {
          status: 'failed',
          error_message: error.message || 'Unknown error',
        });
      }
    );

    res.status(202).json(video);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error initiating video generation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/generated-videos - List all generated videos
router.get('/generated-videos', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const videos = db.getAllGeneratedVideos(status);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching generated videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/generated-videos/:id - Get a specific generated video
router.get('/generated-videos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = db.getGeneratedVideo(id);

    if (!video) {
      res.status(404).json({ error: 'Generated video not found' });
      return;
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching generated video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/generated-videos/:id/download - Download a video
router.get('/generated-videos/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = db.getGeneratedVideo(id);

    if (!video) {
      res.status(404).json({ error: 'Generated video not found' });
      return;
    }

    if (video.status !== 'completed' || !video.file_path) {
      res.status(400).json({ error: 'Video not ready for download' });
      return;
    }

    const filePath = storageService.getAbsolutePath(video.file_path);
    const videoBuffer = await storageService.readVideo(id);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="video-${id}.mp4"`);
    res.send(videoBuffer);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/generated-videos/:id - Delete a generated video
router.delete('/generated-videos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = db.getGeneratedVideo(id);

    if (!video) {
      res.status(404).json({ error: 'Generated video not found' });
      return;
    }

    // Delete video files
    await storageService.deleteVideo(id);

    // Delete database record
    db.deleteGeneratedVideo(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Asynchronous video generation workflow
 */
async function generateVideoAsync(
  videoId: string,
  characterProfile: any,
  textTemplate: any,
  options?: any
): Promise<void> {
  try {
    // Update status to processing
    db.updateGeneratedVideo(videoId, { status: 'processing' });

    // Step 1: Generate video with Replicate
    console.log(`[${videoId}] Starting video generation with Replicate...`);
    const jobId = await replicateService.generateVideo(
      characterProfile.character_prompt,
      characterProfile.seed,
      characterProfile.style,
      options
    );

    db.updateGeneratedVideo(videoId, { generation_job_id: jobId });

    // Step 2: Poll for completion
    console.log(`[${videoId}] Polling Replicate for job ${jobId}...`);
    const result = await replicateService.pollVideoStatus(jobId);

    if (result.status !== 'succeeded' || !result.outputUrl) {
      throw new Error(result.error || 'Video generation failed');
    }

    // Step 3: Download video from Replicate
    console.log(`[${videoId}] Downloading video from Replicate...`);
    const videoBuffer = await replicateService.downloadVideo(result.outputUrl);

    // Step 4: Save raw video temporarily
    const tempVideoPath = storageService.getVideoPath(videoId, 'raw-video.mp4');
    await storageService.ensureVideoDirectory(videoId);
    await storageService.saveVideo(videoId, videoBuffer, 'raw-video.mp4');

    // Step 5: Add text overlay with FFmpeg
    console.log(`[${videoId}] Adding text overlay...`);
    const finalVideoPath = storageService.getVideoPath(videoId, 'video.mp4');
    await ffmpegService.addTextOverlay(tempVideoPath, textTemplate, finalVideoPath);

    // Step 6: Generate thumbnail
    console.log(`[${videoId}] Generating thumbnail...`);
    const thumbnailPath = storageService.getThumbnailPath(videoId, 'thumbnail.jpg');
    await ffmpegService.generateThumbnail(finalVideoPath, thumbnailPath, 1);

    // Step 7: Get video duration
    const duration = await ffmpegService.getVideoDuration(finalVideoPath);

    // Step 8: Save relative paths and update status
    const relativeVideoPath = storageService.getRelativePath(finalVideoPath);
    const relativeThumbnailPath = storageService.getRelativePath(thumbnailPath);

    db.updateGeneratedVideo(videoId, {
      status: 'completed',
      file_path: relativeVideoPath,
      thumbnail_path: relativeThumbnailPath,
      duration_seconds: duration,
      completed_at: new Date().toISOString(),
    });

    console.log(`[${videoId}] Video generation completed successfully!`);
  } catch (error: any) {
    console.error(`[${videoId}] Error in video generation:`, error);
    db.updateGeneratedVideo(videoId, {
      status: 'failed',
      error_message: error.message || 'Unknown error',
    });
    throw error;
  }
}

export default router;
