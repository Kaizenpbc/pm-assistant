import React, { useState } from 'react';

interface AIAssistantProps {
  onClose: () => void;
  type: 'analysis' | 'recommendations' | 'chat';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, type }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');

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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
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
                {type === 'chat' && "Click below to start chatting with your AI assistant"}
              </p>
              <button
                onClick={handleAIRequest}
                className="btn btn-primary"
              >
                {type === 'analysis' && "Analyze Projects"}
                {type === 'recommendations' && "Get Recommendations"}
                {type === 'chat' && "Start Chat"}
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
      </div>
    </div>
  );
};
