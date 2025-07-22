# 🔌 SynapSolve API Documentation

## 📋 Overview

This document outlines the API structure and service integrations used in SynapSolve. The application uses a combination of Firebase services, third-party APIs, and custom service layers.

## 🔥 Firebase Services

### Authentication API

#### Sign In with Email
```typescript
const { signInWithEmail } = useAuth();
await signInWithEmail(email, password);
```

#### Sign In with Google
```typescript
const { signInWithGoogle } = useAuth();
await signInWithGoogle();
```

#### Sign Up with Email
```typescript
const { signUpWithEmail } = useAuth();
await signUpWithEmail(email, password, displayName);
```

#### Password Reset
```typescript
const { resetPassword } = useAuth();
await resetPassword(email);
```

### Firestore Database API

#### Ticket Collection Structure
```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  submittedBy: string;
  submittedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  aiSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  suggestedReply?: string;
}
```

#### Create Ticket
```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const docRef = await addDoc(collection(db, 'tickets'), ticketData);
```

#### User Collection Structure
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'agent' | 'admin';
  photoURL?: string;
  createdAt: Date;
}
```

## 🤖 OpenAI Integration

### Ticket Analysis API

#### Generate AI Summary
```typescript
import { generateAISummary } from '../services/openaiService';

const analysis = await generateAISummary(title, description);
// Returns: { summary, sentiment, suggestedReply }
```

#### API Request Structure
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: "You are an AI assistant specialized in customer support ticket analysis."
    },
    {
      role: "user",
      content: `Analyze this support ticket: ${title} - ${description}`
    }
  ],
  max_tokens: 500,
  temperature: 0.3
});
```

#### Response Format
```typescript
interface AIAnalysis {
  summary: string;           // 2-line ticket summary
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedReply: string;    // Professional response suggestion
  category?: string;         // Recommended category
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
```

## 🧠 Neo4j Agent Routing

### Agent Routing API

#### Find Best Agent
```typescript
import { findBestAgent } from '../services/neo4jService';

const agent = await findBestAgent(ticket, availableAgents);
```

#### Cypher Queries (Reference)
```cypher
// Find best agent based on skills and workload
MATCH (a:Agent)-[:HAS_SKILL]->(s:Skill)
WHERE s.name IN $requiredSkills
  AND a.isAvailable = true
  AND a.currentLoad < a.maxLoad
WITH a, count(s) as skillMatches
ORDER BY a.seniorLevel DESC, skillMatches DESC, a.currentLoad ASC
LIMIT 1
RETURN a
```

#### Agent Data Structure
```typescript
interface Agent {
  uid: string;
  email: string;
  displayName: string;
  skills: string[];
  currentLoad: number;
  maxLoad: number;
  isAvailable: boolean;
  seniorLevel: boolean;
}
```

## 📅 Google Calendar Integration

### Calendar Service API

#### Create Ticket Reminder
```typescript
import { calendarService } from '../services/calendarService';

const eventId = await calendarService.createTicketReminder(
  ticketId,
  ticketTitle,
  agentEmail,
  reminderDate
);
```

#### Schedule Agent Meeting
```typescript
const meetingId = await calendarService.scheduleAgentMeeting(
  agentEmails,
  subject,
  description,
  startTime,
  durationMinutes
);
```

#### Get Agent Availability
```typescript
const busyTimes = await calendarService.getAgentAvailability(
  agentEmail,
  startDate,
  endDate
);
```

## 🔧 Service Layer Architecture

### Mock Services (Development)

#### AI Analysis Mock
```typescript
export const generateAISummary = async (title: string, description: string) => {
  // Fallback logic when OpenAI is unavailable
  const sentiment = description.toLowerCase().includes('angry') ? 'negative' : 'neutral';
  
  return {
    summary: `${title.substring(0, 50)}... - ${sentiment.toUpperCase()} priority issue`,
    sentiment,
    suggestedReply: "Thank you for contacting us. I'll help resolve this issue."
  };
};
```

#### Agent Routing Mock
```typescript
export const findBestAgent = async (ticket: Ticket, agents: Agent[]) => {
  // Priority routing for negative sentiment
  if (ticket.sentiment === 'negative') {
    const seniorAgents = agents.filter(a => a.seniorLevel && a.isAvailable);
    if (seniorAgents.length > 0) return seniorAgents[0];
  }
  
  // Skill-based matching
  const skillMatched = agents.filter(agent =>
    agent.skills.some(skill => 
      ticket.category.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return skillMatched.length > 0 ? skillMatched[0] : agents[0];
};
```

## 🔒 Security & Error Handling

### Environment Variable Validation
```typescript
const validateEnv = (): void => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_OPENAI_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};
```

### Error Handling Patterns
```typescript
try {
  const result = await openaiGenerateAISummary(title, description);
  return result;
} catch (error) {
  console.warn('⚠️ OpenAI service unavailable, using fallback analysis');
  return fallbackAnalysis(title, description);
}
```

## 📊 API Response Formats

### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
```

### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 🚀 Rate Limiting & Performance

### OpenAI API Limits
- **Requests per minute**: 3,500 (GPT-3.5-turbo)
- **Tokens per minute**: 90,000
- **Requests per day**: 10,000

### Firebase Limits
- **Firestore reads**: 50,000/day (free tier)
- **Firestore writes**: 20,000/day (free tier)
- **Authentication**: Unlimited (free tier)

### Optimization Strategies
- Implement request caching for repeated queries
- Use batch operations for multiple Firestore writes
- Implement exponential backoff for failed requests
- Cache AI analysis results to reduce API calls

This API documentation provides a comprehensive guide for developers working with SynapSolve's service integrations and data structures.