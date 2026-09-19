# Domain Model

The system tracks office equipment assets, the guest accounts an Admin provisions, and the requests guests raise against that inventory.

```mermaid
erDiagram
    GuestAccount {
        string id PK
        string name
        string email
        boolean active
    }
    Asset {
        string id PK
        string name
        string category
        string status
        string condition
        string location
        string assignedToId FK
    }
    Request {
        string id PK
        string type
        string status
        string description
        string requestedById FK
        string assetId FK
    }
    GuestAccount ||--o{ Asset : "assigned"
    GuestAccount ||--o{ Request : "raises"
    Asset ||--o{ Request : "concerns"
```

- **GuestAccount**: an employee an Admin has provisioned; identified at sign-in by the same email as their Thunder identity.
- **Asset**: one inventory item; `assignedToId` links it to the GuestAccount currently responsible for it, and is optional (unassigned stock).
- **Request**: raised by a GuestAccount, either `new-equipment` (no `assetId`) or `issue` (against an existing `assetId`); `status` moves through `open`, `approved`, `rejected`, `resolved`.

