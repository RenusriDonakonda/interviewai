# InterviewAI Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas connection string

## Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

Environment variables (`frontend/.env`):
- `REACT_APP_API_URL=https://api.interviewai.app`
- `REACT_APP_AI_ENDPOINT=https://ai.interviewai.app`
- `REACT_APP_VERSION=1.0.0`

## Backend
1. `cd backend`
2. `npm install`
3. `npm start`

Environment variables (`backend/.env`):
- `MONGODB_URI=...`
- `JWT_SECRET=interviewai-secret-key`
- `PORT=5000`
- `NODE_ENV=production`
- `AI_MODEL_VERSION=2.0`

## Seed Data
`node src/seed/seed.js`
