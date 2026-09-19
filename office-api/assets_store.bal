import ballerina/sql;
import ballerina/uuid;

function countAssets(string? status) returns int|error {
    sql:ParameterizedQuery query = `SELECT COUNT(*) FROM assets`;
    if status is string {
        query = sql:queryConcat(query, ` WHERE status = ${status}`);
    }
    int total = check dbClient->queryRow(query);
    return total;
}

function listAssetsPage(string? status, int 'limit, int offset) returns Asset[]|error {
    sql:ParameterizedQuery query =
        `SELECT id, name, category, status, condition, location, assigned_to_id AS "assignedToId" FROM assets`;
    if status is string {
        query = sql:queryConcat(query, ` WHERE status = ${status}`);
    }
    query = sql:queryConcat(query, ` ORDER BY name LIMIT ${'limit} OFFSET ${offset}`);
    stream<AssetRow, sql:Error?> rows = dbClient->query(query);
    Asset[] assets = [];
    check from AssetRow row in rows
        do {
            Asset asset = check assetFromRow(row);
            assets.push(asset);
        };
    return assets;
}

function countAssetsAssignedTo(string accountId) returns int|error {
    int total = check dbClient->queryRow(`SELECT COUNT(*) FROM assets WHERE assigned_to_id = ${accountId}`);
    return total;
}

function listAssetsAssignedToPage(string accountId, int 'limit, int offset) returns Asset[]|error {
    stream<AssetRow, sql:Error?> rows = dbClient->query(
        `SELECT id, name, category, status, condition, location, assigned_to_id AS "assignedToId" FROM assets
         WHERE assigned_to_id = ${accountId} ORDER BY name LIMIT ${'limit} OFFSET ${offset}`
    );
    Asset[] assets = [];
    check from AssetRow row in rows
        do {
            Asset asset = check assetFromRow(row);
            assets.push(asset);
        };
    return assets;
}

function findAssetById(string assetId) returns Asset?|error {
    AssetRow|sql:Error result = dbClient->queryRow(
        `SELECT id, name, category, status, condition, location, assigned_to_id AS "assignedToId" FROM assets
         WHERE id = ${assetId}`
    );
    if result is sql:NoRowsError {
        return ();
    }
    if result is sql:Error {
        return result;
    }
    return check assetFromRow(result);
}

function insertAsset(AssetInput input) returns Asset|error {
    string id = uuid:createRandomUuid();
    string location = input?.location ?: "";
    string? assignedToId = input?.assignedToId;
    _ = check dbClient->execute(
        `INSERT INTO assets (id, name, category, status, condition, location, assigned_to_id)
         VALUES (${id}, ${input.name}, ${input.category}, ${input.status}, ${input.condition}, ${location}, ${assignedToId})`
    );
    return {
        id,
        name: input.name,
        category: input.category,
        status: input.status,
        condition: input.condition,
        location,
        assignedToId
    };
}

function updateAssetRow(string assetId, AssetInput input) returns Asset?|error {
    string location = input?.location ?: "";
    string? assignedToId = input?.assignedToId;
    sql:ExecutionResult result = check dbClient->execute(
        `UPDATE assets SET name = ${input.name}, category = ${input.category}, status = ${input.status},
         condition = ${input.condition}, location = ${location}, assigned_to_id = ${assignedToId}
         WHERE id = ${assetId}`
    );
    int? affected = result.affectedRowCount;
    if affected is () || affected == 0 {
        return ();
    }
    return {
        id: assetId,
        name: input.name,
        category: input.category,
        status: input.status,
        condition: input.condition,
        location,
        assignedToId
    };
}

function deleteAssetRow(string assetId) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(`DELETE FROM assets WHERE id = ${assetId}`);
    int? affected = result.affectedRowCount;
    return affected is int && affected > 0;
}
