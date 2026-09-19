import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

final postgresql:Client dbClient = check new (
    host = officeDbHost,
    username = officeDbUser,
    password = officeDbPassword,
    database = officeDbName,
    port = check int:fromString(officeDbPort)
);

// Fails startup fast when the schema cannot be created, rather than 500-ing
// the first request. Runs before any listener starts.
final () dbReady = check initDb();

function initDb() returns error? {
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS guest_accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            active BOOLEAN NOT NULL DEFAULT TRUE
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL,
            condition TEXT NOT NULL,
            location TEXT NOT NULL DEFAULT '',
            assigned_to_id TEXT REFERENCES guest_accounts(id) ON DELETE SET NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            requested_by_id TEXT NOT NULL REFERENCES guest_accounts(id) ON DELETE CASCADE,
            asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL
        )
    `);
    return;
}
