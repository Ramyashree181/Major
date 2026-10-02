# EmpowerLoan

Loan eligibility and application demo with a React/Vite frontend, Express/MongoDB API, and separate Flask ML and NLP services.

## Run locally

1. Install Node.js 20+ and Python 3.13, and start MongoDB (local or Atlas).
2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a private `JWT_SECRET`.
3. Install the backend dependencies with `cd backend && npm install`.
4. Install Python dependencies with `python -m pip install -r ml/requirements.txt` and `python -m pip install -r nlp/requirements.txt`.
5. Install frontend dependencies with `cd frontend && npm install`.
6. Start the API (`cd backend && npm run dev`), ML service (`cd ml && python app.py`), NLP service (`cd nlp && python app.py`), and frontend (`cd frontend && npm run dev`) in separate terminals.
7. Open http://localhost:5173.

The local environment examples are `backend/.env.example` and `frontend/.env.example`. Never commit `.env` files or put server secrets in `frontend/.env`.

## Deploy on Render

This project has four deployable processes. Deploy each as a separate Render service, then connect them with the environment variables below. Keep the Python services on the same Python major/minor version used to create the checked-in scikit-learn model; `scikit-learn` is pinned in both requirements files for pickle compatibility.

### 1. Prepare GitHub safely

1. Rotate any MongoDB password that has been shared or exposed, and create a strong new JWT secret.
2. Confirm the actual `backend/.env` is ignored (`git check-ignore backend/.env`) and is not tracked (`git ls-files backend/.env` should print nothing). Commit only the `.env.example` templates, never real environment files.
3. Uploaded documents were previously tracked under `backend/uploads`. They are now excluded from future Git additions and removed from the current index, but their bytes may still exist in older commits. **Do not push the existing history until it is cleaned.** Back up any local files you need, then create a clean snapshot/history that excludes `backend/uploads`, or rewrite history to remove that path. If this repository history has already been pushed, remove the sensitive files from GitHub history and treat those documents as exposed.
4. Do not run `npm run seed` against a database with data you need: the seed script deletes users, bank customers, credit profiles, loan types, and loan schemes before inserting its fixed demo records. Do not use the seed demo passwords for a public production deployment.
5. From the repository root, review `git status`, then add, commit, and push the cleaned project to a private GitHub repository if it contains personal or sensitive material. Do not commit uploaded documents, credentials, Atlas connection strings, or API tokens. If a secret was committed previously, remove it from Git history and rotate it; deleting the file in a later commit is not sufficient.

### 2. Prepare MongoDB Atlas

1. Create a production database and a least-privilege database user in Atlas.
2. Add the database name to the Atlas URI path, for example `/major_loan_app` before its query string.
3. Permit network access from the Render backend. Prefer Render's outbound IP allow-list if your plan provides it; otherwise follow Atlas's current Render connectivity instructions. Avoid broad network access for sensitive production data.
4. Keep the complete URI only in the backend Render environment as `MONGODB_URI`.

### 3. Deploy the Python model services

In Render, create two **Web Services** from the same GitHub repository:

| Setting | Eligibility ML | Chatbot NLP |
| --- | --- | --- |
| Root Directory | `ml` | `nlp` |
| Runtime | Python 3.13 | Python 3.13 |
| Build Command | `pip install -r requirements.txt` | `pip install -r requirements.txt` |
| Start Command | `gunicorn --bind 0.0.0.0:$PORT app:app` | `gunicorn --bind 0.0.0.0:$PORT app:app` |
| Health Check Path | `/health` | `/` |

Wait for both services to deploy, and copy their public HTTPS base URLs from Render (no `/predict` suffix). The checked-in model files must remain in each service's `models/` directory.

### 4. Deploy the backend API

Create another Render **Web Service**:

- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/health`

Set these backend environment variables in Render (never in GitHub):

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Your rotated Atlas URI with the intended database name |
| `JWT_SECRET` | A new, long, random secret; do not reuse the example value |
| `JWT_EXPIRE` | `7d` or your preferred token lifetime |
| `FRONTEND_ORIGINS` | The exact deployed frontend origin, e.g. `https://your-site.onrender.com` |
| `ML_SERVICE_URL` | The ML service HTTPS base URL copied above |
| `NLP_SERVICE_URL` | The NLP service HTTPS base URL copied above |
| `UPLOAD_DIR` | `/var/data/uploads` when using a mounted persistent disk |

Document uploads currently go to local disk. For a demo on Render, attach a persistent disk to the backend, mount it at `/var/data`, and set `UPLOAD_DIR=/var/data/uploads`. This is a paid feature and ties files to that service/instance. For a real service handling identity documents, prefer private object storage with access controls, encryption, retention limits, and backups instead of ephemeral local storage.

### 5. Deploy the frontend

Create a Render **Static Site**:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL` = the backend's deployed HTTPS base URL (no trailing slash)

Add a Render rewrite rule so client-side routes work on refresh: source `/*`, destination `/index.html`, action **Rewrite**. Use the frontend's exact HTTPS origin for the backend's `FRONTEND_ORIGINS`, then redeploy the backend if you set that value afterward. `VITE_API_URL` is embedded at build time, so redeploy the frontend if it changes.

### 6. Populate and smoke-test

Only on a fresh, intended database, run `npm run seed` from the backend service context (or run it locally using the production URI temporarily stored outside the repository). This script is destructive to the listed collections and inserts demo users with fixed passwords; for production, replace it with a reviewed, non-destructive catalog migration and real account onboarding. Test signup/login, the loan catalog, a test eligibility request, chatbot replies, and document upload. Remove test records and use a persistent/private file store before accepting real documents.

## Deployment limitations to address before production

- The application currently keeps JWTs in browser local storage and the API accepts bearer tokens; use HTTPS and review the authentication design before handling real financial data.
- ML/NLP endpoints do not require authentication. Restrict them to backend-to-service traffic where your hosting/network plan permits it, or add service authentication before public use.
- Tesseract OCR supports image OCR in the current backend; the controller explicitly rejects PDF OCR. Do not advertise PDF OCR until implemented and tested.
- `npm run lint` may report existing React/style issues even when `npm run build` succeeds; check it separately before a production release.