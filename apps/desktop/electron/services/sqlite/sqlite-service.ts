import { readFileSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { ConfigurationManager, Logger, SQLiteService as SQLiteServiceContract } from '../../shared/interfaces/services.js';

export class SQLiteService implements SQLiteServiceContract {
  private readonly db: Database.Database;

  constructor(config: ConfigurationManager, private readonly logger: Logger) {
    this.db = new Database(path.join(config.getPath('database'), 'delta-force-doctor.sqlite'));
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.exec(readFileSync(config.getPath('schema'), 'utf8'));
    this.logger.info('SQLite initialized');
  }

  connection(): Database.Database { return this.db; }

  close(): void {
    this.db.close();
    this.logger.info('SQLite connection closed');
  }
}
