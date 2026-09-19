import ballerina/http;

// Copied verbatim from the OpenAPI contract at
// specs/design/components/office-api/openapi.yaml — do not diverge.

public type Error record {|
    int code;
    string message;
    string description?;
    string moreInfo?;
|};

public type ErrorBadRequest record {|
    *http:BadRequest;
    Error body;
|};

public type ErrorNotFound record {|
    *http:NotFound;
    Error body;
|};

public type GuestAccount record {|
    string id;
    string name;
    string email;
    boolean active;
|};

public type GuestAccountInput record {|
    string name;
    string email;
    boolean active = true;
|};

public type GuestAccountPage record {|
    int count;
    string? next = ();
    string? previous = ();
    GuestAccount[] data;
|};

public type Asset record {|
    string id;
    string name;
    string category;
    "available"|"in-use"|"retired" status;
    string condition;
    string location?;
    string? assignedToId?;
|};

public type AssetInput record {|
    string name;
    string category;
    "available"|"in-use"|"retired" status;
    string condition;
    string location?;
    string? assignedToId?;
|};

public type AssetPage record {|
    int count;
    string? next = ();
    string? previous = ();
    Asset[] data;
|};

public type Request record {|
    string id;
    "new-equipment"|"issue" 'type;
    "open"|"approved"|"rejected"|"resolved" status;
    string description?;
    string requestedById;
    string? assetId?;
|};

public type RequestInput record {|
    "new-equipment"|"issue" 'type;
    string description;
    string? assetId?;
|};

public type RequestStatusUpdate record {|
    "approved"|"rejected"|"resolved" status;
|};

public type RequestPage record {|
    int count;
    string? next = ();
    string? previous = ();
    Request[] data;
|};

// Internal row shapes: the DB stores the enum-typed columns as plain TEXT, so
// a row is read into one of these first and converted with `ensureType()`
// before it becomes a public schema type above.

type AssetRow record {|
    string id;
    string name;
    string category;
    string status;
    string condition;
    string location;
    string? assignedToId;
|};

type RequestRow record {|
    string id;
    string 'type;
    string status;
    string description;
    string requestedById;
    string? assetId;
|};

function assetFromRow(AssetRow row) returns Asset|error {
    "available"|"in-use"|"retired" status = check row.status.ensureType();
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        status,
        condition: row.condition,
        location: row.location,
        assignedToId: row.assignedToId
    };
}

function requestFromRow(RequestRow row) returns Request|error {
    "new-equipment"|"issue" reqType = check row.'type.ensureType();
    "open"|"approved"|"rejected"|"resolved" reqStatus = check row.status.ensureType();
    return {
        id: row.id,
        'type: reqType,
        status: reqStatus,
        description: row.description,
        requestedById: row.requestedById,
        assetId: row.assetId
    };
}
