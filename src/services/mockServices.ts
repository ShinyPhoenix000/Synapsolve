import { Ticket, Agent } from '../types';
import { generateAISummary as openaiGenerateAISummary } from './openaiService';
import { findBestAgent as neo4jFindBestAgent, updateAgentWorkload } from './neo4jService';
import { activeCalendarService } from './calendarService';

// Enhanced AI service that uses real OpenAI when available
export const generateAISummary = async (title: string, description: string): Promise<{
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedReply: string;
}> => {
  try {
    // Try to use real OpenAI service
    const result = await openaiGenerateAISummary(title, description);
    return {
      summary: result.summary,
      sentiment: result.sentiment,
      suggestedReply: result.suggestedReply
    };
  } catch (error) {
    console.warn('⚠️ OpenAI service unavailable, using fallback analysis');
    
    // Fallback to mock analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isNegative = description.toLowerCase().includes('angry') || 
                     description.toLowerCase().includes('frustrated') ||
                     description.toLowerCase().includes('terrible');
    
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

// Enhanced agent routing that uses Neo4j when available
export const findBestAgent = async (
  ticket: Ticket, 
  availableAgents: Agent[]
): Promise<Agent | null> => {
  try {
    // Try to use real Neo4j service
    const agent = await neo4jFindBestAgent(ticket, availableAgents);
    
    if (agent) {
      // Update agent workload
      await updateAgentWorkload(agent.uid, 1);
      
      // Create calendar reminder for follow-up
      const reminderDate = new Date();
      reminderDate.setHours(reminderDate.getHours() + 24); // 24 hours from now
      
      await activeCalendarService.createTicketReminder(
        ticket.id,
        ticket.title,
        agent.email,
        reminderDate
      );
    }
    
    return agent;
  } catch (error) {
    console.warn('⚠️ Neo4j service unavailable, using fallback routing');
    
    // Fallback to simple routing logic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Priority routing for negative sentiment
    if (ticket.sentiment === 'negative') {
      const seniorAgents = availableAgents.filter(agent => 
        agent.seniorLevel && agent.isAvailable && agent.currentLoad < agent.maxLoad
      );
      if (seniorAgents.length > 0) {
        return seniorAgents[0];
      }
    }
    
    // Find agent with matching skills and lowest load
    const suitableAgents = availableAgents.filter(agent => 
      agent.isAvailable && 
      agent.currentLoad < agent.maxLoad &&
      agent.skills.some(skill => 
        ticket.category.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    if (suitableAgents.length > 0) {
      return suitableAgents.sort((a, b) => a.currentLoad - b.currentLoad)[0];
    }
    
    // Fallback to any available agent
    const availableWithCapacity = availableAgents.filter(agent => 
      agent.isAvailable && agent.currentLoad < agent.maxLoad
    );
    
    return availableWithCapacity.length > 0 ? availableWithCapacity[0] : null;
  }
};

// Enhanced notification service
export const sendNotification = async (
  userId: string, 
  title: string, 
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
): Promise<void> => {
  console.log(`📧 Notification sent to ${userId}: ${title} - ${message}`);
  // In production, this would trigger email/push notifications
  
  // You could integrate with services like:
  // - Firebase Cloud Messaging for push notifications
  // - SendGrid or Mailgun for email notifications
  // - Slack or Teams for internal notifications
};