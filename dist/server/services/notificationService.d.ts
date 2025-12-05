interface NotificationChannel {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'webhook' | 'slack' | 'discord' | 'teams';
    enabled: boolean;
    config: Record<string, any>;
}
interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    severity: 'info' | 'warning' | 'critical';
    channels: string[];
}
interface NotificationRule {
    id: string;
    name: string;
    conditions: {
        severity: string[];
        metricName?: string;
        thresholdId?: string;
    };
    channels: string[];
    enabled: boolean;
    cooldownMinutes: number;
}
interface NotificationHistory {
    id: string;
    alertId: string;
    channelId: string;
    status: 'sent' | 'failed' | 'pending';
    sentAt: string;
    error?: string;
    response?: any;
}
declare class NotificationService {
    private channels;
    private templates;
    private rules;
    private history;
    private emailTransporter;
    constructor();
    private initializeDefaultChannels;
    private initializeDefaultTemplates;
    private initializeDefaultRules;
    private initializeEmailTransporter;
    sendNotification(alert: any, templateId?: string): Promise<boolean>;
    private findMatchingRule;
    private getTemplateForSeverity;
    private sendToChannel;
    private sendEmail;
    private sendWebhook;
    private sendSlack;
    private sendDiscord;
    private sendSMS;
    private interpolateTemplate;
    private getSeverityColor;
    private getSeverityEmoji;
    private isInCooldown;
    private setCooldown;
    private recordNotificationHistory;
    getChannels(): NotificationChannel[];
    getTemplates(): NotificationTemplate[];
    getRules(): NotificationRule[];
    getNotificationHistory(limit?: number): NotificationHistory[];
    updateChannel(channelId: string, updates: Partial<NotificationChannel>): Promise<boolean>;
    addRule(rule: Omit<NotificationRule, 'id'>): Promise<string>;
    updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<boolean>;
    deleteRule(ruleId: string): Promise<boolean>;
    getNotificationStats(): {
        total: number;
        sent: number;
        failed: number;
        pending: number;
        successRate: number;
        channelsCount: number;
        templatesCount: number;
        rulesCount: number;
    };
}
export { NotificationService, NotificationChannel, NotificationTemplate, NotificationRule, NotificationHistory };
//# sourceMappingURL=notificationService.d.ts.map