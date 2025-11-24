/**
 * Hands v4.6 — Adobe Premiere Pro App Profile
 * 
 * UI element definitions and coordinates for Premiere Pro
 */

export interface AppWorkflow {
  name: string;
  steps: any[];
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
}

export const appName = "Adobe Premiere Pro";

// Menu paths for common operations
export const menuPaths = {
  newProject: ["File", "New", "Project..."],
  openProject: ["File", "Open Project..."],
  newSequence: ["File", "New", "Sequence..."],
  import: ["File", "Import..."],
  export: ["File", "Export", "Media..."],
  addEdit: ["Sequence", "Add Edit"],
  rippleDelete: ["Edit", "Ripple Delete"],
  applyTransition: ["Sequence", "Apply Video Transition"],
  undo: ["Edit", "Undo"],
  redo: ["Edit", "Redo"],
  preferences: ["Premiere Pro", "Preferences"],
};

// Panel regions (approximate - need to be mapped per screen resolution)
export const timelineRegion: Region = {
  x: 0,
  y: 700,
  width: 1920,
  height: 380,
  description: "Timeline panel where clips are arranged",
};

export const projectPanelRegion: Region = {
  x: 0,
  y: 50,
  width: 400,
  height: 600,
  description: "Project panel showing imported media",
};

export const programMonitorRegion: Region = {
  x: 800,
  y: 50,
  width: 700,
  height: 500,
  description: "Program monitor showing sequence output",
};

export const sourceMonitorRegion: Region = {
  x: 400,
  y: 50,
  width: 400,
  height: 500,
  description: "Source monitor for previewing clips",
};

export const effectsPanelRegion: Region = {
  x: 1520,
  y: 50,
  width: 400,
  height: 600,
  description: "Effects panel with video/audio effects",
};

export const toolbarRegion: Region = {
  x: 0,
  y: 0,
  width: 1920,
  height: 50,
  description: "Main toolbar with selection, razor, pen tools",
};

// Common tool coordinates (relative to toolbar)
export const tools = {
  selection: { x: 30, y: 25, name: "Selection Tool" },
  razor: { x: 100, y: 25, name: "Razor Tool" },
  pen: { x: 170, y: 25, name: "Pen Tool" },
  hand: { x: 240, y: 25, name: "Hand Tool" },
  zoom: { x: 310, y: 25, name: "Zoom Tool" },
};

// Keyboard shortcuts
export const shortcuts = {
  // Playback
  play: "Space",
  stop: "K",
  stepForward: "Right",
  stepBackward: "Left",
  jumpForward: "Shift+Right",
  jumpBackward: "Shift+Left",
  
  // Editing
  cut: "Command+K",
  copy: "Command+C",
  paste: "Command+V",
  undo: "Command+Z",
  redo: "Command+Shift+Z",
  rippleDelete: "Shift+Delete",
  
  // Selection
  selectAll: "Command+A",
  deselectAll: "Command+Shift+A",
  
  // Timeline
  zoomIn: "=",
  zoomOut: "-",
  fitTimeline: "\\",
  
  // Tools
  selectionTool: "V",
  razorTool: "C",
  penTool: "P",
  handTool: "H",
  zoomTool: "Z",
  
  // Markers
  addMarker: "M",
  
  // Export
  exportMedia: "Command+M",
};

// Common workflows
export const workflows: AppWorkflow[] = [
  {
    name: "Import and Place Media",
    steps: [
      { action: "selectMenu", params: ["File", "Import..."] },
      { action: "wait", params: 1000 },
      { action: "typeText", params: "path/to/media" },
      { action: "keyPress", params: "return" },
      { action: "wait", params: 2000 },
      { action: "keyPress", params: "," }, // Place on timeline
    ],
  },
  {
    name: "Split and Delete Clip",
    steps: [
      { action: "selectMenu", params: ["Sequence", "Add Edit"] },
      { action: "wait", params: 500 },
      { action: "selectMenu", params: ["Edit", "Ripple Delete"] },
      { action: "wait", params: 300 },
    ],
  },
  {
    name: "Export Project",
    steps: [
      { action: "selectMenu", params: ["File", "Export", "Media..."] },
      { action: "wait", params: 2000 },
      { action: "keyPress", params: "return" }, // Accept default settings
      { action: "wait", params: 5000 }, // Export processing
    ],
  },
];
