# DonorX

DonorX connects blood donors and people seeking blood in Chhatrapati Sambhajinagar. User accounts, donor profiles, emergency requests, and donor responses are stored in MongoDB through the Express API.

## Requirements

- Node.js 20.19+ (or 22.12+)
- MongoDB running locally

## Run locally

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set a unique `JWT_SECRET` of at least 32 characters in `backend/.env`. The optional `ADMIN_EMAIL` and `ADMIN_PASSWORD` settings create an administrator when the seeder runs; use a unique password of at least 16 characters. Then run:

```powershell
npm run seed
npm start
```

The API listens on http://localhost:5000. The seeder preserves real accounts, does not create sample donors, and disables any older built-in sample donor profiles.

### Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend defaults to `http://localhost:5000/api`; set `VITE_API_URL` in `frontend/.env` to override it.

## Main flows

- Sign up or sign in as a donor or blood seeker.
- Donors can register and update their profile and availability.
- Signed-in users can search donors by blood group and area.
- Users can create and manage their own emergency blood requests.
- Donors can view open requests and submit an ETA response.

Donor contact details appear in search only when a donor opts in to sharing them. Donor addresses and medical-condition fields are not returned in search results. Donor and blood-bank verification is performed by an administrator; it is not medical clearance or donor eligibility certification.

Blood-bank listings and inventory are database-backed. New listings remain private until an administrator records a license number and verification notes and marks them verified. Inventory is labeled current for 24 hours after an administrator update; stale inventory is hidden. Community survey responses are stored in the database, and phone numbers are stored only when the respondent consents to follow-up.

Requesters can share their contact details and hospital address with the donor who accepts their request. In-app notifications are stored persistently. Optional email notifications require SMTP configuration and the user's opt-in. SMS and push notifications are not currently supported.

## Operations

- Check `http://localhost:5000/health` for API and MongoDB readiness.
- Install MongoDB Database Tools (`mongodump` and `mongorestore`) to create and restore backups.
- Set `$env:MONGO_URI` in PowerShell, then run `.\backend\scripts\backup.ps1`. Backups are written to `backend/backups/` and are excluded from version control.
- Restore a backup with `.\backend\scripts\restore.ps1 -BackupPath <path>`. Restore does not drop existing collections by default. To drop collections first, pass `-DropExisting`, set `$env:ALLOW_DATABASE_RESTORE_DROP = 'true'`, and type the confirmation phrase when prompted. Keep a separate backup before any restore.
- Configure SMTP values in `backend/.env` to enable optional email delivery. Keep credentials private and use TLS with an authenticated mail provider in production.

## Deploy on Render

The included `render.yaml` deploys the frontend and API as one Render web service. Create a free MongoDB Atlas database, then create a Render Blueprint from this project and provide the Atlas connection string for `MONGO_URI` when prompted. Render generates `JWT_SECRET` for the service. The deployment health check uses `/health`.

Set Atlas network access to allow connections from the Render service. For a production deployment, restrict database access to trusted sources where possible. Keep the database password and connection string private.

The free Render service uses ephemeral storage. Uploaded donor profile photos are kept in `backend/uploads/`, so they can disappear when the service restarts or redeploys. Use persistent storage or external object storage before relying on profile photo uploads in production.

## Security notes

- Never commit `.env` files or share database credentials.
- Use a unique JWT secret and administrator password.
- `npm audit` checks known advisories; a clean audit is not a guarantee of zero vulnerabilities.
- Use HTTPS, production-grade MongoDB authentication/network restrictions, monitoring, and regularly tested backups before deployment.

