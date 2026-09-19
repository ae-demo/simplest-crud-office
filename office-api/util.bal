// Relative next/previous links for a paginated collection envelope.
//
// + path - the collection's own path, e.g. "/assets"
// + 'limit - the page size the caller asked for
// + offset - the offset the caller asked for
// + count - total matching rows
// + extraQuery - any filter to repeat on the link, e.g. "&status=available" — "" for none
// + return - [next, previous], each () when there is no such page
function pageLinks(string path, int 'limit, int offset, int count, string extraQuery) returns [string?, string?] {
    string? next = ();
    string? previous = ();
    if offset + 'limit < count {
        next = string `${path}?limit=${'limit}&offset=${offset + 'limit}${extraQuery}`;
    }
    if offset > 0 {
        int prevOffset = offset - 'limit;
        if prevOffset < 0 {
            prevOffset = 0;
        }
        previous = string `${path}?limit=${'limit}&offset=${prevOffset}${extraQuery}`;
    }
    return [next, previous];
}
