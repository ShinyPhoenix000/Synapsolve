# 🗂 SynapSolve Project Structure

This document outlines the complete folder structure and explains the purpose of each directory and key files.

## 📁 Root Directory

```
synapsolve/
├── public/                     # Static assets served directly
│   ├── vite.svg               # Vite logo
│   └── favicon.ico            # App favicon
├── src/                       # Source code
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies and scripts
├── README.md                 # Project documentation
├── PROJECT_STRUCTURE.md      # This file
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── index.html                # HTML entry point
```

## 📂 Source Directory (`src/`)

```
src/
├── components/               # Reusable UI components
│   ├── auth/                # Authentication components
│   │   ├── AuthPage.tsx     # Main auth page wrapper
│   │   ├── LoginForm.tsx    # Login form component
│   │   ├── SignupForm.tsx   # Registration form
│   │   └── ForgotPasswordForm.tsx # Password reset
│   ├── dashboard/           # Dashboard components
│   │   └── Dashboard.tsx    # Main dashboard view
│   ├── layout/              # Layout components
│   │   └── Navbar.tsx       # Navigation bar
│   └── tickets/             # Ticket-related components
│       └── TicketForm.tsx   # Ticket submission form
├── config/                  # Configuration files
│   ├── env.ts              # Environment variable handling
│   └── firebase.ts         # Firebase initialization
├── context/                 # React context providers
│   └── index.ts            # Context barrel exports
├── hooks/                   # Custom React hooks
│   ├── useAuth.tsx         # Authentication hook
│   └── useTheme.tsx        # Theme management hook
├── services/                # External service integrations
│   ├── calendarService.ts  # Google Calendar API
│   ├── mockServices.ts     # Mock service implementations
│   ├── neo4jService.ts     # Neo4j database service
│   └── openaiService.ts    # OpenAI API integration
├── types/                   # TypeScript type definitions
│   └── index.ts            # Global type definitions
├── utils/                   # Utility functions and constants
│   ├── constants.ts        # Application constants
│   └── helpers.ts          # Helper functions
├── App.tsx                  # Main application component
├── main.tsx                # Application entry point
├── index.css               # Global styles
└── vite-env.d.ts           # Vite type definitions
```

## 📋 Directory Explanations

### `/src/components/`
Contains all reusable UI components organized by feature:
- **`auth/`**: Authentication-related components (login, signup, password reset)
- **`dashboard/`**: Main application dashboard and views
- **`layout/`**: Layout components like navigation, headers, footers
- **`tickets/`**: Ticket management components (forms, lists, details)

### `/src/config/`
Configuration and setup files:
- **`env.ts`**: Environment variable validation and type-safe access
- **`firebase.ts`**: Firebase SDK initialization and configuration

### `/src/context/`
React Context providers for global state management:
- **`index.ts`**: Barrel exports for all context providers
- Future contexts: notifications, settings, user preferences

### `/src/hooks/`
Custom React hooks for reusable logic:
- **`useAuth.tsx`**: Authentication state and methods
- **`useTheme.tsx`**: Theme switching and persistence
- Future hooks: useNotifications, useLocalStorage, useDebounce

### `/src/services/`
External service integrations and API wrappers:
- **`openaiService.ts`**: OpenAI API for ticket analysis
- **`neo4jService.ts`**: Neo4j graph database for agent routing
- **`calendarService.ts`**: Google Calendar integration
- **`mockServices.ts`**: Mock implementations for development

### `/src/types/`
TypeScript type definitions:
- **`index.ts`**: Global interfaces and types
- Future: API response types, form schemas, database models

### `/src/utils/`
Utility functions and constants:
- **`constants.ts`**: Application-wide constants and enums
- **`helpers.ts`**: Pure utility functions (formatting, validation, etc.)

## 🔧 Configuration Files

### Environment Variables (`.env`)
```bash
# Firebase (Public - safe for frontend)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project

# OpenAI (Should be server-side in production)
VITE_OPENAI_API_KEY=your_openai_key

# Google Calendar
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_secret

# Neo4j
VITE_NEO4J_URI=your_neo4j_uri
VITE_NEO4J_USERNAME=neo4j
VITE_NEO4J_PASSWORD=your_password
```

### TypeScript Configuration
- **`tsconfig.json`**: Main TypeScript configuration
- **`tsconfig.app.json`**: App-specific TypeScript settings
- **`tsconfig.node.json`**: Node.js-specific settings for build tools

### Build Configuration
- **`vite.config.ts`**: Vite bundler configuration
- **`tailwind.config.js`**: Tailwind CSS customization
- **`postcss.config.js`**: PostCSS plugins configuration

## 🚀 Scripts

```json
{
  "dev": "vite",              // Start development server
  "build": "vite build",      // Build for production
  "lint": "eslint .",         // Run ESLint
  "preview": "vite preview"   // Preview production build
}
```

## 📦 Key Dependencies

### Core Framework
- **React 18**: UI library with concurrent features
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Backend & Services
- **Firebase**: Authentication and database
- **OpenAI**: AI-powered ticket analysis
- **Neo4j**: Graph database for intelligent routing

## 🔒 Security Considerations

1. **Environment Variables**: All sensitive data is stored in `.env` files
2. **API Keys**: Server-side keys should not be exposed to the frontend
3. **Firebase Rules**: Implement proper Firestore security rules
4. **Authentication**: Role-based access control implemented
5. **Input Validation**: All user inputs are validated and sanitized

## 🧪 Testing Strategy

Future testing structure:
```
tests/
├── __mocks__/              # Mock implementations
├── components/             # Component tests
├── hooks/                  # Hook tests
├── services/               # Service integration tests
├── utils/                  # Utility function tests
└── e2e/                    # End-to-end tests
```

## 📈 Scalability Considerations

1. **Modular Architecture**: Easy to add new features and components
2. **Service Layer**: Clean separation between UI and business logic
3. **Type Safety**: TypeScript prevents runtime errors
4. **Environment Management**: Easy configuration for different environments
5. **Code Splitting**: Vite automatically optimizes bundle sizes

This structure provides a solid foundation for scaling the SynapSolve application while maintaining code quality and developer productivity.