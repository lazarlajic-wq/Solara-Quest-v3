export interface AssetLoadError {
  key: string;
  path: string;
  reason: string;
}

/**
 * Collects load-time errors so BootScene can render a visible banner
 * instead of the game silently showing black squares for missing assets
 * (spec section 2, "verbindliche Qualitätsregeln").
 */
class ErrorLogStore {
  private errors: AssetLoadError[] = [];

  report(error: AssetLoadError): void {
    this.errors.push(error);
    // eslint-disable-next-line no-console
    console.error(`[Solara Quest] Asset failed to load: ${error.key} (${error.path}) — ${error.reason}`);
  }

  getAll(): AssetLoadError[] {
    return [...this.errors];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  clear(): void {
    this.errors = [];
  }
}

export const ErrorLog = new ErrorLogStore();
