# InterviewAI API Reference

Base URL: `https://api.interviewai.app`

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

## User
- `GET /api/user/profile`

## Resume
- `POST /api/resume/upload`
- `GET /api/resume/skills`

## Interview
- `POST /api/interview/start`
- `POST /api/interview/submit`
- `GET /api/interview/history`

## Analytics
- `GET /api/analytics`

## Reports
- `POST /api/reports/generate`

## Admin
- `GET /api/admin/users`
- `GET /api/admin/analytics`
- `GET /api/admin/questions`
- `POST /api/admin/questions`
- `PUT /api/admin/questions/:id`
- `DELETE /api/admin/questions/:id`
