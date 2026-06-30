# Click Clothing

A full-stack e-commerce clothing store application with separate frontend, backend, and database components.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Chart.js
- Google OAuth

### Backend
- Node.js
- Express
- Sequelize ORM
- MySQL
- JWT Authentication
- Cloudinary (image uploads)
- Nodemailer (email notifications)

## Project Structure

```
Click_clothing-Testing/
├── BackEnd/                 # Node.js/Express API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   ├── migrations/        # Database migrations
│   ├── .env.example       # Environment variables template
│   └── index.js           # Entry point
├── Frontend/              # React application
│   ├── src/
│   │   ├── Components/    # Reusable components
│   │   ├── Pages/         # Page components
│   │   └── services/      # API service layer
│   ├── public/            # Static assets
│   ├── .env.example       # Environment variables template
│   └── vite.config.js     # Vite configuration
└── DEPLOYMENT.md          # Detailed deployment guide
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Click_clothing-Testing
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE click_clothing;
```

### 3. Backend Setup

```bash
cd BackEnd
npm install
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=click_clothing
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Run migrations:

```bash
npx sequelize-cli db:migrate
```

Start the backend server:

```bash
npm start
```

Backend will run on `http://localhost:3000`

### 4. Frontend Setup

```bash
cd Frontend
npm install
cp .env.example .env
```

Edit `.env` (optional for development with proxy):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

The Vite proxy will forward API requests to the backend automatically.

## Available Scripts

### Backend

```bash
cd BackEnd
npm start          # Start production server
node index.js      # Alternative start command
```

### Frontend

```bash
cd Frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Environment Variables

### Backend (.env)

Required:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 3306)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASS` - Database password
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins
- `FRONTEND_URL` - Frontend URL

Optional:
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_HOST` - Email server host
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password

See `BackEnd/.env.example` for all available options.

### Frontend (.env)

Required:
- `VITE_API_BASE_URL` - Backend API URL

Optional:
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

See `Frontend/.env.example` for details.

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/google-login` - Google OAuth login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

And many more... See `BackEnd/routes/` for complete API documentation.

## Development

### Running Migrations

```bash
cd BackEnd
npx sequelize-cli db:migrate
```

### Undo Last Migration

```bash
npx sequelize-cli db:migrate:undo
```

### Creating a New Migration

```bash
npx sequelize-cli migration:generate --name migration_name
```

### Creating a New Model

```bash
npx sequelize-cli model:generate --name ModelName --attributes attribute1:string,attribute2:integer
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deployment Summary

1. **Database**: Deploy MySQL to a cloud provider (AWS RDS, PlanetScale, etc.)
2. **Backend**: Deploy to Railway, Render, or Vercel
   - Set environment variables in platform dashboard
   - Ensure `NODE_ENV=production`
3. **Frontend**: Deploy to Vercel, Netlify, or AWS S3
   - Set `VITE_API_BASE_URL` to deployed backend URL
   - Build and deploy the production bundle

## Troubleshooting

### Database Connection Failed

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists
- Check firewall settings

### CORS Errors

- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- For development, use `http://localhost:5173`
- For production, use your actual domain

### API Not Responding

- Check backend is running on correct port
- Verify `VITE_API_BASE_URL` in frontend `.env`
- Check browser console for errors
- Review backend logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.
