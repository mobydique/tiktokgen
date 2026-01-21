import Replicate from 'replicate';
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import dotenv from 'dotenv';
import { GenerationParameters, defaultGenerationParameters } from '../models/GenerationParameters';

// Load environment variables from project root
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_MODEL = process.env.REPLICATE_MODEL || 'kwaivgi/kling-v2.5-turbo-pro';

const DEFAULT_ASPECT_RATIO = '9:16'; // Vertical TikTok
const DEFAULT_DURATION = 5; // seconds
const DEFAULT_GUIDANCE_SCALE = 7.5;

const MAX_RETRIES = 3;
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

if (!REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN environment variable is required');
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

export interface VideoGenerationResult {
  jobId: string;
  outputUrl: string | null;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  error?: string;
}

class ReplicateService {
  private model: string;

  constructor() {
    this.model = REPLICATE_MODEL;
  }

  /**
   * Generate a video using Kling v2.5 Turbo Pro
   */
  async generateVideo(
    characterPrompt: string,
    seed: number | undefined,
    style: string,
    options?: Partial<GenerationParameters>
  ): Promise<string> {
    const params: GenerationParameters = {
      ...defaultGenerationParameters,
      ...options,
    };

    // Combine character prompt with style
    const fullPrompt = this.buildPrompt(characterPrompt, style);

    // Validate prompt length (Kling limit is ~500 characters)
    if (fullPrompt.length > 500) {
      throw new Error(`Prompt too long: ${fullPrompt.length} characters (max 500)`);
    }

    const input: any = {
      prompt: fullPrompt,
      aspect_ratio: params.aspectRatio,
      duration: params.duration,
      guidance_scale: params.guidanceScale ?? DEFAULT_GUIDANCE_SCALE,
    };

    // Add seed if provided
    if (seed !== undefined) {
      input.seed = seed;
    }

    // Add negative prompt if provided
    if (params.negativePrompt) {
      input.negative_prompt = params.negativePrompt;
    }

    console.log(`Generating video with model ${this.model}...`);
    console.log(`Prompt: ${fullPrompt.substring(0, 100)}...`);
    console.log(`Parameters:`, input);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const prediction = await replicate.predictions.create({
          model: this.model,
          input,
        });

        return prediction.id;
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
        
        if (attempt < MAX_RETRIES) {
          // Wait before retry (exponential backoff)
          await this.sleep(1000 * attempt);
        }
      }
    }

    throw new Error(`Failed to create prediction after ${MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  /**
   * Poll the status of a video generation job
   */
  async pollVideoStatus(jobId: string): Promise<VideoGenerationResult> {
    const startTime = Date.now();

    while (true) {
      // Check timeout
      if (Date.now() - startTime > MAX_POLL_TIME) {
        throw new Error(`Polling timeout after ${MAX_POLL_TIME / 1000} seconds`);
      }

      try {
        const prediction = await replicate.predictions.get(jobId);

        const status = prediction.status as VideoGenerationResult['status'];

        if (status === 'succeeded') {
          const outputUrl = Array.isArray(prediction.output)
            ? prediction.output[0]
            : (prediction.output as string);

          return {
            jobId,
            outputUrl: outputUrl || null,
            status: 'succeeded',
          };
        }

        if (status === 'failed' || status === 'canceled') {
          return {
            jobId,
            outputUrl: null,
            status,
            error: (prediction.error as string) || 'Unknown error',
          };
        }

        // Still processing, wait and retry
        await this.sleep(POLL_INTERVAL);
      } catch (error: any) {
        console.error(`Error polling status for job ${jobId}:`, error.message);
        await this.sleep(POLL_INTERVAL);
      }
    }
  }

  /**
   * Download a video from a URL
   */
  async downloadVideo(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download video: ${response.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        })
        .on('error', reject);
    });
  }

  /**
   * Build a complete prompt from character prompt and style
   */
  private buildPrompt(characterPrompt: string, style: string): string {
    const stylePrompts: Record<string, string> = {
      dancing: 'dancing gracefully, smooth movements, rhythmic motion',
      sexy: 'elegant pose, confident expression, attractive appearance',
      casual: 'casual outfit, relaxed pose, natural expression',
      elegant: 'elegant dress, sophisticated pose, refined appearance',
      cute: 'cute outfit, playful pose, adorable expression',
      sporty: 'sporty outfit, active pose, energetic movement',
    };

    const styleDescription = stylePrompts[style] || style;

    return `${characterPrompt}, ${styleDescription}, high quality, cinematic lighting, 4K, detailed`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get the model being used
   */
  getModel(): string {
    return this.model;
  }
}

// Singleton instance
let replicateInstance: ReplicateService | null = null;

export function getReplicateService(): ReplicateService {
  if (!replicateInstance) {
    replicateInstance = new ReplicateService();
  }
  return replicateInstance;
}

export default ReplicateService;
