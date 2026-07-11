CREATE TABLE IF NOT EXISTS errors (
  error_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info','low','medium','high','critical')),
  description TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  detection_rule TEXT NOT NULL,
  possible_causes TEXT NOT NULL,
  repair_steps TEXT NOT NULL,
  automatic_repair_supported INTEGER NOT NULL DEFAULT 0,
  require_admin INTEGER NOT NULL DEFAULT 0,
  require_bios INTEGER NOT NULL DEFAULT 0,
  official_links TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  related_errors TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_id TEXT NOT NULL REFERENCES errors(error_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('safe','guided','admin','bios')),
  execution_type TEXT NOT NULL CHECK (execution_type IN ('manual','powershell','external_link','steam_uri')),
  command TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS error_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_id TEXT NOT NULL REFERENCES errors(error_id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  ocr_text TEXT NOT NULL DEFAULT '',
  perceptual_hash TEXT
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor TEXT NOT NULL,
  device_class TEXT NOT NULL,
  device_name TEXT NOT NULL,
  installed_version TEXT,
  release_date TEXT,
  official_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',
  scanned_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_scan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  scanner_id TEXT NOT NULL,
  status TEXT NOT NULL,
  severity TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  repair_available INTEGER NOT NULL DEFAULT 0,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  provider TEXT NOT NULL,
  event_id INTEGER,
  level TEXT,
  message TEXT NOT NULL,
  matched_error_id TEXT REFERENCES errors(error_id),
  time_created TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repair_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repair_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  command TEXT,
  output TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scan_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL UNIQUE,
  summary_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component TEXT NOT NULL,
  current_version TEXT NOT NULL,
  latest_version TEXT,
  official_url TEXT,
  checked_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_system_scan_run ON system_scan(run_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_run ON event_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_errors_category ON errors(category);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON errors(severity);
