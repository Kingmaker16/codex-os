// Content Routing Engine v2 ULTRA - State Manager

import type { RouteState } from '../types.js';

class StateManager {
  private routes: Map<string, RouteState> = new Map();

  createRoute(route: RouteState): void {
    this.routes.set(route.routeId, route);
  }

  getRoute(routeId: string): RouteState | undefined {
    return this.routes.get(routeId);
  }

  updateRoute(routeId: string, updates: Partial<RouteState>): void {
    const existing = this.routes.get(routeId);
    if (existing) {
      this.routes.set(routeId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    }
  }

  getAllRoutes(): RouteState[] {
    return Array.from(this.routes.values());
  }

  deleteRoute(routeId: string): void {
    this.routes.delete(routeId);
  }
}

export const stateManager = new StateManager();
