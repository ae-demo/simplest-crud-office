import ballerina/http;

listener http:Listener ep0 = new (9090);

service http:InterceptableService / on ep0 {

    public function createInterceptors() returns AssertionInterceptor => new;

    // ---- guest-accounts: every row, no filtering (guest-accounts:manage) ----

    resource function get guest\-accounts(int 'limit = 20, int offset = 0) returns GuestAccountPage|error {
        int total = check countGuestAccounts();
        GuestAccount[] data = check listGuestAccountsPage('limit, offset);
        [string?, string?] links = pageLinks("/guest-accounts", 'limit, offset, total, "");
        return {count: total, next: links[0], previous: links[1], data};
    }

    resource function post guest\-accounts(@http:Payload GuestAccountInput payload) returns GuestAccount|ErrorBadRequest|error {
        boolean inUse = check emailInUse(payload.email);
        if inUse {
            return <ErrorBadRequest>{body: {code: 400, message: "email already in use"}};
        }
        return check insertGuestAccount(payload);
    }

    resource function put guest\-accounts/[string accountId](@http:Payload GuestAccountInput payload)
            returns GuestAccount|ErrorNotFound|ErrorBadRequest|error {
        boolean inUse = check emailInUseExcluding(payload.email, accountId);
        if inUse {
            return <ErrorBadRequest>{body: {code: 400, message: "email already in use"}};
        }
        GuestAccount? updated = check updateGuestAccountRow(accountId, payload);
        if updated is () {
            return <ErrorNotFound>{body: {code: 404, message: "no such guest account"}};
        }
        return updated;
    }

    resource function delete guest\-accounts/[string accountId]() returns http:NoContent|ErrorNotFound|error {
        boolean deleted = check deleteGuestAccountRow(accountId);
        if !deleted {
            return <ErrorNotFound>{body: {code: 404, message: "no such guest account"}};
        }
        return http:NO_CONTENT;
    }

    // ---- assets: every row, no filtering (assets:read-all / assets:manage) ----

    resource function get assets("available"|"in-use"|"retired"? status, int 'limit = 20, int offset = 0)
            returns AssetPage|error {
        int total = check countAssets(status);
        Asset[] data = check listAssetsPage(status, 'limit, offset);
        string extra = status is string ? "&status=" + status : "";
        [string?, string?] links = pageLinks("/assets", 'limit, offset, total, extra);
        return {count: total, next: links[0], previous: links[1], data};
    }

    resource function post assets(@http:Payload AssetInput payload) returns Asset|ErrorBadRequest|error {
        string? assignedToId = payload?.assignedToId;
        if assignedToId is string {
            GuestAccount? owner = check findGuestAccountById(assignedToId);
            if owner is () {
                return <ErrorBadRequest>{body: {code: 400, message: "assignedToId does not reference an existing guest account"}};
            }
        }
        return check insertAsset(payload);
    }

    resource function put assets/[string assetId](@http:Payload AssetInput payload)
            returns Asset|ErrorNotFound|ErrorBadRequest|error {
        string? assignedToId = payload?.assignedToId;
        if assignedToId is string {
            GuestAccount? owner = check findGuestAccountById(assignedToId);
            if owner is () {
                return <ErrorBadRequest>{body: {code: 400, message: "assignedToId does not reference an existing guest account"}};
            }
        }
        Asset? updated = check updateAssetRow(assetId, payload);
        if updated is () {
            return <ErrorNotFound>{body: {code: 404, message: "no such asset"}};
        }
        return updated;
    }

    resource function delete assets/[string assetId]() returns http:NoContent|ErrorNotFound|error {
        boolean deleted = check deleteAssetRow(assetId);
        if !deleted {
            return <ErrorNotFound>{body: {code: 404, message: "no such asset"}};
        }
        return http:NO_CONTENT;
    }

    // ---- /me/assets: the caller's own assigned assets (assets:read) ----

    resource function get me/assets(http:RequestContext ctx, int 'limit = 20, int offset = 0)
            returns AssetPage|http:Unauthorized|http:InternalServerError|ErrorNotFound|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError email = requireCallerEmail(caller);
        if email is http:InternalServerError {
            return email;
        }
        GuestAccount? account = check findGuestAccountByEmail(email);
        if account is () {
            return <ErrorNotFound>{body: {code: 404, message: "no guest account matches the caller's identity"}};
        }
        int total = check countAssetsAssignedTo(account.id);
        Asset[] data = check listAssetsAssignedToPage(account.id, 'limit, offset);
        [string?, string?] links = pageLinks("/me/assets", 'limit, offset, total, "");
        return {count: total, next: links[0], previous: links[1], data};
    }

    // ---- requests: every row (requests:read-all / requests:manage) ----

    resource function get requests("open"|"approved"|"rejected"|"resolved"? status, int 'limit = 20, int offset = 0)
            returns RequestPage|error {
        int total = check countRequests(status);
        Request[] data = check listRequestsPage(status, 'limit, offset);
        string extra = status is string ? "&status=" + status : "";
        [string?, string?] links = pageLinks("/requests", 'limit, offset, total, extra);
        return {count: total, next: links[0], previous: links[1], data};
    }

    resource function put requests/[string requestId]/status(@http:Payload RequestStatusUpdate payload)
            returns Request|ErrorNotFound|error {
        Request? updated = check updateRequestStatusRow(requestId, payload.status);
        if updated is () {
            return <ErrorNotFound>{body: {code: 404, message: "no such request"}};
        }
        return updated;
    }

    // ---- /me/requests: the caller's own requests (requests:read / requests:submit) ----

    resource function get me/requests(http:RequestContext ctx, int 'limit = 20, int offset = 0)
            returns RequestPage|http:Unauthorized|http:InternalServerError|ErrorNotFound|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError email = requireCallerEmail(caller);
        if email is http:InternalServerError {
            return email;
        }
        GuestAccount? account = check findGuestAccountByEmail(email);
        if account is () {
            return <ErrorNotFound>{body: {code: 404, message: "no guest account matches the caller's identity"}};
        }
        int total = check countRequestsBy(account.id);
        Request[] data = check listRequestsByPage(account.id, 'limit, offset);
        [string?, string?] links = pageLinks("/me/requests", 'limit, offset, total, "");
        return {count: total, next: links[0], previous: links[1], data};
    }

    resource function post me/requests(http:RequestContext ctx, @http:Payload RequestInput payload)
            returns Request|ErrorBadRequest|http:Unauthorized|http:InternalServerError|ErrorNotFound|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError email = requireCallerEmail(caller);
        if email is http:InternalServerError {
            return email;
        }
        GuestAccount? account = check findGuestAccountByEmail(email);
        if account is () {
            return <ErrorNotFound>{body: {code: 404, message: "no guest account matches the caller's identity"}};
        }
        string? assetId = payload?.assetId;
        if payload.'type == "issue" && assetId is () {
            return <ErrorBadRequest>{body: {code: 400, message: "an issue request needs an assetId"}};
        }
        if assetId is string {
            Asset? asset = check findAssetById(assetId);
            if asset is () {
                return <ErrorBadRequest>{body: {code: 400, message: "assetId does not reference an existing asset"}};
            }
        }
        return check insertRequest(account.id, payload);
    }
}
