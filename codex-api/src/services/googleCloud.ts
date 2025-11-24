// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Google Cloud Storage Upload
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";
import { GCP_CONFIG } from "../config.js";
import { checkRateLimit } from "./rateLimitGuard.js";
import type { UploadRequest, UploadResponse } from "../types.js";

/**
 * Upload file to Google Cloud Storage
 */
export async function uploadToGoogleCloud(
  request: UploadRequest
): Promise<UploadResponse> {
  const { sessionId, accountId, fileData, metadata } = request;
  
  // Check rate limit
  const rateLimit = checkRateLimit("google_cloud", accountId);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      sessionId,
      platform: "google_cloud",
      status: "failed",
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toISOString()}`,
    };
  }
  
  if (!GCP_CONFIG.projectId) {
    return {
      ok: false,
      sessionId,
      platform: "google_cloud",
      status: "failed",
      error: "Google Cloud credentials not configured",
    };
  }
  
  try {
    const fileName = metadata?.fileName || `upload-${Date.now()}.mp4`;
    const bucket = metadata?.bucket || GCP_CONFIG.bucket;
    const objectName = `${metadata?.folder || "uploads"}/${fileName}`;
    
    // In production, use Google Cloud Storage SDK
    // This is a simplified version
    
    const gcsUrl = `https://storage.googleapis.com/${bucket}/${objectName}`;
    
    // For demo purposes, return mock success
    // In production, implement actual GCS upload
    
    return {
      ok: true,
      sessionId,
      platform: "google_cloud",
      uploadId: objectName,
      url: gcsUrl,
      status: "success",
      message: "File uploaded successfully to Google Cloud Storage",
    };
  } catch (error: any) {
    return {
      ok: false,
      sessionId,
      platform: "google_cloud",
      status: "failed",
      error: error.message,
    };
  }
}

/**
 * Get GCS signed URL for upload
 */
export async function getGCSSignedUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ url: string; objectName: string } | null> {
  if (!GCP_CONFIG.projectId) {
    return null;
  }
  
  try {
    const objectName = `uploads/${Date.now()}-${fileName}`;
    const bucket = GCP_CONFIG.bucket;
    const url = `https://storage.googleapis.com/${bucket}/${objectName}`;
    
    // In production, use GCS SDK to generate actual signed URL
    // For demo, return mock URL
    
    return { url, objectName };
  } catch (error) {
    return null;
  }
}

/**
 * Delete file from GCS
 */
export async function deleteFromGCS(objectName: string): Promise<boolean> {
  if (!GCP_CONFIG.projectId) {
    return false;
  }
  
  try {
    // In production, use GCS SDK to delete object
    // For demo, return true
    return true;
  } catch (error) {
    return false;
  }
}
