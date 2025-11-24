/**
 * Vision Engine v2 - Type Definitions
 */

export interface ImageAnalysisRequest {
  image: string;  // base64 encoded
  prompt?: string;
  mode?: "general" | "ui" | "chart" | "face" | "ocr";
}

export interface ImageAnalysisResult {
  description: string;
  objects: DetectedObject[];
  text: ExtractedText[];
  faces?: FaceData[];
  sentiment?: string;
  confidence: number;
  models: string[];
  timestamp: string;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox?: BoundingBox;
  attributes?: Record<string, any>;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedText {
  text: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface FaceData {
  emotions: Record<string, number>;
  engagement: number;
  attention: number;
  boundingBox?: BoundingBox;
}

export interface VideoAnalysisRequest {
  video?: string;  // base64 or URL
  videoChunks?: string[];  // base64 frames
  prompt?: string;
}

export interface VideoAnalysisResult {
  summary: string;
  timestamps: VideoTimestamp[];
  insights: string[];
  objects: string[];
  actions: string[];
  confidence: number;
}

export interface VideoTimestamp {
  time: number;  // seconds
  description: string;
  keyObjects: string[];
}

export interface ScreenAnalysisRequest {
  screenshot: string;  // base64 PNG
  profile?: string;    // UI profile
}

export interface ScreenAnalysisResult {
  app: string;  // Detected app name
  resolution: { width: number; height: number };
  uiElements: UIElement[];
  textBlocks: ExtractedText[];
  clickTargets: ClickTarget[];
  suggestedActions: string[];
  profile?: string;
  timestamp: string;
}

export interface UIElement {
  type: "button" | "menu" | "toolbar" | "panel" | "input" | "other";
  label: string;
  text?: string;
  boundingBox: BoundingBox;
  center: { x: number; y: number };
  clickable: boolean;
  confidence: number;
  state?: string;
}

export interface ClickTarget {
  label: string;
  x: number;
  y: number;
  action: string;
}

export interface UIMapRequest {
  screenshot: string;
  profile: string;  // photoshop, finalcut, logic, chrome, finder
}

export interface UIMapResult {
  elements: UIElement[];  // All interactive elements
  toolbars: UIRegion[];
  panels: UIRegion[];
  canvas: UIRegion;
  interactables: UIElement[];
}

export interface UIRegion {
  name: string;
  boundingBox: BoundingBox;
  elements: UIElement[];
}

export interface OCRRequest {
  image: string;
  language?: string;
}

export interface OCRResult {
  text: string;
  blocks: ExtractedText[];
  confidence: number;
}

export interface ChartAnalysisRequest {
  chart: string;  // base64 chart image
  type?: "candlestick" | "line" | "bar";
}

export interface ChartAnalysisResult {
  patterns: ChartPattern[];
  supportLevels: number[];
  resistanceLevels: number[];
  volumeBlocks: VolumeBlock[];
  liquidityZones: LiquidityZone[];
  orderBlocks: OrderBlock[];
  trendlines: Trendline[];
  signals: TradingSignal[];
}

export interface ChartPattern {
  type: string;
  confidence: number;
  location: BoundingBox;
  signal: "bullish" | "bearish" | "neutral";
}

export interface VolumeBlock {
  price: number;
  volume: number;
  type: "high" | "low";
}

export interface LiquidityZone {
  priceRange: [number, number];
  strength: number;
}

export interface OrderBlock {
  priceRange: [number, number];
  type: "demand" | "supply";
  strength: number;
}

export interface Trendline {
  points: Array<{ x: number; y: number }>;
  direction: "up" | "down";
  strength: number;
}

export interface TradingSignal {
  action: "buy" | "sell" | "hold";
  confidence: number;
  reasoning: string;
}

export interface ARStreamFrame {
  image: string;  // base64 JPEG/PNG
  timestamp: number;
}

export interface ARStreamResponse {
  suggestions: string[];
  objects: DetectedObject[];
  emotions: FaceData[];
  text: ExtractedText[];
  timestamp: number;
}

export interface FusionRequest {
  image: string;
  prompt: string;
  providers?: string[];
}

export interface FusionResponse {
  result: string;
  confidence: number;
  sources: Array<{
    provider: string;
    model: string;
    response: string;
    confidence: number;
  }>;
  consensus: boolean;
}
