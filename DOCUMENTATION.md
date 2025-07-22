# 📚 SynapSolve - Complete Project Documentation

## 🏗️ Project Overview

**SynapSolve** is an AI-powered helpdesk automation suite built with modern web technologies. It combines Firebase for authentication and database, OpenAI for intelligent ticket analysis, Neo4j for smart agent routing, and Google Calendar for scheduling integration.

## 📁 Complete Project Structure

```
synapsolve/
├── public/                     # Static assets served directly
│   ├── vite.svg               # Vite logo
│   └── favicon.ico            # App favicon
├── src/                       # Source code
│   ├── components/            # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   │   ├── AuthPage.tsx  # Main auth page wrapper with background animations
│   │   │   ├── LoginForm.tsx # Login form with Google OAuth and email/password
│   │   │   ├── SignupForm.tsx # Registration form with validation
│   │   │   └── ForgotPasswordForm.tsx # Password reset flow
│   │   ├── dashboard/        # Dashboard components
│   │   │   └── Dashboard.tsx # Main dashboard with role-based views and stats
│   │   ├── layout/           # Layout components
│   │   │   └── Navbar.tsx    # Navigation bar with theme toggle and user menu
│   │   ├── tickets/          # Ticket-related components
│   │       └── TicketForm.tsx # Ticket submission form with AI processing
│   │   └── profile/          # Profile components
│   │       └── ProfileMenu.tsx # User profile dropdown menu with role display, navigation links (profile, settings, feedback, logout), and responsive design
│   ├── config/               # Configuration files
│   │   ├── env.ts           # Environment variable validation and type-safe access
│   │   └── firebase.ts      # Firebase SDK initialization and configuration
│   ├── context/              # React context providers
│   │   └── index.ts         # Barrel exports for all context providers
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication state management and methods
│   │   └── useTheme.tsx     # Theme switching and persistence
│   ├── services/             # External service integrations
│   │   ├── calendarService.ts # Google Calendar API integration
│   │   ├── mockServices.ts   # Mock service implementations for development
│   │   ├── neo4jService.ts   # Neo4j graph database service for agent routing
│   │   └── openaiService.ts  # OpenAI API integration for ticket analysis
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts         # Global interfaces and types
│   ├── utils/                # Utility functions and constants
│   │   ├── constants.ts     # Application-wide constants and enums
│   │   └── helpers.ts       # Pure utility functions (formatting, validation, etc.)
│   ├── App.tsx              # Main application component with routing logic
│   ├── main.tsx             # Application entry point with providers
│   ├── index.css            # Global styles with Tailwind and custom animations
│   └── vite-env.d.ts        # Vite type definitions
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example             # Environment template for setup
├── .gitignore               # Git ignore rules
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── PROJECT_STRUCTURE.md     # Detailed architecture documentation
├── README.md                # Project documentation and setup guide
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TypeScript settings
├── tsconfig.node.json       # Node.js-specific TypeScript settings
└── vite.config.ts           # Vite build configuration
```

## 📂 Detailed File Descriptions

### `/src/components/` - UI Components

#### `/src/components/auth/` - Authentication Components
- **`AuthPage.tsx`** - Main authentication page wrapper with animated background elements and mode switching
- **`LoginForm.tsx`** - Login form component with Google OAuth, email/password authentication, and forgot password link
- **`SignupForm.tsx`** - User registration form with validation, Google OAuth option, and account creation
- **`ForgotPasswordForm.tsx`** - Password reset form with email submission and success confirmation

#### `/src/components/dashboard/` - Dashboard Components
- **`Dashboard.tsx`** - Main dashboard component with role-based views, statistics cards, and tabbed navigation

#### `/src/components/layout/` - Layout Components
- **`Navbar.tsx`** - Navigation bar with theme toggle, notifications, user profile menu, and sign-out functionality

#### `/src/components/tickets/` - Ticket Management
- **`TicketForm.tsx`** - Ticket submission form with AI processing, category selection, and success animations

#### `/src/components/profile/` - Profile Components
- **`ProfileMenu.tsx`** - User profile dropdown menu with role display, navigation links (profile, settings, feedback, logout), and responsive design

### `/src/config/` - Configuration

- **`env.ts`** - Environment variable validation, type-safe access, and configuration management
- **`firebase.ts`** - Firebase SDK initialization with Auth and Firestore setup

### `/src/context/` - React Context

- **`index.ts`** - Barrel exports for AuthProvider and ThemeProvider context providers

### `/src/hooks/` - Custom React Hooks

- **`useAuth.tsx`** - Authentication hook with sign-in/sign-up methods, user state, and Firestore user document management
- **`useTheme.tsx`** - Theme management hook with dark/light mode toggle and localStorage persistence

### `/src/services/` - External Service Integrations

- **`calendarService.ts`** - Google Calendar API integration for ticket reminders, agent scheduling, and availability checking
- **`mockServices.ts`** - Mock implementations for AI analysis and agent routing with fallback logic
- **`neo4jService.ts`** - Neo4j graph database service for intelligent agent routing based on skills and workload
- **`openaiService.ts`** - OpenAI API integration for ticket summarization, sentiment analysis, and suggested replies

### `/src/types/` - TypeScript Definitions

- **`index.ts`** - Global TypeScript interfaces for User, Ticket, Agent, Notification, and AuthContext types

### `/src/utils/` - Utilities

- **`constants.ts`** - Application constants including priorities, statuses, roles, and categories with TypeScript types
- **`helpers.ts`** - Utility functions for date formatting, color classes, validation, and common operations

### `/src/pages/` - App Pages
- **`ProfilePage.jsx`** - User profile details (name, role, email, avatar)
- **`SettingsPage.jsx`** - User settings (theme, notifications)
- **`FeedbackPage.jsx`** - Feedback form (subject, message, Firestore integration)
- **`SelectRole.tsx`** - Role selection screen for new users

### Root Files

- **`App.tsx`** - Main application component with authentication routing and theme-aware background
- **`main.tsx`** - Application entry point with React providers and environment validation
- **`index.css`** - Global styles with Tailwind imports, custom animations, and glassmorphism effects

## 🔑 Key Code Excerpts

### Firebase Configuration (`src/config/firebase.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from './env';

const firebaseConfig = env.firebase;
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Authentication Hook (`src/hooks/useAuth.tsx`)
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createUserDocument(result.user);
};
```

### OpenAI Service (`src/services/openaiService.ts`)
```typescript
export const generateAISummary = async (
  title: string, 
  description: string
): Promise<AIAnalysis> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an AI assistant specialized in customer support ticket analysis."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 500,
    temperature: 0.3
  });
  // Process and return analysis
};
```

### Neo4j Agent Routing (`src/services/neo4jService.ts`)
```typescript
export const findBestAgent = async (
  ticket: Ticket,
  availableAgents: Agent[] = mockAgents
): Promise<Agent | null> => {
  // Priority routing for negative sentiment or urgent tickets
  if (ticket.sentiment === 'negative' || ticket.priority === 'urgent') {
    const seniorAgents = agentsWithCapacity.filter(agent => agent.seniorLevel);
    if (seniorAgents.length > 0) {
      return seniorAgents.sort((a, b) => a.currentLoad - b.currentLoad)[0];
    }
  }
  
  // Skill-based matching and workload balancing
  const skillMatchedAgents = agentsWithCapacity.filter(agent =>
    agent.skills.some(skill => 
      ticket.category.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return skillMatchedAgents.length > 0 ? skillMatchedAgents[0] : null;
};
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #2563EB)
- **Secondary**: Purple gradient (#8B5CF6 to #7C3AED)
- **Accent**: Green (#10B981)
- **Status Colors**: Red (urgent), Orange (high), Yellow (medium), Green (low)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Line Heights**: 120% (headings), 150% (body text)

### Visual Effects
- **Glassmorphism**: Backdrop blur with translucent backgrounds
- **Animations**: Framer Motion for smooth transitions
- **Theme Support**: Dark/light mode with persistent storage

## 🔧 Environment Variables

### Required Environment Variables
```bash
# Firebase Configuration (Public - safe for frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI API (Server-side recommended in production)
VITE_OPENAI_API_KEY=your_openai_api_key

# Google Calendar API
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Neo4j Database
VITE_NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
VITE_NEO4J_USERNAME=neo4j
VITE_NEO4J_PASSWORD=your_neo4j_password

# Application Settings
VITE_APP_NAME=SynapSolve
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## 🏗️ Architecture Overview

### Design Patterns
- **Component-Based Architecture**: Modular, reusable UI components
- **Context Pattern**: Global state management for auth and theme
- **Service Layer Pattern**: Clean separation between UI and business logic
- **Hook Pattern**: Custom hooks for reusable stateful logic

### Data Flow
1. **Authentication**: Firebase Auth → useAuth hook → Context Provider
2. **Ticket Submission**: Form → OpenAI Analysis → Firestore → Neo4j Routing
3. **Agent Assignment**: Neo4j Query → Firestore Update → Real-time UI Update
4. **Theme Management**: useTheme hook → localStorage → CSS classes

### Security Considerations
- Environment variable validation on startup
- Type-safe configuration management
- Role-based access control
- Input validation and sanitization
- Firebase security rules (to be implemented)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Auth and Firestore enabled
- OpenAI API key
- Google Cloud Console project (for Calendar API)
- Neo4j AuraDB instance (optional)

### Installation Steps
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server
5. Open `http://localhost:5173` in your browser

### Deployment
The application is configured for deployment on:
- **Vercel** (recommended for React apps)
- **Netlify** (static site hosting)
- **Firebase Hosting** (integrated with Firebase backend)

## 📈 Future Enhancements

### Immediate Next Steps
- Implement Firestore security rules
- Add real-time notifications with WebSockets
- Complete Google Calendar OAuth flow
- Connect to real Neo4j AuraDB instance

### Advanced Features
- Mobile app with React Native
- Advanced analytics dashboard
- Knowledge base with AI-powered search
- Workflow automation and escalation rules
- Third-party integrations (Slack, Teams, etc.)

This documentation provides a comprehensive overview of the SynapSolve project structure, making it easy for new developers to understand and contribute to the codebase.