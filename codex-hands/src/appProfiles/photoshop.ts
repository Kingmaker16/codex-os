/**
 * Hands v4.6 — App Profile: Adobe Photoshop (Enhanced)
 * 
 * UI element definitions and coordinates for Photoshop automation
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
  steps: any[];
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
}

// Known buttons (to be filled with actual coordinates)
export const buttons: AppButton[] = [
  { name: "Export", description: "Export button in toolbar" },
  { name: "Save", description: "Save button" },
  { name: "Layers", description: "Layers panel toggle" },
  { name: "Brush", description: "Brush tool" },
  { name: "Selection", description: "Selection tool" },
];

// Known toolbars
export const toolbars: AppToolbar[] = [
  {
    name: "Main Toolbar",
    buttons: [
      { name: "Move Tool" },
      { name: "Selection Tool" },
      { name: "Crop Tool" },
      { name: "Brush Tool" },
      { name: "Eraser Tool" },
    ],
  },
];

// Common menu paths (enhanced v4.6)
export const menuPaths = {
  // File operations
  newDocument: ["File", "New..."],
  open: ["File", "Open..."],
  save: ["File", "Save"],
  saveAs: ["File", "Save As..."],
  placeEmbedded: ["File", "Place Embedded..."],
  export: ["File", "Export", "Export As..."],
  exportQuickPNG: ["File", "Export", "Quick Export as PNG"],
  
  // Selection
  selectSubject: ["Select", "Subject"],
  selectInverse: ["Select", "Inverse"],
  deselect: ["Select", "Deselect"],
  
  // Filters
  gaussianBlur: ["Filter", "Blur", "Gaussian Blur..."],
  sharpen: ["Filter", "Sharpen", "Sharpen"],
  
  // Adjustments
  brightnessContrast: ["Image", "Adjustments", "Brightness/Contrast..."],
  hueSaturation: ["Image", "Adjustments", "Hue/Saturation..."],
  
  // Image
  imageSize: ["Image", "Image Size..."],
  
  // Layer
  newLayer: ["Layer", "New", "Layer..."],
  duplicateLayer: ["Layer", "Duplicate Layer..."],
  flatten: ["Layer", "Flatten Image"],
  
  // Edit
  undo: ["Edit", "Undo"],
  redo: ["Edit", "Redo"],
  preferences: ["Photoshop", "Preferences"],
};

// Panel regions (v4.6)
export const regions = {
  canvas: { x: 400, y: 50, width: 1100, height: 900, description: "Main canvas" },
  layers: { x: 1520, y: 400, width: 400, height: 550, description: "Layers panel" },
  properties: { x: 1520, y: 50, width: 400, height: 350, description: "Properties panel" },
  toolbar: { x: 0, y: 50, width: 100, height: 900, description: "Toolbar" },
};

// Keyboard shortcuts (v4.6)
export const shortcuts = {
  // Tools
  moveTool: "V",
  selectTool: "M",
  brushTool: "B",
  eraserTool: "E",
  textTool: "T",
  handTool: "H",
  zoomTool: "Z",
  
  // Edit
  undo: "Command+Z",
  redo: "Command+Shift+Z",
  copy: "Command+C",
  paste: "Command+V",
  
  // Selection
  selectAll: "Command+A",
  deselect: "Command+D",
  inverse: "Command+Shift+I",
  
  // Layers
  newLayer: "Command+Shift+N",
  duplicateLayer: "Command+J",
};

// Common workflows (enhanced v4.6)
export const workflows: AppWorkflow[] = [
  {
    name: "Remove Background",
    steps: [
      { action: "selectMenu", params: ["Select", "Subject"] },
      { action: "wait", params: 2000 },
      { action: "selectMenu", params: ["Select", "Inverse"] },
      { action: "keyPress", params: "delete" },
      { action: "selectMenu", params: ["Select", "Deselect"] },
    ],
  },
  {
    name: "Add Text Layer",
    steps: [
      { action: "keyPress", params: "t" },
      { action: "clickXY", params: [500, 300] },
      { action: "typeText", params: "Text here" },
      { action: "keyPress", params: "escape" },
    ],
  },
  {
    name: "Export PNG",
    steps: [
      { action: "selectMenu", params: ["File", "Export", "Quick Export as PNG"] },
      { action: "wait", params: 1500 },
      { action: "keyPress", params: "return" },
    ],
  },
];

export const appProfile = {
  name: "Adobe Photoshop",
  bundleId: "com.adobe.Photoshop",
  buttons,
  toolbars,
  menuPaths,
  regions,
  shortcuts,
  workflows,
};
