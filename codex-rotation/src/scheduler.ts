import { fetchRiskSnapshots } from "./fetchers.js";
import { setRiskSnapshots } from "./state.js";

export async function startRotationScheduler() {
  async function tick() {
    try {
      const risks = await fetchRiskSnapshots();
      setRiskSnapshots(risks);
    } catch (err) {
      console.error("[RotationScheduler] Error refreshing risk snapshots:", err);
    } finally {
      setTimeout(tick, 60_000);
    }
  }

  tick();
}
