# CitiZen — AI-Powered Civic Intelligence Platform

**See It. Report It. Fix It.**

CitiZen is a civic issue reporting and management platform designed to connect citizens with authorities and make local problem resolution more transparent, organized, and efficient.

## Problem Statement

Civic issues such as damaged roads, water leakage, drainage problems, broken streetlights, and garbage accumulation can negatively affect public safety and quality of life. Traditional reporting processes may make it difficult for citizens to track complaints and understand the progress of their resolution.

CitiZen aims to simplify civic issue reporting and improve visibility into the resolution process.

## Key Features

- **Civic Issue Reporting:** Submit reports about local infrastructure and sanitation issues.
- **Location-Based Reporting:** Associate reports with geographic coordinates.
- **Issue Prioritization:** Calculate priority scores based on issue category and severity.
- **Duplicate Issue Detection:** Identify potentially duplicate reports in nearby locations.
- **Status Tracking:** Track reports through their resolution lifecycle.
- **User Authentication:** Register and log in to access user-specific features.
- **Comments and Notifications:** Support communication and updates about reported issues.
- **Report Activity History:** Maintain a history of changes to report status.
- **Authority and Admin Access:** Support role-based access for managing civic reports.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| File Uploads | Multer |
| Icons | Lucide React |

## How It Works

1. A citizen registers or logs in.
2. The citizen submits a civic issue with relevant details and location.
3. The system calculates a priority score and checks for nearby potential duplicates.
4. The report is stored and made available for tracking and management.
5. Authorities can manage report statuses, while users can follow updates.

## Project Structure

```text
CitiZen/
├── client/
│   ├── backend/
│   └── src/
├── docs/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB connection or MongoDB Atlas account
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/divya-sharma-29/CitiZen.git
cd CitiZen
```

Install dependencies in the relevant frontend and backend directories:

```bash
cd client/backend
npm install
```

Then, in a separate terminal:

```bash
cd client
npm install
```

### Environment Configuration

Create a `.env` file in `client/backend` and configure the required environment variables using your own credentials.

Typical variables include:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_APP_PASSWORD=your_email_app_password
FRONTEND_URL=http://localhost:5173
```

Never commit real passwords, API keys, database credentials, or other secrets to GitHub.

### Run the Application

Start the backend from `client/backend` using the start script defined in its `package.json`:

```bash
npm start
```

Start the frontend from `client` using the development script defined in its `package.json`:

```bash
npm run dev
```

The frontend development server is expected to run at `http://localhost:5173` if configured with the default Vite port.

## Future Enhancements

- AI-assisted civic issue classification and verification
- Improved duplicate detection and report clustering
- Analytics dashboards for civic authorities
- More transparent resolution tracking
- Enhanced citizen-authority communication

## Project Status

CitiZen is under active development. Features and setup instructions may evolve as the project progresses.

## Author

Developed as a civic technology project focused on improving local issue reporting and accountability.
