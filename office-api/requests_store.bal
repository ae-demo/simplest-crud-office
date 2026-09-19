import ballerina/sql;
import ballerina/uuid;

function countRequests(string? status) returns int|error {
    sql:ParameterizedQuery query = `SELECT COUNT(*) FROM requests`;
    if status is string {
        query = sql:queryConcat(query, ` WHERE status = ${status}`);
    }
    int total = check dbClient->queryRow(query);
    return total;
}

function listRequestsPage(string? status, int 'limit, int offset) returns Request[]|error {
    sql:ParameterizedQuery query =
        `SELECT id, type, status, description, requested_by_id AS "requestedById", asset_id AS "assetId" FROM requests`;
    if status is string {
        query = sql:queryConcat(query, ` WHERE status = ${status}`);
    }
    query = sql:queryConcat(query, ` ORDER BY id LIMIT ${'limit} OFFSET ${offset}`);
    stream<RequestRow, sql:Error?> rows = dbClient->query(query);
    Request[] requests = [];
    check from RequestRow row in rows
        do {
            Request request = check requestFromRow(row);
            requests.push(request);
        };
    return requests;
}

function countRequestsBy(string accountId) returns int|error {
    int total = check dbClient->queryRow(`SELECT COUNT(*) FROM requests WHERE requested_by_id = ${accountId}`);
    return total;
}

function listRequestsByPage(string accountId, int 'limit, int offset) returns Request[]|error {
    stream<RequestRow, sql:Error?> rows = dbClient->query(
        `SELECT id, type, status, description, requested_by_id AS "requestedById", asset_id AS "assetId" FROM requests
         WHERE requested_by_id = ${accountId} ORDER BY id LIMIT ${'limit} OFFSET ${offset}`
    );
    Request[] requests = [];
    check from RequestRow row in rows
        do {
            Request request = check requestFromRow(row);
            requests.push(request);
        };
    return requests;
}

function insertRequest(string accountId, RequestInput input) returns Request|error {
    string id = uuid:createRandomUuid();
    string? assetId = input?.assetId;
    string status = "open";
    _ = check dbClient->execute(
        `INSERT INTO requests (id, type, status, description, requested_by_id, asset_id)
         VALUES (${id}, ${input.'type}, ${status}, ${input.description}, ${accountId}, ${assetId})`
    );
    return {
        id,
        'type: input.'type,
        status: "open",
        description: input.description,
        requestedById: accountId,
        assetId
    };
}

function updateRequestStatusRow(string requestId, "approved"|"rejected"|"resolved" status) returns Request?|error {
    sql:ExecutionResult result = check dbClient->execute(
        `UPDATE requests SET status = ${status} WHERE id = ${requestId}`
    );
    int? affected = result.affectedRowCount;
    if affected is () || affected == 0 {
        return ();
    }
    RequestRow row = check dbClient->queryRow(
        `SELECT id, type, status, description, requested_by_id AS "requestedById", asset_id AS "assetId" FROM requests
         WHERE id = ${requestId}`
    );
    return check requestFromRow(row);
}
