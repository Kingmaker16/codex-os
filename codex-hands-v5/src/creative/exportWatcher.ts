// =============================================
// H5-CREATIVE: EXPORT WATCHER
// =============================================

import { timestamp } from "../utils.js";

export class ExportWatcher {
  private exports: Map<string, ExportJob> = new Map();

  startExport(jobId: string, videoPath: string, format: string): void {
    const job: ExportJob = {
      id: jobId,
      videoPath,
      format,
      status: "processing",
      progress: 0,
      startedAt: timestamp()
    };

    this.exports.set(jobId, job);
    this.simulateExport(jobId);
  }

  getExportStatus(jobId: string): ExportJob | undefined {
    return this.exports.get(jobId);
  }

  private async simulateExport(jobId: string): Promise<void> {
    const job = this.exports.get(jobId);
    if (!job) return;

    // Simulate progressive export
    for (let progress = 0; progress <= 100; progress += 10) {
      job.progress = progress;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    job.status = "completed";
    job.completedAt = timestamp();
    job.outputPath = `/exports/${jobId}.mp4`;
  }

  listActiveExports(): ExportJob[] {
    return Array.from(this.exports.values()).filter(j => j.status === "processing");
  }

  cancelExport(jobId: string): boolean {
    const job = this.exports.get(jobId);
    if (!job || job.status !== "processing") return false;

    job.status = "cancelled";
    job.completedAt = timestamp();
    return true;
  }
}

interface ExportJob {
  id: string;
  videoPath: string;
  format: string;
  status: "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  startedAt: string;
  completedAt?: string;
  outputPath?: string;
  error?: string;
}

export const exportWatcher = new ExportWatcher();
