/**
 * Hands v4 — App Profile: CapCut
 * 
 * Known buttons, toolbars, menu paths, and workflows for CapCut automation
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
  { name: "Export", description: "Export button" },
  { name: "Play", description: "Play/Pause button" },
  { name: "Import", description: "Import media" },
  { name: "Text", description: "Add text" },
  { name: "Effects", description: "Effects panel" },
];

// Known toolbars
export const toolbars: AppToolbar[] = [
  {
    name: "Main Toolbar",
    buttons: [
      { name: "Select Tool" },
      { name: "Cut Tool" },
      { name: "Text Tool" },
      { name: "Effects Tool" },
    ],
  },
];

// Common menu paths (CapCut uses different UI paradigm)
export const menuPaths = {
  export: ["Export"],
  newProject: ["New Project"],
  save: ["Save Project"],
  import: ["File", "Import"], // Hands v4.5
  editCopy: ["Edit", "Copy"],
  editPaste: ["Edit", "Paste"],
};

// Hands v4.5 — Video editing features
export const timelineRegion = {
  // TODO: Map actual coordinates once UI is analyzed
  x: 100,
  y: 600,
  width: 1000,
  height: 200,
  description: "Main timeline area for clips",
};

export const previewRegion = {
  // TODO: Map actual coordinates
  x: 800,
  y: 100,
  width: 600,
  height: 400,
  description: "Video preview window",
};

// Keyboard shortcuts for video editing
export const shortcuts = {
  split: "Ctrl+B", // TODO: Verify CapCut shortcut
  delete: "Delete",
  play: "Space",
  undo: "Ctrl+Z",
  redo: "Ctrl+Shift+Z",
  copy: "Ctrl+C",
  paste: "Ctrl+V",
  selectAll: "Ctrl+A",
};

// Export button location (TODO: precise coordinates)
export const exportButton = {
  name: "Export",
  location: { x: 1100, y: 50 }, // TODO: Update after UI mapping
  description: "Export/Render button",
};

// Common workflows
export const workflows: AppWorkflow[] = [
  {
    name: "Export Video",
    steps: [
      "Click Export button",
      "Choose resolution",
      "Choose format",
      "Click Export",
    ],
  },
  {
    name: "Add Text",
    steps: [
      "Click Text button",
      "Click Add Text",
      "Type text",
      "Adjust position",
    ],
  },
];

export const appProfile = {
  name: "CapCut",
  bundleId: "com.lemon.lvpro",
  buttons,
  toolbars,
  menuPaths,
  workflows,
};
