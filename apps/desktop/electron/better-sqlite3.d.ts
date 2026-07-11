declare module 'better-sqlite3' {
  namespace Database {
    interface Database {
      pragma(source: string): unknown;
      exec(source: string): Database;
      prepare(source: string): Statement;
    }
    interface Statement {
      run(...params: unknown[]): unknown;
      all(...params: unknown[]): unknown[];
    }
  }
  interface DatabaseConstructor {
    new(filename: string): Database.Database;
    (filename: string): Database.Database;
  }
  const Database: DatabaseConstructor;
  export = Database;
}
