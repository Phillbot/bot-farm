import { injectable } from 'inversify';

export interface CronStatusSnapshot {
  name: string;
  running: boolean;
  lastTick?: string;
}

@injectable()
export class CronStatusRegistry {
  private readonly _statuses = new Map<string, CronStatusSnapshot>();

  setRunning(name: string, running: boolean): void {
    const snapshot = this._statuses.get(name) ?? { name, running: false };
    snapshot.running = running;
    this._statuses.set(name, snapshot);
  }

  markTick(name: string): void {
    const snapshot = this._statuses.get(name) ?? { name, running: false };
    snapshot.lastTick = new Date().toISOString();
    this._statuses.set(name, snapshot);
  }

  getSnapshots(): CronStatusSnapshot[] {
    return Array.from(this._statuses.values());
  }
}

