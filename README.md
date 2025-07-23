# SynapSolve – AI Helpdesk Automation Suite

A modern, full-featured helpdesk automation platform built using React, Firebase, Neo4j, and OpenAI. SynapSolve streamlines customer support through intelligent ticket assignment, automatic summarization, and a responsive, role-based user experience.

## Features

### Core Functionality
- **Secure Authentication**: Google Sign-In and Email/Password (via Firebase Auth)
- **Role-Based Access**: User-specific dashboards for Customers, Agents, and Admins
- **AI-Powered Ticket Intelligence**: Summarization, sentiment analysis, and smart reply suggestions
- **Intelligent Agent Routing**: Neo4j-based workload-aware ticket assignment
- **Real-Time Updates**: In-app UI reflects live Firestore and routing changes
- **Filter and Search**: Query tickets by status, priority, category, and date
- **Optional Calendar Integration**: Automatically schedule events for certain ticket types

## Tech Stack

| Layer        | Technologies Used                                |
|--------------|---------------------------------------------------|
| Frontend     | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend      | Firebase Authentication, Firestore               |
| AI Services  | OpenAI GPT-3.5 Turbo (used via server-side call) |
| Graph DB     | Neo4j AuraDB (agent management and routing)      |
| Calendar     | Google Calendar API (OAuth 2.0 integration)      |

## Architecture Overview

src/
├── components/        # Reusable UI components  

├── config/            # Firebase and environment setup  

├── context/           # Auth and role-based context providers  

├── hooks/             # Custom React hooks  

├── pages/             # Page-level components (Dashboard, etc.)  

├── services/          # API integrations (OpenAI, Neo4j, Calendar, Firebase)  

├── types/             # TypeScript interfaces and types  

├── utils/             # Helper utilities and constants  

└── App.tsx            # Main application entry point  


## Design System

### Colors
- **Primary**: Blue gradient (#3B82F6 to #2563EB)  
- **Secondary**: Purple gradient (#8B5CF6 to #7C3AED)  
- **Accent**: Green (#10B981)  
- **Status**: Informative colors based on ticket priority/status  

### Typography
- **Font**: Inter (via Google Fonts)
- **Weights**: 300 to 700
- **Layout**: Clean and legible with hierarchy-based spacing

### Visuals
- Glassmorphism UI effects (backdrop blur)
- Smooth Framer Motion animations for transitions
- Dark Mode supported with persistent theme toggle

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Firebase Project with Firestore and Authentication
- OpenAI API Key (server-side only)
- Neo4j AuraDB (optional, recommended)
- Google Cloud Project for Calendar API (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/synapsolve.git
   cd synapsolve

	2.	Install dependencies:

npm install


	3.	Configure environment variables:  
	•	Create a .env file using .env.example as a template.  
	•	Do not commit real secrets to Git.  
	4.	Start the development server:  

npm run dev



⸻

Firebase Setup
	•	Enable Firestore and Google/Email authentication providers
	•	Add your development domain to Firebase Authentication settings

OpenAI Integration
	•	Obtain an API key from OpenAI
	•	Set the key in your .env file as:

VITE_OPENAI_API_KEY=your_key_here



Neo4j Integration (Optional)
	•	Create a free instance on Neo4j AuraDB
	•	Add credentials and URI to your .env file

Google Calendar API (Optional)
	•	Enable the Calendar API in Google Cloud Console
	•	Create OAuth credentials and register the localhost origin for development
	•	Add the client ID and secret to your .env

⸻

Deployment

Vercel (Recommended)
	•	Connect your GitHub repository
	•	Add environment variables in the Vercel dashboard
	•	Vercel automatically handles builds and deployment

Firebase Hosting

npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy

Netlify
	•	Build command: npm run build  
	•	Publish directory: dist  
	•	Set required environment variables in the Netlify UI  

⸻

Security Notes
	•	Do not commit .env or real API keys  
	•	Always use Firestore security rules and access control logic  
	•	Move AI and calendar logic server-side for production  
	•	Use Firebase App Check and enable analytics/firewall rules as needed  

⸻

License

MIT License. See the LICENSE file for full details.  

⸻

Contributing  
	1.	Fork the repository  
	2.	Create a new branch:  

git checkout -b feature/your-feature-name  


	3.	Commit your changes  
	4.	Push the branch and open a pull request  

⸻

For issues, improvements, or feature requests, please open an issue in the repository.


