import OpenAI from 'openai';
import { env } from '../config/env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedReply: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const generateAISummary = async (
  title: string, 
  description: string
): Promise<AIAnalysis> => {
  try {
    const prompt = `
Analyze this support ticket and provide:
1. A concise 2-line summary
2. Sentiment analysis (positive, neutral, or negative)
3. A professional suggested reply
4. Recommended category if not obvious
5. Priority level based on urgency

Ticket Title: ${title}
Ticket Description: ${description}

Please respond in JSON format with keys: summary, sentiment, suggestedReply, category, priority
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in customer support ticket analysis. Provide accurate, helpful analysis in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || `${title.substring(0, 50)}... - Support request requiring attention.`,
        sentiment: parsed.sentiment || 'neutral',
        suggestedReply: parsed.suggestedReply || "Thank you for contacting us. I'll be happy to assist you with this request.",
        category: parsed.category,
        priority: parsed.priority
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        summary: `${title.substring(0, 50)}... - Support request analyzed by AI.`,
        sentiment: description.toLowerCase().includes('urgent') || description.toLowerCase().includes('critical') ? 'negative' : 'neutral',
        suggestedReply: "Thank you for reaching out. I understand your concern and I'm here to help resolve this issue promptly."
      };
    }

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback analysis if OpenAI fails
    const isNegative = description.toLowerCase().includes('angry') || 
                     description.toLowerCase().includes('frustrated') ||
                     description.toLowerCase().includes('terrible') ||
                     description.toLowerCase().includes('urgent');
    
    const isPositive = description.toLowerCase().includes('great') ||
                      description.toLowerCase().includes('awesome') ||
                      description.toLowerCase().includes('excellent');

    const sentiment = isNegative ? 'negative' : isPositive ? 'positive' : 'neutral';
    
    return {
      summary: `${title.substring(0, 50)}... - ${sentiment.toUpperCase()} priority issue requiring attention.`,
      sentiment,
      suggestedReply: sentiment === 'negative' 
        ? "Thank you for reaching out. I understand your frustration and I'm here to help resolve this issue promptly."
        : "Thank you for contacting us. I'll be happy to assist you with this request."
    };
  }
};

export const generateFollowUpSuggestions = async (
  ticketHistory: string,
  currentStatus: string
): Promise<string[]> => {
  try {
    const prompt = `
Based on this ticket history and current status, suggest 3 appropriate follow-up actions:

Ticket History: ${ticketHistory}
Current Status: ${currentStatus}

Provide 3 concise follow-up suggestions as a JSON array.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps generate follow-up suggestions for customer support tickets."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.5
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      try {
        return JSON.parse(response);
      } catch {
        return [
          "Follow up with customer on resolution status",
          "Check if additional assistance is needed",
          "Schedule a follow-up call if issue persists"
        ];
      }
    }

    return [
      "Follow up with customer on resolution status",
      "Check if additional assistance is needed", 
      "Schedule a follow-up call if issue persists"
    ];

  } catch (error) {
    console.error('OpenAI Follow-up Error:', error);
    return [
      "Follow up with customer on resolution status",
      "Check if additional assistance is needed",
      "Schedule a follow-up call if issue persists"
    ];
  }
};