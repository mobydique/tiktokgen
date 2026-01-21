import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

const videosDir = process.env.VIDEOS_DIR || './videos';

class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(videosDir);
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await stat(this.baseDir);
    } catch {
      await mkdir(this.baseDir, { recursive: true });
    }
  }

  /**
   * Get the directory path for a specific video
   */
  getVideoDirectory(videoId: string): string {
    return path.join(this.baseDir, videoId);
  }

  /**
   * Get the file path for a video
   */
  getVideoPath(videoId: string, filename: string = 'video.mp4'): string {
    return path.join(this.getVideoDirectory(videoId), filename);
  }

  /**
   * Get the thumbnail path for a video
   */
  getThumbnailPath(videoId: string, filename: string = 'thumbnail.jpg'): string {
    return path.join(this.getVideoDirectory(videoId), filename);
  }

  /**
   * Ensure the video directory exists
   */
  async ensureVideoDirectory(videoId: string): Promise<void> {
    const videoDir = this.getVideoDirectory(videoId);
    try {
      await stat(videoDir);
    } catch {
      await mkdir(videoDir, { recursive: true });
    }
  }

  /**
   * Save a video file
   */
  async saveVideo(videoId: string, buffer: Buffer, filename: string = 'video.mp4'): Promise<string> {
    await this.ensureVideoDirectory(videoId);
    const filePath = this.getVideoPath(videoId, filename);
    await writeFile(filePath, buffer);
    return filePath;
  }

  /**
   * Save a thumbnail file
   */
  async saveThumbnail(videoId: string, buffer: Buffer, filename: string = 'thumbnail.jpg'): Promise<string> {
    await this.ensureVideoDirectory(videoId);
    const thumbnailPath = this.getThumbnailPath(videoId, filename);
    await writeFile(thumbnailPath, buffer);
    return thumbnailPath;
  }

  /**
   * Read a video file
   */
  async readVideo(videoId: string, filename: string = 'video.mp4'): Promise<Buffer> {
    const filePath = this.getVideoPath(videoId, filename);
    return await readFile(filePath);
  }

  /**
   * Read a thumbnail file
   */
  async readThumbnail(videoId: string, filename: string = 'thumbnail.jpg'): Promise<Buffer> {
    const thumbnailPath = this.getThumbnailPath(videoId, filename);
    return await readFile(thumbnailPath);
  }

  /**
   * Check if a video file exists
   */
  async videoExists(videoId: string, filename: string = 'video.mp4'): Promise<boolean> {
    try {
      const filePath = this.getVideoPath(videoId, filename);
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a thumbnail exists
   */
  async thumbnailExists(videoId: string, filename: string = 'thumbnail.jpg'): Promise<boolean> {
    try {
      const thumbnailPath = this.getThumbnailPath(videoId, filename);
      await stat(thumbnailPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a video and its directory
   */
  async deleteVideo(videoId: string): Promise<void> {
    const videoDir = this.getVideoDirectory(videoId);
    
    try {
      const files = await promisify(fs.readdir)(videoDir);
      await Promise.all(
        files.map((file) => unlink(path.join(videoDir, file)))
      );
      await promisify(fs.rmdir)(videoDir);
    } catch (error) {
      // Directory might not exist or already be deleted
      console.warn(`Failed to delete video directory ${videoDir}:`, error);
    }
  }

  /**
   * Get relative path from base directory (for storing in DB)
   */
  getRelativePath(absolutePath: string): string {
    return path.relative(this.baseDir, absolutePath);
  }

  /**
   * Get absolute path from relative path (for reading from DB)
   */
  getAbsolutePath(relativePath: string): string {
    return path.resolve(this.baseDir, relativePath);
  }
}

// Singleton instance
let storageInstance: StorageService | null = null;

export function getStorage(): StorageService {
  if (!storageInstance) {
    storageInstance = new StorageService();
  }
  return storageInstance;
}

export default StorageService;
