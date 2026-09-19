screen MyAssets "The equipment currently assigned to me"
  navbar "Office"
  sidebar "My Assets -> MyAssets | My Requests -> MyRequests"
  heading "My Assets"
  table "Name | Category | Status | Condition"
    row "Standing Desk | Furniture | in-use | good"
    row "Laptop - Dell XPS | Electronics | in-use | good"

screen MyRequests "The requests I've raised and their status"
  navbar "Office"
  sidebar "My Assets -> MyAssets | My Requests -> MyRequests"
  row
    heading "My Requests"
    right
    button "New Request" primary -> RequestForm
  table "Type | Description | Status" -> RequestDetail
    row "new-equipment | Need a second monitor | open"
    row "issue | Chair armrest broken | resolved"

screen RequestForm "Raise a new request"
  navbar "Office"
  sidebar "My Assets -> MyAssets | My Requests -> MyRequests"
  heading "New Request"
  select "Type"
  select "Related Asset (optional)"
  textarea "Description"
  row
    right
    button "Cancel" -> MyRequests
    button "Submit" primary -> MyRequests

screen RequestDetail "One of my requests, and its current status"
  navbar "Office"
  sidebar "My Assets -> MyAssets | My Requests -> MyRequests"
  heading "Request Details"
  text "Type: new-equipment"
  text "Description: Need a second monitor"
  badge "open"

flow "My assets"
  role "Guest"
  description "A Guest checks the equipment assigned to them"
  MyAssets

flow "Raise and track a request"
  role "Guest"
  description "A Guest submits a request and follows its status"
  MyRequests
  RequestForm
  RequestDetail
