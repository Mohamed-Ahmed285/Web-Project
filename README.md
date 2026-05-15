# Book Tracker

A full-stack book tracker application with admin and user functionality.

## Project Overview

This repository contains:

- `backend/` — Express + MongoDB API server with authentication, book management, collections, activity tracking, and Swagger docs.
- `frontend/` — React + Vite application for users and admins.

## Requirements

- Node.js 18+ (or compatible)
- npm 10+ (or compatible package manager)
- MongoDB instance or Atlas cluster

## Backend Setup

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `backend/` with the following values:

```env
MONGO_URI=your_mongoDB_URI
JWT_SECRET=your_jwt_secret_here
PORT=your_port
```

4. Start the backend server:

```bash
npm run dev
```

5. The backend runs by default on:

```text
http://localhost:PORT
```

### Backend Scripts

- `npm start` — run the Express server
- `npm run dev` — run the server with `nodemon`
- `npm run format` — format code with Prettier

## Frontend Setup

1. Open a terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend dev server:

```bash
npm run dev
```

4. The frontend runs by default on:

```text
http://localhost:3000
```

> The frontend expects the backend to be available at `http://localhost:5000`, including the API and Swagger docs.

### Frontend Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build

## API Documentation

The backend includes Swagger/OpenAPI documentation.

- Open the docs at:

```text
http://localhost:5000/api-docs
```

### Key API endpoints

#### Auth

- `POST /api/auth/register` — register a new user and return a JWT token
- `POST /api/auth/login` — authenticate a user and return a JWT token

#### Books

- `GET /api/books` — get all books (requires auth)
- `GET /api/books/search?search=<query>&page=<n>&limit=<n>` — search books by title or author with pagination
- `GET /api/books/popular?limit=<n>` — get popular books ordered by total reads
- `GET /api/books/:id` — get a specific book by ID
- `POST /api/books` — create a new book (admin only)
- `DELETE /api/books/:id` — delete a book by ID (admin only)

#### User profile

- `GET /api/user/me` — get the authenticated user profile
- `PUT /api/user/me` — update profile fields and upload a new profile image

#### Collections

- `GET /api/collections` — get collections for the authenticated user
- `POST /api/collections` — create a new collection
- `POST /api/collections/book/:bookId` — create a new collection and add a book to it
- `GET /api/collections/:id` — get collections for a specific book
- `POST /api/collections/addBook/:id` — add a book to an existing collection
- `DELETE /api/collections/:id` — delete a collection
- `DELETE /api/collections/removeBook/:id` — remove a book from a collection

#### User books and reviews

- `GET /api/user-books/status/:book_id` — get current reading status for a book
- `POST /api/user-books/status` — update reading status for a book
- `GET /api/user-books/reviews/:bookId` — get reviews for a book
- `POST /api/user-books/review/:bookId` — add a review for a book
- `GET /api/user-books/rate/:bookId` — get average rating for a book

#### Activities and dashboard

- `GET /api/activities/recent` — get recent activity feed for the authenticated user
- `GET /api/dashboard/stats` — get dashboard statistics for the authenticated user

## Running the App

1. Start backend:

```bash
cd backend
npm run dev
```

2. Start frontend:

```bash
cd frontend
npm run dev
```

3. Register a new user or login with existing credentials.
4. Admin users can manage books from the admin catalog and users can browse collections.

## Search Behavior

- The admin catalog search uses `GET /api/books/search`.
- Search matches book title and author using case-insensitive regex.
- Query parameters supported:
  - `search` — text search string
  - `page` — page number
  - `limit` — results per page

## Developer Notes

- Backend uses `mongoose` for MongoDB models and `jsonwebtoken` for auth tokens.
- User registration automatically creates a `register` activity record.
- Collections and activity endpoints are protected by JWT middleware.
- The frontend stores the JWT in `localStorage` and sends it in the `Authorization` header.

