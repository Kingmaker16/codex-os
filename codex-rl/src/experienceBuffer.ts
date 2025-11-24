import { RLExperience, RLEpisode } from "./types.js";

const MAX_BUFFER_SIZE = 1000;

export class ExperienceBuffer {
  private experiences: RLExperience[] = [];
  private episodes: RLEpisode[] = [];

  addExperience(experience: RLExperience): void {
    this.experiences.push(experience);
    
    // Ring buffer: remove oldest if exceeds limit
    if (this.experiences.length > MAX_BUFFER_SIZE) {
      this.experiences.shift();
    }
  }

  addEpisode(episode: RLEpisode): void {
    this.episodes.push(episode);
    
    // Keep last 100 episodes
    if (this.episodes.length > 100) {
      this.episodes.shift();
    }
  }

  getExperiences(limit?: number): RLExperience[] {
    if (limit) {
      return this.experiences.slice(-limit);
    }
    return [...this.experiences];
  }

  getEpisodes(limit?: number): RLEpisode[] {
    if (limit) {
      return this.episodes.slice(-limit);
    }
    return [...this.episodes];
  }

  getEpisodesBySession(sessionId: string): RLEpisode[] {
    return this.episodes.filter(ep => ep.sessionId === sessionId);
  }

  getBufferStats() {
    return {
      experienceCount: this.experiences.length,
      episodeCount: this.episodes.length,
      maxBufferSize: MAX_BUFFER_SIZE,
      avgReward: this.experiences.length > 0
        ? this.experiences.reduce((sum, exp) => sum + exp.reward, 0) / this.experiences.length
        : 0
    };
  }

  clear(): void {
    this.experiences = [];
    this.episodes = [];
  }
}

// Global singleton buffer
export const globalBuffer = new ExperienceBuffer();
