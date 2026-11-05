# CitiZen API Documentation

## Overview

The CitiZen backend follows REST API principles.

The frontend communicates with the backend through secure HTTP requests.

Base URL:

/api

---

# Authentication APIs

## Register

POST /api/auth/register

Description:
Creates a new user account.

---

## Login

POST /api/auth/login

Description:
Authenticates a user and returns a JWT token.

---

## Get Current User

GET /api/auth/me

Description:
Returns information about the currently logged-in user.

---

# Report APIs

## Create Report

POST /api/reports

Description:
Creates a new civic issue report.

---

## Get All Reports

GET /api/reports

Description:
Returns all reports.

---

## Get Single Report

GET /api/reports/:id

Description:
Returns details of one report.

---

## Update Report

PUT /api/reports/:id

Description:
Updates report information.

---

## Delete Report

DELETE /api/reports/:id

Description:
Deletes a report.

---

# Category APIs

## Get Categories

GET /api/categories

Description:
Returns all issue categories.

---

# Comment APIs

## Add Comment

POST /api/comments

Description:
Adds a comment to a report.

---

## Get Comments

GET /api/comments/:reportId

Description:
Returns all comments for a report.

---

# Notification APIs

## Get Notifications

GET /api/notifications

Description:
Returns notifications for the logged-in user.

---

## Mark Notification as Read

PUT /api/notifications/:id/read

Description:
Marks a notification as read.

---

# Appreciation APIs

## Send Appreciation

POST /api/appreciations

Description:
Allows a citizen to appreciate a worker.

---

## Get Worker Appreciations

GET /api/appreciations/:workerId

Description:
Returns appreciation messages for a worker.

---

# AI APIs

## Analyze Image

POST /api/ai/analyze

Description:
Uses AI to identify the issue category, generate a description, and estimate severity.

---

## Generate Priority Score

POST /api/ai/priority

Description:
Calculates the priority score for a reported issue.

---

# Analytics APIs

## Heatmap

GET /api/analytics/heatmap

Description:
Returns locality heatmap data.

---

## Dashboard Statistics

GET /api/analytics/dashboard

Description:
Returns statistics for the admin dashboard.

---

# Future APIs

- Community Verification
- Duplicate Detection
- Worker Assignment
- AI Prediction
- Citizen Impact Score
- Leaderboards

---

# Current Admin and Assignment APIs

All endpoints in this section require a valid JWT and administrator role unless noted otherwise.

## List users

GET /api/admin/users?page=1&limit=20&search=&role=all&status=all

Returns a paginated user list. `role` accepts `citizen`, `authority`, `admin`, or `all`. `status` accepts `active`, `suspended`, `removed`, or `all`.

## Update account status

PATCH /api/admin/users/:id/status

Body: `{ "isActive": false }` suspends an account; `true` reactivates a suspended account. Removed accounts must use the restore endpoint. Administrator accounts cannot be suspended here.

## Check account impact

GET /api/admin/users/:id/impact

Returns the submitted report count and active assigned report count for confirmation before removal.

## Remove account

DELETE /api/admin/users/:id

Soft-removes and anonymizes a citizen or authority account while preserving report and activity records. For an authority with active reports, the request must include exactly one of `reassignAuthorityId` (an active approved authority) or `leaveUnassigned: true`. Unassigned reports are returned to `Reported` and administrators are notified. Removed accounts require a password reset after restoration.

## Restore account

POST /api/admin/users/:id/restore

Restores the original name and email if the address is still available, reactivates the account, and requires a password reset before sign-in.

## Admin audit history

GET /api/admin/audit-logs?page=1&limit=25

Returns recent account, role, and report assignment actions.

## Admin report list and assignment

GET /api/admin/reports?page=1&limit=10&unassigned=true&status=Reported&search=

Returns reports, aggregate counts, assignment history, and pagination.

PATCH /api/reports/:id/assign

Body: `{ "authorityId": "..." }`. Only administrators may assign or reassign a report, and the target must be an active, approved authority.

## Authority queue

GET /api/authority/reports?page=1&limit=10&status=Assigned&category=Road%20Damage&priority=High&search=

Requires an active, approved authority JWT. The server scopes reports and summary counts to the authenticated authority; the client cannot select another authority's ID.