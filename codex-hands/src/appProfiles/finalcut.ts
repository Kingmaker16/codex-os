/**
 * Hands v4 — App Profile: Final Cut Pro
 * 
 * Known buttons, toolbars, menu paths, and workflows for Final Cut Pro automation
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
  { name: "Play", description: "Play/Pause button" },
  { name: "Export", description: "Export button" },
  { name: "Import", description: "Import media" },
  { name: "Timeline", description: "Timeline view" },
  { name: "Inspector", description: "Inspector panel" },
];

// Known toolbars
export const toolbars: AppToolbar[] = [
  {
    name: "Main Toolbar",
    buttons: [
      { name: "Select Tool" },
      { name: "Trim Tool" },
      { name: "Blade Tool" },
      { name: "Zoom Tool" },
    ],
  },
];

// Common menu paths
export const menuPaths = {
  export: ["File", "Share", "Master File"],
  import: ["File", "Import", "Media"],
  newProject: ["File", "New", "Project"],
  save: ["File", "Save"],
  // Hands v4.5 — Additional editing menus
  blade: ["Edit", "Blade"],
  rippleDelete: ["Edit", "Ripple Delete"],
  editCopy: ["Edit", "Copy"],
  editPaste: ["Edit", "Paste"],
  addBasicTitle: ["Edit", "Connect Title", "Basic Title"],
};

// Hands v4.5 — Video editing features
export const timelineRegion = {
  // TODO: Map actual coordinates once UI is analyzed
  x: 50,
  y: 700,
  width: 1400,
  height: 250,
  description: "Main timeline area",
};

export const previewRegion = {
  // TODO: Map actual coordinates
  x: 900,
  y: 50,
  width: 700,
  height: 400,
  description: "Viewer window",
};

export const inspectorRegion = {
  // TODO: Map actual coordinates
  x: 1600,
  y: 50,
  width: 300,
  height: 900,
  description: "Inspector panel for clip properties",
};

// Keyboard shortcuts for video editing
export const shortcuts = {
  blade: "Command+B",
  select: "A",
  trim: "T",
  zoom: "Z",
  play: "Space",
  rippleDelete: "Shift+Delete",
  copy: "Command+C",
  paste: "Command+V",
  undo: "Command+Z",
  redo: "Command+Shift+Z",
  selectAll: "Command+A",
  markIn: "I",
  markOut: "O",
};

// Common workflows
export const workflows: AppWorkflow[] = [
  {
    name: "Export Video",
    steps: [
      "Click File menu",
      "Select Share > Master File",
      "Choose format",
      "Click Next",
      "Click Save",
    ],
  },
  {
    name: "Import Media",
    steps: [
      "Click File menu",
      "Select Import > Media",
      "Choose files",
      "Click Import",
    ],
  },
];

export const appProfile = {
  name: "Final Cut Pro",
  bundleId: "com.apple.FinalCut",
  buttons,
  toolbars,
  menuPaths,
  workflows,
};
