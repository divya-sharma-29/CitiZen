# Architecture Diagram

CitiZen is a civic issue reporting platform with a React web client and a Node.js API. These diagrams summarize the implemented page groups, request paths, access controls, data stores, and external services.

## Application Architecture

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart TD
    subgraph Client["Web Client - React and TypeScript"]
        Browser["Web browser"]
        Router["React app and router"]
        PublicPages["Public and account pages"]
        CitizenPages["Citizen workspace"]
        StaffPages["Authority and admin dashboards"]
        ApiClient["API URL helper and fetch"]
        MapUI["Leaflet map and location UI"]
    end
    subgraph Server["API Server - Node.js and Express"]
        Express["REST API and static uploads"]
        Auth["JWT authentication and role guards"]
        ReportAPI["Reports and civic workflows"]
        AdminAPI["Authority and admin operations"]
        Rules["Priority and duplicate matching"]
        Media["Multer disk uploads"]
    end
    subgraph Persistence["Persistence - MongoDB"]
        Mongo[("MongoDB")]
        FileStore[("Local uploads directory")]
    end
    subgraph External["External Services"]
        OSM["OpenStreetMap map tiles"]
        Nominatim["Nominatim reverse geocoding"]
        SMTP["Configured SMTP email"]
    end

    Browser -->|"loads"| Router
    Router -->|"routes public and account views"| PublicPages
    Router -->|"routes signed-in views"| CitizenPages
    Router -->|"role-gated views"| StaffPages
    CitizenPages -->|"map and location interaction"| MapUI
    PublicPages -->|"API requests"| ApiClient
    CitizenPages -->|"API requests"| ApiClient
    StaffPages -->|"API requests"| ApiClient
    ApiClient -->|"HTTP JSON and multipart requests"| Express
    Express -->|"validates protected requests"| Auth
    Express -->|"handles reports and citizen actions"| ReportAPI
    Express -->|"handles staff operations"| AdminAPI
    ReportAPI -->|"scores and matches reports"| Rules
    ReportAPI -->|"reads and writes documents"| Mongo
    AdminAPI -->|"reads and writes documents"| Mongo
    ReportAPI -->|"stores and serves report images"| Media
    Media -->|"writes image files"| FileStore
    Express -->|"sends password recovery email"| SMTP
    MapUI -->|"loads map tiles"| OSM
    MapUI -->|"looks up addresses"| Nominatim
```

### Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Web UI | React | ^19.2.8 | Client-rendered website |
| Web UI | TypeScript | ~6.0.2 | Frontend type checking |
| Routing and build | React Router, Vite | ^7.18.2, ^8.2.0 | Page navigation and frontend build |
| Styling and maps | Tailwind CSS, Leaflet | ^4.3.3, ^1.9.4 | Styling and interactive maps |
| API | Node.js, Express | Runtime not pinned, ^5.2.1 | REST API and static upload serving |
| Persistence | MongoDB, Mongoose | MongoDB server version not pinned, ^9.9.1 | Document storage and models |
| Authentication | JSON Web Token, bcryptjs | ^9.0.3, ^3.0.3 | Signed sessions and password hashing |
| File handling | Multer | ^2.2.0 | Local image upload handling |
| Email | Nodemailer | ^10.0.10 | Password recovery email via configured SMTP |
| Map services | OpenStreetMap, Nominatim | External services | Map tiles and reverse geocoding |

### Data Storage & External Services

The backend persists users, reports, comments, notifications, report activity, authority ratings, and audit logs in MongoDB through Mongoose. Multer stores uploaded images in the backend's local `uploads` directory, which Express serves as static content; report documents hold image URLs. The browser requests map tiles from OpenStreetMap and reverse-geocodes selected coordinates through Nominatim. The backend uses configured SMTP through Nodemailer for password recovery. No external AI provider is wired into the inspected report flow; priority scoring and similar-report matching are application logic.

### Key Architectural Decisions

- The API is implemented as a single Express server entry point, with Mongoose models and middleware in separate files.
- JWT authentication reloads the current user from MongoDB; authority and admin access is role-gated.
- Report prioritization and duplicate/similarity matching are handled within the application, not by an external AI service.

## Component Relationships

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart LR
    subgraph cPresentation["Presentation"]
        cPublic["Landing, features, about"]
        cAccount["Login, registration, recovery"]
        cCitizen["Dashboard, reports, map, profile"]
        cStaff["Authority and admin dashboards"]
    end
    subgraph cClient["Client Routing and Data"]
        cRouter["React Router"]
        cGuard["ProtectedRoute"]
        cHttp["API URL helper and fetch"]
        cMap["Leaflet and location UI"]
    end
    subgraph cApi["API Access"]
        cExpress["Express server.js"]
        cJwt["JWT authentication"]
        cRoles["Authority and admin guards"]
    end
    subgraph cWorkflows["Civic Workflows"]
        cReports["Report create, search, and update"]
        cAdminOps["Assignment, status, analytics"]
        cCommunity["Comments, ratings, activity, notices"]
        cPriority["Priority and duplicate matching"]
    end
    subgraph cData["Data and Integrations"]
        cModels["Mongoose models"]
        cMongo[("MongoDB")]
        cMedia["Multer and static uploads"]
        cDisk[("Local uploads directory")]
        cEmail["Nodemailer SMTP"]
        cMapServices["OpenStreetMap and Nominatim"]
    end

    cRouter -->|"renders public pages"| cPublic
    cRouter -->|"renders account pages"| cAccount
    cRouter -->|"renders authenticated pages"| cCitizen
    cRouter -->|"renders role-gated pages"| cStaff
    cRouter -->|"protects private routes with"| cGuard
    cPublic -->|"requests public data"| cHttp
    cAccount -->|"submits account actions"| cHttp
    cCitizen -->|"loads and changes civic data"| cHttp
    cStaff -->|"loads and manages civic data"| cHttp
    cCitizen -->|"uses"| cMap
    cMap -->|"requests external map data"| cMapServices
    cGuard -->|"checks the current session"| cHttp
    cHttp -->|"sends HTTP requests"| cExpress
    cExpress -->|"verifies tokens with"| cJwt
    cJwt -->|"applies role checks through"| cRoles
    cExpress -->|"dispatches report actions"| cReports
    cExpress -->|"dispatches staff actions"| cAdminOps
    cExpress -->|"dispatches community actions"| cCommunity
    cReports -->|"calculates score and similarity"| cPriority
    cReports -->|"persists report data through"| cModels
    cAdminOps -->|"persists operational data through"| cModels
    cCommunity -->|"persists user activity through"| cModels
    cModels -->|"reads and writes"| cMongo
    cReports -->|"uploads and serves images through"| cMedia
    cMedia -->|"stores files in"| cDisk
    cExpress -->|"sends recovery messages through"| cEmail
```

### Component Inventory

| Component | Layer | Type | Responsibility |
|---|---|---|---|
| Landing, features, about | Presentation | React pages | Public product and informational pages |
| Login, registration, recovery | Presentation | React pages | Account creation, login, and password recovery |
| Dashboard, reports, map, profile | Presentation | React pages | Citizen reporting, tracking, discovery, and account view |
| Authority and admin dashboards | Presentation | React pages | Staff report queues, administration, and oversight |
| React Router | Client routing | Router | Maps URL paths to page components |
| ProtectedRoute | Client access | Route guard | Checks session and optional role before rendering private pages |
| API URL helper and fetch | Client data | URL helper and browser API | Builds API URLs; page components issue HTTP requests with fetch |
| Leaflet and location UI | Client integration | Map components | Displays map tiles and supports location selection |
| Express server.js | API | HTTP server | Hosts REST endpoints and serves uploaded images |
| JWT authentication | API access | Middleware | Verifies bearer token and loads the current active user |
| Authority and admin guards | API access | Middleware | Limits privileged API operations by role |
| Report workflows | Business logic | API handlers | Creates, lists, updates, and evaluates civic reports |
| Staff operations | Business logic | API handlers | Assignment, status transitions, and administration |
| Community workflows | Business logic | API handlers | Comments, ratings, activity history, and notifications |
| Priority and duplicate matching | Business logic | Application logic | Calculates priority and finds nearby similar reports |
| Mongoose models | Data access | ODM models | Defines persisted entities and document relationships |
| MongoDB | Data storage | Document database | Stores platform records |
| Multer and static uploads | File handling | Upload middleware | Writes and serves report image files |
| Nodemailer SMTP | External integration | Email transport | Sends password recovery messages |
| OpenStreetMap and Nominatim | External integration | Map services | Supplies map tiles and reverse-geocoded addresses |
