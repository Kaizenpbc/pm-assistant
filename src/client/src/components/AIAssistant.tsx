import React, { useState, useRef, useEffect } from 'react';

interface AIAssistantProps {
  onClose: () => void;
  type: 'analysis' | 'recommendations' | 'chat';
  projectId?: number | string;
  projectName?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, type, projectId: _projectId, projectName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatStarted, setIsChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    const projectContext = projectName ? ` for **${projectName}**` : '';
    
    // Tasks and work-related questions
    if (message.includes('task') || message.includes('work') || message.includes('todo') || message.includes('this week') || message.includes('today') || message.includes('what should i do') || message.includes('what to do')) {
      return `📋 **Tasks${projectContext}**

**High Priority Tasks:**
• **Design Phase**: Complete user interface mockups (Due: Friday)
• **Technical Review**: Review and approve system architecture (Due: Wednesday)
• **Team Coordination**: Conduct daily standup meetings (Daily)

**Medium Priority Tasks:**
• **Documentation**: Update project specifications (Due: Thursday)
• **Testing**: Prepare test cases and scenarios (Due: Friday)
• **Stakeholder Updates**: Schedule progress review meeting (Due: Next Monday)

**Upcoming Deadlines:**
• **Monday**: Client presentation and demo
• **Wednesday**: Technical architecture review
• **Friday**: Sprint retrospective and next sprint planning

**Focus Areas:**
• Complete design mockups and get client approval
• Finalize technical architecture decisions
• Prepare comprehensive project documentation

**Pro Tip**: Focus on the design mockups first - they're critical for client approval! 🚀`;
    }
    
    // Greetings and casual conversation
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon') || message.includes('good evening')) {
      return `👋 **Hello! I'm your AI Assistant${projectContext}!**

I'm here to help you with everything related to this project!

**What can I help you with today?**
• 📊 Analyze project performance and progress
• ⚠️ Assess risks and provide solutions
• 🚀 Optimize team productivity and workflows
• 💰 Review budget and spending
• ⏰ Check timelines and deadlines
• 💡 Give smart recommendations

**Just ask me anything about this project!** For example:
• "How is this project performing?"
• "What should I focus on today?"
• "Any risks I should know about?"`;
    }
    
    // How are you / status questions
    if (message.includes('how are you') || message.includes('how\'s it going') || message.includes('what\'s up') || message.includes('status')) {
      return `😊 **I'm doing great, thanks for asking!**

I'm ready and energized to help you manage your projects better. I've been analyzing your project data and I'm excited to share some insights!

**I'm currently tracking:**
• 3 active projects with excellent progress
• Team productivity at 92% (above average!)
• Budget utilization on track at 67%
• Low risk score of 23 points

**What would you like to dive into first?** I'm here to help make your project management even more successful! 🚀`;
    }
    
    // Thank you responses
    if (message.includes('thank') || message.includes('thanks') || message.includes('appreciate')) {
      return `😊 **You're very welcome!**

I'm here to help make your project management journey smoother and more successful. 

**Is there anything else I can help you with?**
• Need insights on a specific project?
• Want to discuss team optimization?
• Looking for risk mitigation strategies?
• Need budget analysis?

**Just let me know - I'm always ready to assist!** 🤖✨`;
    }
    
    // Project performance questions
    if (message.includes('performance') || message.includes('how are my projects') || message.includes('project status') || message.includes('progress') || message.includes('how is this project')) {
      return `📊 **Project Performance Analysis${projectContext}**

**Current Status:**
• **Completion Rate**: 78% (excellent progress)
• **Budget Utilization**: 67% (on track)
• **Timeline Adherence**: 85% (ahead of schedule)
• **Team Productivity**: 92% (high efficiency)

**Key Insights:**
• This project is performing above industry standards
• Budget management is excellent with 33% remaining
• Team velocity has increased by 15% this quarter
• Risk score is low at 23 points

**Recommendations:**
• Continue current management approach
• Focus on completing the design phase
• Schedule regular team check-ins for this project`;
    }
    
    // Risk questions
    if (message.includes('risk') || message.includes('risks') || message.includes('concern') || message.includes('problem')) {
      return `⚠️ **Risk Assessment**

**Current Risk Level**: LOW (23/100)

**Identified Risks:**
• **Design Phase Delay**: 3-5 day potential delay
• **Resource Bottleneck**: 2 team members overloaded
• **Budget Variance**: 5% over planned spending

**Mitigation Strategies:**
• Add buffer time to design milestones
• Cross-train team members for flexibility
• Implement weekly budget reviews
• Set up automated risk alerts`;
    }
    
    // Productivity questions
    if (message.includes('productivity') || message.includes('team') || message.includes('improve') || message.includes('efficiency') || message.includes('optimize')) {
      return `🚀 **Team Productivity Optimization**

**Current Productivity**: 85% (above average)

**Improvement Opportunities:**
• **Task Automation**: Automate 30% of routine tasks
• **Meeting Optimization**: Reduce meeting time by 25%
• **Skill Development**: Cross-train team members
• **Tool Integration**: Implement better collaboration tools

**Action Plan:**
1. Identify repetitive tasks for automation
2. Implement daily standups (15 min max)
3. Create skill development roadmap
4. Evaluate new project management tools`;
    }
    
    // Budget questions
    if (message.includes('budget') || message.includes('cost') || message.includes('spending') || message.includes('money') || message.includes('financial')) {
      return `💰 **Budget Management Insights**

**Current Budget Status:**
• **Total Budget**: $150,000
• **Spent**: $100,500 (67%)
• **Remaining**: $49,500 (33%)
• **Monthly Burn Rate**: $12,000

**Budget Breakdown:**
• **Personnel**: 60% ($60,300)
• **Tools & Software**: 15% ($15,075)
• **Infrastructure**: 20% ($20,100)
• **Miscellaneous**: 5% ($5,025)

**Recommendations:**
• Budget is on track for completion
• Consider early tool purchases for discounts
• Plan for potential scope changes
• Set up monthly budget reviews`;
    }
    
    // Timeline questions
    if (message.includes('timeline') || message.includes('schedule') || message.includes('deadline') || message.includes('when') || message.includes('due')) {
      return `⏰ **Timeline Analysis**

**Project Timeline Status:**
• **Start Date**: January 15, 2024
• **Planned End**: March 30, 2024
• **Current Progress**: 78% complete
• **Estimated Completion**: March 25, 2024 (5 days early)

**Milestone Status:**
• ✅ **Phase 1**: Completed on time
• ✅ **Phase 2**: Completed 2 days early
• 🟡 **Phase 3**: On track (80% complete)
• 🔵 **Phase 4**: Not started (scheduled for next week)

**Critical Path Items:**
• Design review completion
• Client approval process
• Final testing phase`;
    }
    
    // Help questions
    if (message.includes('help') || message.includes('what can you do') || message.includes('capabilities') || message.includes('assist')) {
      return `🤖 **I'm your AI Project Management Assistant!**

**Here's what I can help you with:**

📊 **Project Analysis**
• Performance metrics and insights
• Progress tracking and reporting
• Success rate analysis

⚠️ **Risk Management**
• Risk identification and assessment
• Mitigation strategy recommendations
• Early warning alerts

🚀 **Team Optimization**
• Productivity analysis and improvements
• Resource allocation suggestions
• Skill development recommendations

💰 **Financial Management**
• Budget tracking and analysis
• Cost optimization strategies
• Spending pattern insights

⏰ **Timeline Management**
• Schedule analysis and optimization
• Deadline tracking and alerts
• Critical path identification

**Just ask me anything about your projects!** I'm here to help make your project management more successful! ✨`;
    }
    
    // Default response - more conversational
    return `🤖 **I understand you're asking about "${userMessage}"**

That's a great question! Let me help you with that.

**I can provide insights on:**
• 📊 Project performance and metrics
• ⚠️ Risk assessment and mitigation
• 🚀 Team productivity optimization
• 💰 Budget and financial analysis
• ⏰ Timeline and scheduling
• 💡 Smart recommendations

**Try asking me something like:**
• "How are my projects performing?"
• "What risks should I watch out for?"
• "How can I improve team productivity?"
• "What's my budget status?"
• "How is my timeline looking?"

**I'm here to help make your project management more successful!** 🚀`;
  };

  const handleAIRequest = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      let aiResponse = '';
      
      switch (type) {
        case 'analysis':
          aiResponse = `📊 **AI Project Analysis Complete!**

**Key Insights:**
• Your projects are performing well overall
• 3 active projects with good progress
• Budget utilization is at 78% - on track
• Timeline adherence: 85% - excellent

**Recommendations:**
• Consider adding more detailed milestone tracking
• Review resource allocation for upcoming phases
• Schedule regular team check-ins`;
          break;
          
        case 'recommendations':
          aiResponse = `💡 **Smart Recommendations**

**Priority Actions:**
1. **Resource Optimization**: Reallocate team members to high-priority projects
2. **Risk Mitigation**: Set up automated alerts for budget thresholds
3. **Timeline Management**: Add buffer time for complex deliverables

**Growth Opportunities:**
• Implement agile methodology for faster delivery
• Set up automated reporting for stakeholders
• Create project templates for similar future projects`;
          break;
          
        case 'chat':
          aiResponse = `🤖 **AI Chat Assistant**

Hello! I'm your AI Project Management Assistant. I can help you with:

**What I can do:**
• Analyze project performance and trends
• Suggest improvements and optimizations
• Answer questions about your projects
• Provide insights on resource allocation
• Help with project planning and scheduling

**Try asking me:**
• "How are my projects performing?"
• "What risks should I watch out for?"
• "How can I improve team productivity?"
• "What's the best way to manage budgets?"`;
          break;
      }
      
      setResponse(aiResponse);
      setIsLoading(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userInput);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const startChat = () => {
    setIsChatStarted(true);
    const projectContext = projectName ? ` for **${projectName}**` : '';
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: `🤖 **Welcome to AI Chat Assistant${projectContext}!**

Hello! I'm your AI Project Management Assistant. I can help you analyze this project, provide insights, and answer questions about:

• **Project Performance** - How this project is doing
• **Risk Management** - What risks to watch out for  
• **Team Productivity** - How to improve efficiency
• **Budget Analysis** - Spending and cost insights
• **Timeline Management** - Schedule and deadline tracking

**What would you like to know about this project?**`,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  };

  const getTitle = () => {
    switch (type) {
      case 'analysis': return 'AI Project Analysis';
      case 'recommendations': return 'Smart Recommendations';
      case 'chat': return 'AI Chat Assistant';
      default: return 'AI Assistant';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'analysis': return 'Get detailed insights about your project performance';
      case 'recommendations': return 'Receive AI-powered suggestions for improvement';
      case 'chat': return 'Chat with your AI project management assistant';
      default: return 'AI-powered assistance';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
            <p className="text-sm text-gray-500">{getDescription()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {type === 'chat' ? (
          <div className="flex flex-col h-[70vh]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!isChatStarted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 text-2xl">💬</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to chat!</h4>
                  <p className="text-gray-500 mb-6">Start a conversation with your AI project management assistant</p>
                  <button
                    onClick={startChat}
                    className="btn btn-primary"
                  >
                    Start Chat
                  </button>
                </div>
              ) : (
                <>
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Chat Input */}
            {isChatStarted && (
              <div className="border-t p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me about your projects..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  💡 Try asking: "How are my projects performing?" or "What risks should I watch out for?"
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {!response && !isLoading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">
                    {type === 'analysis' ? '🤖' : type === 'recommendations' ? '💡' : '💬'}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to help!</h4>
                <p className="text-gray-500 mb-6">
                  {type === 'analysis' && "Click below to analyze your project performance"}
                  {type === 'recommendations' && "Click below to get smart recommendations"}
                  {(type as string) === 'chat' && "Click below to start chatting with your AI assistant"}
                </p>
                <button
                  onClick={handleAIRequest}
                  className="btn btn-primary"
                >
                  {type === 'analysis' && "Analyze Projects"}
                  {type === 'recommendations' && "Get Recommendations"}
                  {(type as string) === 'chat' && "Start Chat"}
                </button>
              </div>
            )}
            
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI is thinking...</p>
              </div>
            )}
            
            {response && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {response}
                  </pre>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAIRequest}
                    className="btn btn-secondary"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="btn btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
