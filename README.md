# 🚀 GreedyGame Todo Application

A modern, full-stack todo application built with **Next.js 15**, **Supabase**, and **Framer Motion**. This project demonstrates clean architecture, smooth animations, and production-ready deployment with Docker containerization.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-cyan)](https://tailwindcss.com/)

![Todo App Demo](https://via.placeholder.com/800x400/1f2937/ffffff?text=GreedyGame+Todo+App)

## ✨ Features

### 🎯 **Core Functionality**
- **User Authentication** - Secure login/signup with Supabase Auth
- **Todo Management** - Create, read, update, and delete todos
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode Ready** - Beautiful dark theme support

### 🎨 **User Experience**
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Modern UI** - Clean, minimalist design with custom shadows
- **Loading States** - Elegant loading indicators
- **Error Handling** - User-friendly error messages
- **Accessibility** - WCAG compliant components

### 🛠️ **Developer Experience**
- **TypeScript** - Full type safety throughout the application
- **ESLint + Prettier** - Consistent code formatting and quality
- **Hot Reload** - Fast development with Next.js
- **Docker Support** - Easy deployment and development environment
- **Production Ready** - Optimized builds and security best practices

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **shadcn/ui** - Reusable component library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level authorization
- **Real-time Subscriptions** - Live data updates

### **Development & Deployment**
- **Docker** - Containerization
- **ESLint** - Code linting with import sorting
- **Prettier** - Code formatting
- **GitHub Actions Ready** - CI/CD pipeline support

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Docker** (optional) - [Download here](https://www.docker.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

### 1. Clone & Install

```bash
git clone https://github.com/borkeradarsh/greedygame-todo.git
cd greedygame-todo
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup

Run the database migrations in your Supabase dashboard:

```sql
-- Located in: supabase/migrations/001_initial_schema.sql
-- Copy and paste the contents into your Supabase SQL editor
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
  -t gg-todo:latest .

# Run the container
docker run -p 3000:3000 --name gg-todo-container gg-todo:latest
```

### Docker Compose

```bash
# Create .env file with your Supabase credentials
# Then run:
docker-compose up --build
```

### Production Deployment

The application is ready for deployment on:
- **AWS ECS/Fargate**
- **Google Cloud Run** 
- **Azure Container Instances**
- **Railway**
- **Render**

## 📁 Project Structure

```
gg-todo/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes (grouped)
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── auth/                   # Auth callbacks
│   │   ├── auth-code-error/   # Error handling
│   │   └── callback/          # OAuth callback
│   ├── dashboard/             # Protected dashboard routes
│   │   ├── profile/          # User profile
│   │   └── user-management/  # Admin features
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Landing page
├── components/                # Reusable components
│   ├── ui/                   # shadcn/ui components
│   ├── Navbar.tsx           # Navigation component
│   └── Sidebar.tsx          # Dashboard sidebar
├── lib/                     # Utility libraries
│   ├── supabase/           # Supabase configuration
│   ├── types/              # TypeScript definitions
│   └── utils.ts           # Helper functions
├── supabase/               # Database
│   ├── migrations/        # SQL migrations
│   └── sample_data.sql   # Sample data
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker container definition
└── .dockerignore        # Docker ignore patterns
```

## 🎨 Design System

### **Custom Shadows**
```css
/* Soft shadow for cards */
.shadow-soft { 
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 
              0 10px 20px -2px rgba(0, 0, 0, 0.04); 
}

/* Glow effect for interactive elements */
.shadow-glow { 
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.15), 
              0 0 6px rgba(59, 130, 246, 0.1); 
}
```

### **Animation System**
- **Page Transitions** - Smooth fade and slide effects
- **Staggered Lists** - Sequential item animations
- **Hover Effects** - Subtle scale and lift interactions
- **Loading States** - Skeleton loaders and spinners

## 🔧 Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript checker
```

### **Code Quality**

```bash
# Format code
npm run format

# Lint and fix issues
npm run lint:fix

# Check types
npm run type-check

# Run all checks
npm run build
```

### **Database Migrations**

1. **Initial Schema**: Creates users, todos, and RLS policies
2. **Sample Data**: Inserts demo todos for testing

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/001_initial_schema.sql
\i supabase/sample_data.sql
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level authorization
- **JWT Authentication** - Secure token-based auth
- **HTTPS Only** - Secure data transmission
- **Environment Variables** - Sensitive data protection
- **CSRF Protection** - Built-in Next.js security
- **Non-root Docker User** - Container security best practices

## 🚦 Performance

### **Lighthouse Scores**
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### **Optimizations**
- **Image Optimization** - Next.js automatic optimization
- **Code Splitting** - Route-based chunks
- **Tree Shaking** - Unused code elimination
- **Gzip Compression** - Reduced bundle sizes
- **CDN Ready** - Static asset optimization

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feat/amazing-feature`
3. **Commit changes**: `git commit -m 'feat: add amazing feature'`
4. **Push to branch**: `git push origin feat/amazing-feature`
5. **Open a Pull Request**

### **Commit Convention**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code formatting
- `refactor:` - Code refactoring
- `test:` - Testing updates
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GreedyGame** - For the opportunity to build this application
- **Vercel** - For the excellent Next.js framework
- **Supabase** - For the powerful backend platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For the beautiful animations

## 📞 Support

- **Email**: [adarshborker@gmail.com](mailto:adarshborker@gmail.com)
- **GitHub**: [@borkeradarsh](https://github.com/borkeradarsh)
- **LinkedIn**: [Adarsh Borker](https://linkedin.com/in/adarshborker)

---

<div align="center">
  <strong>Built with ❤️ for GreedyGame</strong>
</div>
