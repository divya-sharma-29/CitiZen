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