export interface OptimizationReport {
  disk: string;
  cachesCleared: boolean;
  brewStatus: string;
  permissions: Record<string, boolean>;
  largeFiles: string[];
  desktopArchivePath: string;
  notes: string[];
}
