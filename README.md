# 🎯 Online Quiz App (MERN Stack)

A comprehensive full-stack quiz application built with the MERN stack, featuring AI-powered question generation, real-time analytics, and separate interfaces for admins and users.

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication with secure password hashing
- Role-based access control (Admin/User)
- Protected routes and middleware

### 👨‍💼 Admin Features

- **Exam Management**: Create, edit, and delete exams
- **AI-Powered Question Generation**: Generate questions automatically using Google's Gemini AI
- **Question Management**: Add, edit, and delete questions manually
- **Analytics Dashboard**: View detailed reports and analytics
- **Leaderboard**: Monitor user performance across all exams
- **User Management**: View all registered users and their activity

### 👤 User Features

- **Take Exams**: Interactive exam interface with timer functionality
- **Real-time Results**: Instant feedback after exam completion
- **Personal Dashboard**: View exam history and performance
- **Reports**: Detailed analytics of past attempts
- **Responsive Design**: Optimized for all device sizes

### 🎨 User Experience

- **Theme Toggle**: Switch between light and dark modes
- **Real-time Updates**: Live updates for all CRUD operations
- **Loading States**: Smooth loading indicators throughout the app
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 🧠 Advanced Features

- **Multiple Correct Answers**: Support for questions with multiple correct options
- **Timer Functionality**: Countdown timer for exam sessions
- **Result Storage**: Persistent storage of all exam results in MongoDB
- **Complex Queries**: Advanced MongoDB aggregation for analytics
- **Timeout Handling**: Robust timeout management for AI operations

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-0170FE?logo=antdesign&logoColor=fff&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

### Backend

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-orange?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-red?style=for-the-badge&logo=JSON+Web+Tokens&logoColor=white)

### Database & AI

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

### Deployment

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

## 📁 Project Structure

```
quiz-app/
├── 📁 frontend/                    # React application
│   ├── 📁 public/                  # Static assets
│   ├── 📁 src/
│   │   ├── 📁 apicalls/           # API service functions
│   │   ├── 📁 components/         # Reusable React components
│   │   ├── 📁 context/            # React context providers
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── 📁 admin/          # Admin-specific pages
│   │   │   │   ├── 📁 Exams/      # Exam management
│   │   │   │   ├── 📁 Reports/    # Admin reports
│   │   │   │   └── 📁 Leaderboard/ # User rankings
│   │   │   ├── 📁 common/         # Shared pages (Home, Login, Register)
│   │   │   └── 📁 user/           # User-specific pages
│   │   ├── 📁 redux/              # State management
│   │   └── 📁 stylesheets/        # Custom CSS files
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.mjs
├── 📁 backend/                     # Node.js backend
│   ├── 📁 config/                 # Configuration files
│   │   ├── dbConfig.js           # MongoDB connection
│   │   └── geminiConfig.js       # AI configuration
│   ├── 📁 controllers/           # Request handlers
│   │   ├── aiControllers.js      # AI-powered features
│   │   ├── examControllers.js    # Exam CRUD operations
│   │   ├── reportController.js   # Analytics and reports
│   │   └── userControllers.js    # User authentication
│   ├── 📁 middlewares/           # Express middlewares
│   │   └── authMiddleware.js     # JWT verification
│   ├── 📁 models/                # Mongoose schemas
│   │   ├── examModel.js
│   │   ├── questionModel.js
│   │   ├── reportModel.js
│   │   └── userModel.js
│   ├── 📁 routes/                # API routes
│   │   ├── examRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── server.js                 # Main server file
│   ├── package.json
│   └── vercel.json              # Vercel deployment config
├── Quiz-App-Postman-Collection.json  # API documentation
├── package.json                       # Root package.json
└── README.md                         # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB installation
- Google AI API key (for AI features)

### Installation

#### Step 1: Clone the repository

```bash
git clone https://github.com/Prabhat2912/Quiz-app.git
cd Quiz-app
```

#### Step 2: Install dependencies

Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### Step 3: Environment Configuration

##### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
PORT=8000
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-google-ai-api-key
NO_OF_QUESTIONS=5
CORS_ORIGIN=*
```

##### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=http://localhost:8000/api
# or for production
VITE_API_URL=https://your-backend-url.vercel.app/api
```

#### Step 4: Database Setup

1. Create a MongoDB Atlas cluster or use local MongoDB
2. Update the `MONGO_URL` in your backend `.env` file
3. The application will automatically create the required collections

#### Step 5: AI Configuration (Optional)

1. Get a Google AI API key from [Google AI Studio](https://aistudio.google.com/)
2. Add the API key to your backend `.env` file as `GEMINI_API_KEY`
3. This enables the AI-powered question generation feature

### Running the Application

#### Development Mode

```bash
# Start backend server (from backend directory)
cd backend
npm run dev

# Start frontend development server (from frontend directory)
cd frontend
npm run dev
```

#### Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

### Deployment

#### Backend Deployment (Vercel)

```bash
cd backend
vercel --prod
```

#### Frontend Deployment (Vercel)

```bash
cd frontend
vercel --prod
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/getUserInfo` - Get user profile

### Exam Management Endpoints

- `GET /api/exams/getAllExams` - Get all exams
- `POST /api/exams/addExam` - Create new exam (Admin only)
- `POST /api/exams/createExam` - Create exam with AI (Admin only)
- `GET /api/exams/getExamById/:id` - Get exam details
- `PUT /api/exams/editExam/:id` - Update exam (Admin only)
- `DELETE /api/exams/deleteExam/:id` - Delete exam (Admin only)

### Question Management Endpoints

- `POST /api/exams/addQuestionToExam/:id` - Add question to exam
- `PUT /api/exams/editQuestionInExam/:id` - Edit question
- `DELETE /api/exams/deleteQuestionFromExam/:id` - Delete question

### Reports & Analytics Endpoints

- `POST /api/reports/addReport` - Submit exam results
- `GET /api/reports/getAllAttemptsByUser` - Get user's exam history
- `GET /api/reports/getAllReports` - Get all reports (Admin only)
- `POST /api/reports/getAllAttempts` - Get filtered attempts (Admin only)

## 🎯 Key Features Explained

### AI-Powered Question Generation

The app uses Google's Gemini AI to automatically generate exam questions based on the selected category. The AI creates:

- Multiple choice questions
- True/false questions
- Questions with multiple correct answers
- Properly formatted options and explanations

### Real-time Analytics

- User performance tracking
- Exam completion rates
- Time-based analytics
- Success rate calculations
- Leaderboard rankings

### Robust Error Handling

- Comprehensive timeout management
- Graceful error recovery
- User-friendly error messages
- Loading states and progress indicators

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Rate limiting for API endpoints

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: User preference-based theme switching
- **Intuitive Navigation**: Clear and logical user interface
- **Real-time Feedback**: Instant updates and notifications
- **Loading States**: Smooth transitions and loading indicators

## 📊 Database Schema

### User Model

- Authentication details
- Role-based permissions
- Profile information

### Exam Model

- Exam metadata
- Question references
- Timing and scoring configuration

### Question Model

- Question content
- Multiple choice options
- Correct answer references
- Category classification

### Report Model

- User exam attempts
- Performance metrics
- Timestamp tracking
- Result calculations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Prabhat Kumar**

- GitHub: [@Prabhat2912](https://github.com/Prabhat2912)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- Google AI for the Gemini API
- Ant Design for the UI components
- MongoDB for the database solution
- Vercel for hosting and deployment

---

⭐ **If you find this project helpful, please give it a star!** ⭐
