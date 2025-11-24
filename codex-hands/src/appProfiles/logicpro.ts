/**
 * Hands v4 — App Profile: Logic Pro
 * 
 * Known buttons, toolbars, menu paths, and workflows for Logic Pro automation
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
  { name: "Play", description: "Play/Stop button" },
  { name: "Record", description: "Record button" },
  { name: "Loop", description: "Loop button" },
  { name: "Mixer", description: "Mixer view" },
  { name: "Library", description: "Library panel" },
];

// Known toolbars
export const toolbars: AppToolbar[] = [
  {
    name: "Main Toolbar",
    buttons: [
      { name: "Play" },
      { name: "Record" },
      { name: "Loop" },
      { name: "Count-In" },
      { name: "Metronome" },
    ],
  },
];

// Common menu paths
export const menuPaths = {
  export: ["File", "Bounce", "Project or Section"],
  newTrack: ["Track", "New Track"],
  save: ["File", "Save"],
  saveAs: ["File", "Save As"],
  import: ["File", "Import", "Audio File"],
  preferences: ["Logic Pro", "Preferences"],
};

// Common workflows
export const workflows: AppWorkflow[] = [
  {
    name: "Export Audio",
    steps: [
      "Click File menu",
      "Select Bounce > Project or Section",
      "Choose format",
      "Click Bounce",
    ],
  },
  {
    name: "Create New Track",
    steps: [
      "Click Track menu",
      "Select New Track",
      "Choose track type",
      "Click Create",
    ],
  },
];

export const appProfile = {
  name: "Logic Pro",
  bundleId: "com.apple.logic10",
  buttons,
  toolbars,
  menuPaths,
  workflows,
};
