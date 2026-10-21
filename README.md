# Store Rating Platform

A full-stack app for rating stores. It uses Express and PostgreSQL on the backend and React, Vite, and plain CSS on the frontend.

## Requirements

- Node.js 18 or later and npm
- PostgreSQL 13 or later

## Setup

### 1. Create the database

In PostgreSQL, create a database named `store_rating`:

```sql
CREATE DATABASE store_rating;
```

### 2. Configure and start the backend

From the project root, copy `backend/.env.example` to `backend/.env` and edit the database connection and JWT secret. For example:

```env
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/store_rating
JWT_SECRET=use_a_long_random_secret_here
FRONTEND_URL=http://localhost:5173
```

In PowerShell, create the local environment file with:

```powershell
Copy-Item backend\.env.example backend\.env
```

Run the schema once to create the tables and indexes:

```powershell
psql -U postgres -d store_rating -f backend\schema.sql
```

Install dependencies and seed the default administrator:

```powershell
cd backend
npm install
npm run seed
```

Start the API in a second terminal:

```powershell
cd backend
npm run dev
```

The API is available at `http://localhost:5000`. The health check is `GET /api/health`.

### 3. Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. To use a different API URL, set `VITE_API_URL` in `frontend/.env` (for example, `VITE_API_URL=http://localhost:5000/api`).

### Default administrator

- Email: `admin@example.com`
- Password: `Admin@1234`

Change this password after the first login. `npm run seed` does not overwrite an existing account with this email.

## Validation rules

The frontend checks fields before submitting, and the backend repeats validation with `express-validator`. Names are 20–60 characters, addresses are at most 400 characters, emails must be valid, passwords are 8–16 characters with an uppercase letter and a special character, and ratings must be whole numbers from 1 to 5.

## API endpoints

All endpoints use the `/api` prefix. Protected endpoints require `Authorization: Bearer <token>`. Error responses use JSON with an `error` message; validation errors also include a `details` array.

| Method | Path | Role allowed | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Anyone | Check that the API is running. |
| POST | `/api/auth/signup` | Anyone | Create a normal user account and sign in. |
| POST | `/api/auth/login` | Anyone | Sign in any role and receive a JWT. |
| PUT | `/api/users/password` | Any signed-in role | Change password using the current password and a valid new password. |
| GET | `/api/admin/stats` | Admin | Get total users, stores, and ratings. |
| POST | `/api/admin/users` | Admin | Create an admin, normal user, or owner account. |
| GET | `/api/admin/users` | Admin | List users. Supports `name`, `email`, `address`, `role`, `sortBy`, and `order` query parameters. |
| GET | `/api/admin/users/:id` | Admin | Get user details and the average rating for the user's owned stores. |
| POST | `/api/admin/stores` | Admin | Create a store and assign an existing owner. |
| GET | `/api/admin/stores` | Admin | List stores and average ratings. Supports `name`, `email`, `address`, `sortBy`, and `order`. |
| GET | `/api/stores` | Normal user | List and search stores, overall averages, and the current user's rating. Supports `name`, `address`, `sortBy`, and `order`. |
| POST | `/api/stores/ratings` | Normal user | Submit or update a rating. Body: `{ "storeId": 1, "rating": 5 }`. |
| GET | `/api/stores/owner/dashboard` | Store owner | List owned stores, average ratings, and users who rated them. Supports `sortBy=name`, `email`, or `rating`, plus `order`. |

`sortBy` is checked against a server-side list of allowed columns, and `order` is limited to ascending or descending. Filter values are passed to PostgreSQL as parameters.