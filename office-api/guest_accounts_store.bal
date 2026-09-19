import ballerina/sql;
import ballerina/uuid;

function countGuestAccounts() returns int|error {
    int total = check dbClient->queryRow(`SELECT COUNT(*) FROM guest_accounts`);
    return total;
}

function listGuestAccountsPage(int 'limit, int offset) returns GuestAccount[]|error {
    stream<GuestAccount, sql:Error?> rows = dbClient->query(
        `SELECT id, name, email, active FROM guest_accounts ORDER BY name LIMIT ${'limit} OFFSET ${offset}`
    );
    GuestAccount[] accounts = [];
    check from GuestAccount account in rows
        do {
            accounts.push(account);
        };
    return accounts;
}

function findGuestAccountByEmail(string email) returns GuestAccount?|error {
    GuestAccount|sql:Error result = dbClient->queryRow(
        `SELECT id, name, email, active FROM guest_accounts WHERE email = ${email}`
    );
    if result is sql:NoRowsError {
        return ();
    }
    if result is sql:Error {
        return result;
    }
    return result;
}

function findGuestAccountById(string accountId) returns GuestAccount?|error {
    GuestAccount|sql:Error result = dbClient->queryRow(
        `SELECT id, name, email, active FROM guest_accounts WHERE id = ${accountId}`
    );
    if result is sql:NoRowsError {
        return ();
    }
    if result is sql:Error {
        return result;
    }
    return result;
}

function emailInUse(string email) returns boolean|error {
    int count = check dbClient->queryRow(`SELECT COUNT(*) FROM guest_accounts WHERE email = ${email}`);
    return count > 0;
}

function emailInUseExcluding(string email, string excludingId) returns boolean|error {
    int count = check dbClient->queryRow(
        `SELECT COUNT(*) FROM guest_accounts WHERE email = ${email} AND id != ${excludingId}`
    );
    return count > 0;
}

function insertGuestAccount(GuestAccountInput input) returns GuestAccount|error {
    string id = uuid:createRandomUuid();
    _ = check dbClient->execute(
        `INSERT INTO guest_accounts (id, name, email, active) VALUES (${id}, ${input.name}, ${input.email}, ${input.active})`
    );
    return {id, name: input.name, email: input.email, active: input.active};
}

function updateGuestAccountRow(string accountId, GuestAccountInput input) returns GuestAccount?|error {
    sql:ExecutionResult result = check dbClient->execute(
        `UPDATE guest_accounts SET name = ${input.name}, email = ${input.email}, active = ${input.active}
         WHERE id = ${accountId}`
    );
    int? affected = result.affectedRowCount;
    if affected is () || affected == 0 {
        return ();
    }
    return {id: accountId, name: input.name, email: input.email, active: input.active};
}

function deleteGuestAccountRow(string accountId) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(`DELETE FROM guest_accounts WHERE id = ${accountId}`);
    int? affected = result.affectedRowCount;
    return affected is int && affected > 0;
}
