/**
 * Social Engine v1.5 - Scheduler
 * 
 * Manages scheduled posts and periodic job execution
 * Updated to support PlannedPost and uploadPipeline integration
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { ScheduledPost, PostRequest, PlannedPost } from "./types.js";
import { CONFIG } from "./config.js";
import { logSchedule, logToBrain } from "./brainLogger.js";
import { uploadVideoToPlatforms } from "./uploadPipeline.js";

const SCHEDULE_FILE = join(process.cwd(), ".codex-social-schedule.json");
const PLANNED_POSTS_FILE = join(process.cwd(), ".codex-social-planned.json");

let scheduledPosts: ScheduledPost[] = [];
let plannedPosts: PlannedPost[] = [];
let isRunning = false;

// Load schedule from disk
export function loadSchedule(): ScheduledPost[] {
  try {
    if (existsSync(SCHEDULE_FILE)) {
      const data = readFileSync(SCHEDULE_FILE, "utf-8");
      scheduledPosts = JSON.parse(data);
      console.log(`[Scheduler] Loaded ${scheduledPosts.length} scheduled posts`);
    } else {
      scheduledPosts = [];
      saveSchedule();
    }

    // Load planned posts
    if (existsSync(PLANNED_POSTS_FILE)) {
      const data = readFileSync(PLANNED_POSTS_FILE, "utf-8");
      plannedPosts = JSON.parse(data);
      console.log(`[Scheduler] Loaded ${plannedPosts.length} planned posts`);
    } else {
      plannedPosts = [];
      savePlannedPosts();
    }
  } catch (error: any) {
    console.error("[Scheduler] Failed to load schedule:", error.message);
    scheduledPosts = [];
    plannedPosts = [];
  }
  return scheduledPosts;
}

// Save schedule to disk
function saveSchedule(): void {
  try {
    writeFileSync(SCHEDULE_FILE, JSON.stringify(scheduledPosts, null, 2), "utf-8");
  } catch (error: any) {
    console.error("[Scheduler] Failed to save schedule:", error.message);
  }
}

// Save planned posts to disk
function savePlannedPosts(): void {
  try {
    writeFileSync(PLANNED_POSTS_FILE, JSON.stringify(plannedPosts, null, 2), "utf-8");
  } catch (error: any) {
    console.error("[Scheduler] Failed to save planned posts:", error.message);
  }
}

// Add planned posts (from /social/plan endpoint)
export function addPlannedPosts(posts: PlannedPost[]): void {
  plannedPosts.push(...posts);
  savePlannedPosts();
  console.log(`[Scheduler] Added ${posts.length} planned posts`);
}

// Add post to schedule
export function schedulePost(request: PostRequest): ScheduledPost {
  const post: ScheduledPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    accountId: request.accountId,
    platform: request.platform,
    content: request.content,
    scheduledFor: request.scheduledFor || new Date().toISOString(),
    status: "pending",
    retries: 0,
    createdAt: new Date().toISOString()
  };

  scheduledPosts.push(post);
  saveSchedule();

  logSchedule(post.id, post.scheduledFor);
  console.log(`[Scheduler] Scheduled post ${post.id} for ${post.scheduledFor}`);

  return post;
}

// Get all scheduled posts
export function getScheduledPosts(): ScheduledPost[] {
  return scheduledPosts;
}

// Get pending posts
export function getPendingPosts(): ScheduledPost[] {
  return scheduledPosts.filter(p => p.status === "pending");
}

// Get planned posts
export function getPlannedPosts(): PlannedPost[] {
  return plannedPosts;
}

// Update post status
function updatePostStatus(postId: string, status: ScheduledPost["status"], error?: string): void {
  const post = scheduledPosts.find(p => p.id === postId);
  if (!post) return;

  post.status = status;
  if (status === "posted") {
    post.postedAt = new Date().toISOString();
  }
  if (error) {
    post.error = error;
  }

  saveSchedule();
}

// Update planned post status
function updatePlannedPostStatus(postId: string, status: PlannedPost["status"]): void {
  const post = plannedPosts.find(p => p.id === postId);
  if (!post) return;
  post.status = status;
  savePlannedPosts();
}

// Start scheduler
export function startScheduler(): void {
  if (isRunning) {
    console.warn("[Scheduler] Already running");
    return;
  }

  if (!CONFIG.scheduler.enabled) {
    console.log("[Scheduler] Disabled in config");
    return;
  }

  isRunning = true;
  console.log(`[Scheduler] Started (check interval: ${CONFIG.scheduler.checkInterval}ms)`);

  // Run check loop
  setInterval(checkSchedule, CONFIG.scheduler.checkInterval);
}

// Stop scheduler
export function stopScheduler(): void {
  isRunning = false;
  console.log("[Scheduler] Stopped");
}

// Check for due posts
async function checkSchedule(): Promise<void> {
  const now = new Date();
  const duePosts = scheduledPosts.filter(post => {
    if (post.status !== "pending") return false;
    const scheduledTime = new Date(post.scheduledFor);
    return scheduledTime <= now;
  });

  if (duePosts.length === 0) return;

  console.log(`[Scheduler] Found ${duePosts.length} due posts`);

  for (const post of duePosts) {
    await executePost(post);
  }
}

// Execute scheduled post
async function executePost(post: ScheduledPost): Promise<void> {
  try {
    console.log(`[Scheduler] Executing post ${post.id}`);

    // Import platform-specific posting logic
    const { postContent } = await import(`./platforms/${post.platform}.js`);
    const success = await postContent(post.accountId, post.content);

    if (success) {
      updatePostStatus(post.id, "posted");
      console.log(`[Scheduler] Post ${post.id} published successfully`);
    } else {
      throw new Error("Post execution failed");
    }

  } catch (error: any) {
    console.error(`[Scheduler] Post ${post.id} failed:`, error.message);

    post.retries += 1;

    if (post.retries >= CONFIG.scheduler.maxRetries) {
      updatePostStatus(post.id, "failed", error.message);
      console.error(`[Scheduler] Post ${post.id} exhausted retries`);
    } else {
      // Reschedule for 5 minutes later
      const rescheduleTime = new Date(Date.now() + 5 * 60 * 1000);
      post.scheduledFor = rescheduleTime.toISOString();
      saveSchedule();
      console.log(`[Scheduler] Post ${post.id} rescheduled for ${post.scheduledFor}`);
    }
  }
}

// Execute planned post (v1.5)
async function executePlannedPost(post: PlannedPost): Promise<void> {
  try {
    console.log(`[Scheduler] Executing planned post ${post.id}`);

    updatePlannedPostStatus(post.id, "ready");

    if (!post.videoPath) {
      throw new Error("No video path specified");
    }

    // Upload using v1.5 pipeline
    const results = await uploadVideoToPlatforms({
      accountId: post.accountId,
      videoPath: post.videoPath,
      platforms: [post.platform],
      title: post.title,
      caption: post.caption,
      tags: post.tags,
    });

    const result = results[0];

    if (result && result.ok) {
      updatePlannedPostStatus(post.id, "uploaded");
      await logToBrain(
        "codex-social-scheduler",
        `Planned post ${post.id} uploaded successfully to ${post.platform}`
      );
      console.log(`[Scheduler] Planned post ${post.id} uploaded successfully`);
    } else {
      throw new Error(result?.error || "Upload failed");
    }

  } catch (error: any) {
    console.error(`[Scheduler] Planned post ${post.id} failed:`, error.message);
    updatePlannedPostStatus(post.id, "failed");
    await logToBrain(
      "codex-social-errors",
      `Planned post ${post.id} failed: ${error.message}`
    );
  }
}
