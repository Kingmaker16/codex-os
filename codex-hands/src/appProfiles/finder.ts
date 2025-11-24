/**
 * Hands v4 — App Profile: macOS Finder
 * 
 * Known buttons, toolbars, menu paths, and workflows for Finder automation
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
  { name: "View", description: "View options" },
  { name: "Share", description: "Share button" },
  { name: "Tag", description: "Tag button" },
];

// Known toolbars
export const toolbars: AppToolbar[] = [
  {
    name: "Main Toolbar",
    buttons: [
      { name: "Back" },
      { name: "Forward" },
      { name: "View" },
      { name: "Share" },
      { name: "Tag" },
    ],
  },
];

// Common menu paths
export const menuPaths = {
  newFolder: ["File", "New Folder"],
  newWindow: ["File", "New Finder Window"],
  showInfo: ["File", "Get Info"],
  moveToTrash: ["File", "Move to Trash"],
  duplicate: ["File", "Duplicate"],
  preferences: ["Finder", "Preferences"],
};

// Common workflows
export const workflows: AppWorkflow[] = [
  {
    name: "Create New Folder",
    steps: [
      "Click File menu",
      "Select New Folder",
      "Type folder name",
      "Press Return",
    ],
  },
  {
    name: "Show File Info",
    steps: [
      "Select file",
      "Click File menu",
      "Select Get Info",
    ],
  },
];

export const appProfile = {
  name: "Finder",
  bundleId: "com.apple.finder",
  buttons,
  toolbars,
  menuPaths,
  workflows,
};
