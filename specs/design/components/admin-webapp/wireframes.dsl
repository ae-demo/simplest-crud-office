screen AssetInventory "Every asset in the office, at a glance"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  row
    heading "Asset Inventory"
    right
    search "Search assets"
    button "Add Asset" primary -> AssetForm
  table "Name | Category | Status | Condition | Location | Assigned To" -> AssetDetail
    row "Standing Desk | Furniture | in-use | good | 3rd Floor | Jane Doe"
    row "Laptop - Dell XPS | Electronics | available | good | Storage | —"
    row "Office Chair | Furniture | retired | worn | — | —"

screen AssetForm "Create or edit an asset record"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  heading "Asset Details"
  input "Name"
  input "Category"
  select "Status"
  input "Condition"
  input "Location"
  select "Assigned To"
  row
    right
    button "Cancel" -> AssetInventory
    button "Save" primary -> AssetInventory

screen AssetDetail "One asset's full record"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  heading "Standing Desk"
  text "Category: Furniture"
  text "Status: in-use"
  text "Condition: good"
  text "Location: 3rd Floor"
  text "Assigned To: Jane Doe"
  row
    right
    button "Edit" -> AssetForm
    button "Delete" danger -> AssetInventory

screen GuestAccounts "The employees provisioned to use the guest app"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  row
    heading "Guest Accounts"
    right
    button "Provision Guest" primary -> GuestAccountForm
  table "Name | Email | Active"
    row "Jane Doe | jane@acme.com | Yes"
    row "Sam Lee | sam@acme.com | Yes"

screen GuestAccountForm "Provision a new guest account"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  heading "Provision Guest Account"
  input "Name"
  input "Email"
  toggle "Active" active
  row
    right
    button "Cancel" -> GuestAccounts
    button "Save" primary -> GuestAccounts

screen RequestQueue "Every guest request awaiting action"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  heading "Requests"
  table "Requested By | Type | Description | Status" -> RequestReview
    row "Jane Doe | new-equipment | Need a second monitor | open"
    row "Sam Lee | issue | Laptop battery not charging | open"
    row "Jane Doe | issue | Chair armrest broken | resolved"

screen RequestReview "Approve, reject or resolve one request"
  navbar "Office Admin"
  sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"
  heading "Request from Jane Doe"
  text "Type: new-equipment"
  text "Description: Need a second monitor"
  badge "open"
  row
    right
    button "Reject" danger -> RequestQueue
    button "Approve" primary -> RequestQueue

flow "Manage inventory"
  role "Admin"
  description "An Admin keeps the asset inventory current"
  AssetInventory
  AssetForm
  AssetDetail

flow "Provision guests"
  role "Admin"
  description "An Admin provisions the employees who may use the guest app"
  GuestAccounts
  GuestAccountForm

flow "Review requests"
  role "Admin"
  description "An Admin reviews and resolves guest requests"
  RequestQueue
  RequestReview
