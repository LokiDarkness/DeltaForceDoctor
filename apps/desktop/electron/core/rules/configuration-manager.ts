import { app } from 'electron';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { ConfigurationManager as ConfigurationManagerContract } from '../../shared/interfaces/services.js';

export class ElectronConfigurationManager implements ConfigurationManagerContract {
  constructor(private readonly dev: boolean) {}

  isDevelopment(): boolean { return this.dev; }

  getPath(name: 'userData' | 'documents' | 'logs' | 'database' | 'schema'): string {
    if (name === 'userData') return app.getPath('userData');
    if (name === 'documents') return app.getPath('documents');
    if (name === 'logs') {
      const logsPath = path.join(app.getPath('userData'), 'logs');
      mkdirSync(logsPath, { recursive: true });
      return logsPath;
    }
    if (name === 'database') {
      const databasePath = path.join(app.getPath('userData'), 'database');
      mkdirSync(databasePath, { recursive: true });
      return databasePath;
    }
    return this.dev ? path.join(process.cwd(), 'database/schema.sql') : path.join(process.resourcesPath, 'database/schema.sql');
  }
}
