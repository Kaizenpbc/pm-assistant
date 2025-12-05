import React from 'react';
interface AIAssistantProps {
    onClose: () => void;
    type: 'analysis' | 'recommendations' | 'chat';
    projectId?: number;
    projectName?: string;
}
export declare const AIAssistant: React.FC<AIAssistantProps>;
export {};
//# sourceMappingURL=AIAssistant.d.ts.map