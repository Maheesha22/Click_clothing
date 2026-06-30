# Deployment Guide

This guide covers how to deploy the Click Clothing application with separate frontend, backend, and database components.

## Architecture Overview

- **Frontend**: React + Vite application
- **Backend**: Node.js + Express API
- **Database**: MySQL (can be hosted separately or locally)

## Prerequisites

- Node.js (v18 or higher)
- MySQL database (local or cloud-hosted)
- Cloudinary account (for image uploads)
- Google Cloud Console project (for OAuth, optional)

## Environment Configuration

### Backend Environment Variables

Copy `BackEnd/.env.example` to `BackEnd/.env` and configure:

```bash
cd BackEnd
cp .env.example .env
```

Required variables:
- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Backend server port (default: 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`: Database connection details
- `JWT_SECRET`: Secret key for JWT token signing (use a strong random string)
- `CORS_ORIGIN`: Frontend domain(s) for CORS (comma-separated for multiple)
- `FRONTEND_URL`: Frontend domain URL

Optional but recommended:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`: For email notifications

**Note**: Bank details (bank name, account name, account number, branch) are stored in the database (`bank_details` table) and managed through the admin interface, not via environment variables.

### Frontend Environment Variables

Copy `Frontend/.env.example` to `Frontend/.env` and configure:

```bash
cd Frontend
cp .env.example .env
```

Required variables:
- `VITE_API_BASE_URL`: Backend API URL (e.g., `https://api.yourdomain.com/api`)

Optional:
- `VITE_GOOGLE_CLIENT_ID`: For Google OAuth authentication

## Deployment Options

### Option 1: Development Deployment (Local)

#### 1. Database Setup

Start your MySQL database locally or use a cloud provider like PlanetScale, AWS RDS, or DigitalOcean.

#### 2. Backend Setup

```bash
cd BackEnd
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

Backend will run on `http://localhost:3000`

#### 3. Frontend Setup

```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_BASE_URL=http://localhost:3000/api
npm run dev
```

Frontend will run on `http://localhost:5173` with API proxy to backend

### Option 2: Production Deployment (Separate Servers)

#### Database Deployment

1. **Cloud Options**:
   - AWS RDS
   - Google Cloud SQL
   - DigitalOcean Managed Database
   - PlanetScale
   - Railway

2. **Configure Backend**:
   - Update `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` in `.env`
   - Or use `DATABASE_URL` connection string

#### Backend Deployment

**Platform Options**: Vercel, Railway, Render, AWS, DigitalOcean, Heroku

Example using Railway:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd BackEnd
railway init
railway up
```

Set environment variables in the platform's dashboard:
- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `JWT_SECRET` (generate a strong random string)
- `CORS_ORIGIN=https://your-frontend-domain.com`
- `FRONTEND_URL=https://your-frontend-domain.com`
- Cloudinary credentials
- Email credentials

#### Frontend Deployment

**Platform Options**: Vercel, Netlify, AWS S3 + CloudFront, DigitalOcean App Platform

Example using Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd Frontend
vercel
```

Set environment variable in Vercel dashboard:
- `VITE_API_BASE_URL=https://your-backend-domain.com/api`

### Option 3: Docker Deployment

Create a `docker-compose.yml` file at the root:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: click_clothing
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./BackEnd
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=click_clothing
      - DB_USER=root
      - DB_PASS=rootpassword
      - JWT_SECRET=your-jwt-secret
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - db

  frontend:
    build: ./Frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/api
    depends_on:
      - backend

volumes:
  db_data:
```

Deploy with:
```bash
docker-compose up -d
```

## Database Setup

### Running Migrations

After setting up your database, run migrations:

```bash
cd BackEnd
npx sequelize-cli db:migrate
```

### Seeding Data (Optional)

```bash
npx sequelize-cli db:seed:all
```

## Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Set `DB_SYNC=false` (never sync in production)
- [ ] Use strong database passwords
- [ ] Configure CORS to only allow your frontend domain
- [ ] Set up SSL/HTTPS for both frontend and backend
- [ ] Use environment-specific Cloudinary folders
- [ ] Configure email service with app-specific passwords
- [ ] Set up database backups
- [ ] Enable database connection pooling
- [ ] Configure rate limiting on API endpoints
- [ ] Set up monitoring and logging

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check `CORS_ORIGIN` in backend `.env` matches your frontend domain
2. Ensure both domains use HTTPS in production
3. For multiple origins, separate with commas: `https://domain1.com,https://domain2.com`

### Database Connection Issues

1. Verify database credentials in `.env`
2. Check if database server is accessible from backend server
3. Ensure database user has proper permissions
4. Check firewall rules allow database port (3306)

### API Connection Issues

1. Verify `VITE_API_BASE_URL` in frontend `.env`
2. Check backend is running and accessible
3. Ensure backend CORS allows frontend origin
4. Check network/firewall settings

### Image Upload Issues

1. Verify Cloudinary credentials in backend `.env`
2. Check Cloudinary API key has proper permissions
3. Ensure Cloudinary folder exists or can be created

## Monitoring and Maintenance

### Health Checks

Add health check endpoints to your backend:
- `/health` - Basic server health
- `/api/health` - Database connection health

### Logging

- Backend logs to console (configure log aggregation in production)
- Frontend errors appear in browser console (use error tracking service like Sentry)

### Backups

- Set up automated database backups (daily recommended)
- Backup Cloudinary images or use their built-in backup
- Keep backups of environment configurations
