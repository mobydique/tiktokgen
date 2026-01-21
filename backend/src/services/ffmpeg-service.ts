import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { promisify } from 'util';
import { TextTemplate } from '../models/TextTemplate';

// FFmpeg path configuration (may need to be set based on system)
// For macOS: usually installed via Homebrew at /opt/homebrew/bin/ffmpeg
// For Linux: usually in PATH
// For Windows: needs to be set explicitly

class FFmpegService {
  /**
   * Add text overlay to a video
   */
  async addTextOverlay(
    videoPath: string,
    textTemplate: TextTemplate,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(videoPath);

      // Calculate text position
      const position = this.calculateTextPosition(textTemplate.position, textTemplate.font_size);

      // Escape text for FFmpeg filter
      const escapedText = this.escapeText(textTemplate.text_content);

      // Build drawtext filter
      const drawtextFilter = this.buildDrawTextFilter(
        escapedText,
        position,
        textTemplate.font_size,
        textTemplate.font_color
      );

      command
        .videoFilters(drawtextFilter)
        .videoCodec('libx264')
        .audioCodec('copy')
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-pix_fmt yuv420p',
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log('Text overlay completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          reject(err);
        })
        .save(outputPath);
    });
  }

  /**
   * Generate a thumbnail from a video
   */
  async generateThumbnail(
    videoPath: string,
    outputPath: string,
    timestampSeconds: number = 1
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestampSeconds],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1080x1920',
        })
        .on('end', () => {
          console.log('Thumbnail generated');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg thumbnail error:', err.message);
          reject(err);
        });
    });
  }

  /**
   * Get video duration in seconds
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const duration = metadata.format.duration;
        if (duration === undefined) {
          reject(new Error('Could not determine video duration'));
          return;
        }

        resolve(Math.round(duration));
      });
    });
  }

  /**
   * Calculate text position based on position type
   */
  private calculateTextPosition(position: string, fontSize: number): { x: string; y: string } {
    const padding = 50; // Padding from edges
    const lineHeight = fontSize * 1.2;

    switch (position) {
      case 'top':
        return {
          x: '(w-text_w)/2', // Centered horizontally
          y: `${padding}`, // Top padding
        };
      case 'bottom':
        return {
          x: '(w-text_w)/2', // Centered horizontally
          y: `h-text_h-${padding}`, // Bottom padding
        };
      case 'center':
        return {
          x: '(w-text_w)/2', // Centered horizontally
          y: '(h-text_h)/2', // Centered vertically
        };
      default:
        return {
          x: '(w-text_w)/2',
          y: `h-text_h-${padding}`,
        };
    }
  }

  /**
   * Escape text for FFmpeg drawtext filter
   */
  private escapeText(text: string): string {
    // Escape special characters for FFmpeg drawtext
    return text
      .replace(/\\/g, '\\\\')
      .replace(/:/g, '\\:')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');
  }

  /**
   * Build drawtext filter string
   */
  private buildDrawTextFilter(
    text: string,
    position: { x: string; y: string },
    fontSize: number,
    fontColor: string
  ): string {
    // Use a default font that should be available on most systems
    // Arial on Windows, Helvetica on macOS/Linux
    const font = 'Arial';

    return `drawtext=text='${text}':fontfile=${font}:fontsize=${fontSize}:fontcolor=${fontColor}:x=${position.x}:y=${position.y}:box=1:boxcolor=black@0.5:boxborderw=5`;
  }

  /**
   * Validate video format
   */
  async validateVideo(videoPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(videoPath, (err) => {
        resolve(!err);
      });
    });
  }
}

// Singleton instance
let ffmpegInstance: FFmpegService | null = null;

export function getFFmpegService(): FFmpegService {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpegService();
  }
  return ffmpegInstance;
}

export default FFmpegService;
