// Environment configuration with validation
interface EnvConfig {
  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  
  // OpenAI
  openai: {
    apiKey: string;
  };
  
  // Google Calendar
  google: {
    clientId: string;
    clientSecret: string;
  };
  
  // Neo4j
  neo4j: {
    uri: string;
    username: string;
    password: string;
  };
  
  // App settings
  app: {
    name: string;
    version: string;
    nodeEnv: string;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const env: EnvConfig = {
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  },
  
  google: {
    clientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
    clientSecret: getEnvVar('VITE_GOOGLE_CLIENT_SECRET'),
  },
  
  neo4j: {
    uri: getEnvVar('VITE_NEO4J_URI'),
    username: getEnvVar('VITE_NEO4J_USERNAME'),
    password: getEnvVar('VITE_NEO4J_PASSWORD'),
  },
  
  app: {
    name: getEnvVar('VITE_APP_NAME', 'SynapSolve'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    nodeEnv: getEnvVar('VITE_NODE_ENV', 'development'),
  },
};

// Validate critical environment variables on app start
export const validateEnv = (): void => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_OPENAI_API_KEY',
    'VITE_GOOGLE_CLIENT_ID',
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
  
  console.log('✅ Environment variables validated successfully');
};

export default env;