# Exam Portal - Next.js MCQ Examination System

A secure, full-stack online MCQ examination system built with Next.js, React, and MongoDB.

## Features

✅ **Admin Panel**
- Create and manage multiple-choice questions
- Add/remove students and manage access
- View detailed exam results and statistics
- Configure exam settings (duration, questions per student, explanations)
- Change admin password

✅ **Student Exam Interface**
- Email-based access control
- Randomized question delivery
- Real-time timer with auto-submit
- Immediate feedback with explanations
- Answer review after submission

✅ **Security**
- JWT token-based authentication
- Bcrypt password hashing
- Email whitelist access control
- Protected admin routes

## Tech Stack

- **Frontend**: React 18, Next.js 14.2
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + Bcrypt
- **Styling**: Custom CSS with CSS Variables

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Vercel account (for deployment)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd exam-portal-nextjs
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create `.env.local` file in the root directory:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-portal?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key-min-32-characters
```

4. Run development server
```bash
npm run dev
```

Visit `http://localhost:3000`

### Default Credentials

- **Admin Default Password**: `admin123`
- ⚠️ Change this immediately in the Settings tab after first login!

## API Endpoints

### Authentication
- `POST /api/auth` - Login & change password

### Questions
- `GET /api/questions` - Get all questions (filtered for students)
- `POST /api/questions` - Create question (admin only)
- `DELETE /api/questions/[id]` - Delete question (admin only)
- `PUT /api/questions/[id]` - Update question (admin only)

### Students
- `POST /api/students` - Check access or add student (admin only)
- `GET /api/students` - Get all students (admin only)
- `DELETE /api/students/[id]` - Remove student (admin only)

### Results & Exam
- `GET /api/results` - Get exam questions or results (admin only for results)
- `POST /api/results` - Submit exam answers

### Settings
- `GET /api/settings` - Get exam settings
- `PUT /api/settings` - Update exam settings (admin only)

## Project Structure

```
exam-portal-nextjs/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin panel
│   ├── exam/             # Student exam page
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   └── globals.css       # Global styles
├── lib/
│   ├── auth.js           # JWT utilities
│   └── mongodb.js        # Database connection
├── models/               # Mongoose schemas
│   ├── Admin.js
│   ├── Student.js
│   ├── Question.js
│   ├── Result.js
│   └── Settings.js
├── public/               # Static assets
├── package.json
├── next.config.js
└── vercel.json
```

## Deployment to Vercel

1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/exam-portal-nextjs.git
git push -u origin main
```

2. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Add environment variables (MONGO_URI, JWT_SECRET)
- Deploy!

3. Configure environment variables in Vercel dashboard
- Add `MONGO_URI` - Your MongoDB Atlas connection string
- Add `JWT_SECRET` - A secure random string (min 32 characters)

## Usage

### Admin Workflow

1. Go to `/admin`
2. Login with password (default: `admin123`)
3. **Questions Tab**: Add MCQ questions with 4 options, mark correct answer
4. **Students Tab**: Add student emails to whitelist
5. **Results Tab**: View student performance and scores
6. **Settings Tab**: Configure exam duration, randomization, and feedback

### Student Workflow

1. Go to `/exam`
2. Enter registered email
3. Start exam with randomized questions
4. Answer questions with real-time timer
5. Submit and view detailed score report with answer review

## Security Notes

- Always change the default admin password
- Use strong JWT_SECRET (min 32 characters, random)
- MongoDB should be configured with proper IP whitelist
- Keep `.env.local` out of version control (included in .gitignore)
- Consider rate limiting for production use

## Performance Tips

- Set `questionsPerStudent` in settings for randomization
- Use explanations sparingly to reduce data transfer
- Monitor MongoDB connection pooling
- Enable compression in Next.js (built-in)

## Troubleshooting

**"Admin not found" error**
- Delete admin document in MongoDB and restart app
- App will auto-create with default password

**"Email not allowed" error**
- Student email must be added to whitelist in admin panel
- Check for email case sensitivity

**Exam auto-submits**
- Timer is running per exam, not global
- Adjust `examDuration` in settings

**Questions not showing**
- Ensure questions are added by admin
- Check MongoDB connection with `console.log`

## License

MIT

## Author

Created as a secure examination portal system.
