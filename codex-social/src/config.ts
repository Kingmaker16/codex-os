/**
 * Social Engine v1 - Configuration
 */

export const CONFIG = {
  port: 4800,
  
  // Service URLs
  handsUrl: "http://localhost:4300",
  visionUrl: "http://localhost:4600",
  knowledgeUrl: "http://localhost:4500",
  brainUrl: "http://localhost:4100",
  
  // Account storage
  accountsFile: ".codex-social-accounts.json",
  
  // Whitelisted domains for automation
  allowedDomains: [
    "tiktok.com",
    "youtube.com",
    "instagram.com",
    "gmail.com",
    "google.com",
    "accounts.google.com",
    "studio.youtube.com",
    "business.tiktok.com",
    "www.instagram.com"
  ],
  
  // Scheduler settings
  scheduler: {
    enabled: true,
    checkInterval: 60000, // Check every minute
    maxRetries: 3
  },
  
  // Platform-specific settings
  platforms: {
    tiktok: {
      loginUrl: "https://www.tiktok.com/login",
      dashboardUrl: "https://www.tiktok.com/@{username}",
      businessUrl: "https://business.tiktok.com"
    },
    youtube: {
      loginUrl: "https://accounts.google.com",
      dashboardUrl: "https://www.youtube.com/channel/{channelId}",
      studioUrl: "https://studio.youtube.com"
    },
    instagram: {
      loginUrl: "https://www.instagram.com/accounts/login/",
      dashboardUrl: "https://www.instagram.com/{username}",
      businessUrl: "https://business.instagram.com"
    },
    gmail: {
      loginUrl: "https://accounts.google.com",
      dashboardUrl: "https://mail.google.com"
    }
  }
};

export type Platform = "tiktok" | "youtube" | "instagram" | "gmail";
