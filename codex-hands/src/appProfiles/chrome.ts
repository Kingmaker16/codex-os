/**
 * Hands v4 — App Profile: Google Chrome
 * 
 * Known buttons, toolbars, menu paths, and workflows for Chrome automation
 */

export interface AppButton {
  name: string;
  location?: { x: number; y: number };
  description?: string;
}

export interface AppToolbar {
  name: string;
  buttons: AppButton[];
}

export interface AppWorkflow {
  name: string;
  steps: string[];
}

// Known buttons (to be filled with actual coordinates)
export const buttons: AppButton[] = [
  { name: "Back", description: "Back button" },
  { name: "Forward", description: "Forward button" },
  { name: "Refresh", description: "Refresh button" },
  { name: "Home", description: "Home button" },
  { name: "Bookmark", description: "Bookmark button" },
];

// Known toolbars
export const toolbars: AppToolbar[] = [
  {
    name: "Main Toolbar",
    buttons: [
      { name: "Back" },
      { name: "Forward" },
      { name: "Refresh" },
      { name: "Home" },
      { name: "Bookmarks" },
      { name: "Extensions" },
    ],
  },
];

// Common menu paths
export const menuPaths = {
  newTab: ["File", "New Tab"],
  newWindow: ["File", "New Window"],
  bookmarkPage: ["Bookmarks", "Bookmark This Page"],
  history: ["History", "Show Full History"],
  downloads: ["Window", "Downloads"],
  preferences: ["Chrome", "Preferences"],
  devTools: ["View", "Developer", "Developer Tools"],
};

// Common workflows
export const workflows: AppWorkflow[] = [
  {
    name: "Open DevTools",
    steps: [
      "Click View menu",
      "Select Developer > Developer Tools",
    ],
  },
  {
    name: "Bookmark Page",
    steps: [
      "Click Bookmarks menu",
      "Select Bookmark This Page",
      "Click Done",
    ],
  },
];

export const appProfile = {
  name: "Google Chrome",
  bundleId: "com.google.Chrome",
  buttons,
  toolbars,
  menuPaths,
  workflows,
};
