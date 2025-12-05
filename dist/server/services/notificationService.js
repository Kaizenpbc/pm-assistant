"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
class NotificationService {
    channels = new Map();
    templates = new Map();
    rules = [];
    history = [];
    emailTransporter = null;
    constructor() {
        this.initializeDefaultChannels();
        this.initializeDefaultTemplates();
        this.initializeDefaultRules();
        this.initializeEmailTransporter();
    }
    initializeDefaultChannels() {
        this.channels.set('email', {
            id: 'email',
            name: 'Email Notifications',
            type: 'email',
            enabled: true,
            config: {
                from: process.env.EMAIL_FROM || 'alerts@pm-application-v2.com',
                recipients: (process.env.EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
                smtp: {
                    host: process.env.SMTP_HOST || 'localhost',
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER || '',
                        pass: process.env.SMTP_PASS || ''
                    }
                }
            }
        });
        this.channels.set('webhook', {
            id: 'webhook',
            name: 'Webhook Notifications',
            type: 'webhook',
            enabled: !!process.env.WEBHOOK_URL,
            config: {
                url: process.env.WEBHOOK_URL || '',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': process.env.WEBHOOK_AUTH || ''
                }
            }
        });
        this.channels.set('slack', {
            id: 'slack',
            name: 'Slack Notifications',
            type: 'slack',
            enabled: !!process.env.SLACK_WEBHOOK_URL,
            config: {
                webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
                channel: process.env.SLACK_CHANNEL || '#alerts',
                username: process.env.SLACK_USERNAME || 'PM Application Bot'
            }
        });
        this.channels.set('discord', {
            id: 'discord',
            name: 'Discord Notifications',
            type: 'discord',
            enabled: !!process.env.DISCORD_WEBHOOK_URL,
            config: {
                webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
                username: process.env.DISCORD_USERNAME || 'PM Application Bot'
            }
        });
        this.channels.set('sms', {
            id: 'sms',
            name: 'SMS Notifications',
            type: 'sms',
            enabled: !!process.env.TWILIO_ACCOUNT_SID,
            config: {
                accountSid: process.env.TWILIO_ACCOUNT_SID || '',
                authToken: process.env.TWILIO_AUTH_TOKEN || '',
                fromNumber: process.env.TWILIO_FROM_NUMBER || '',
                recipients: (process.env.SMS_RECIPIENTS || '').split(',').filter(Boolean)
            }
        });
    }
    initializeDefaultTemplates() {
        this.templates.set('performance-alert', {
            id: 'performance-alert',
            name: 'Performance Alert',
            subject: '🚨 PM Application v2 - Performance Alert',
            body: `
<h2>Performance Alert - {{severity}}</h2>
<p><strong>Metric:</strong> {{metricName}}</p>
<p><strong>Current Value:</strong> {{currentValue}} {{unit}}</p>
<p><strong>Threshold:</strong> {{thresholdValue}}</p>
<p><strong>Message:</strong> {{message}}</p>
<p><strong>Time:</strong> {{timestamp}}</p>

<div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
  <h3>System Status</h3>
  <ul>
    <li><strong>Environment:</strong> {{environment}}</li>
    <li><strong>Service:</strong> {{service}}</li>
    <li><strong>Version:</strong> {{version}}</li>
  </ul>
</div>

<p style="margin-top: 20px;">
  <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    View Dashboard
  </a>
</p>
      `,
            severity: 'warning',
            channels: ['email', 'webhook']
        });
        this.templates.set('critical-alert', {
            id: 'critical-alert',
            name: 'Critical Alert',
            subject: '🚨 CRITICAL - PM Application v2 Alert',
            body: `
<h2 style="color: #dc3545;">CRITICAL ALERT</h2>
<p><strong>Metric:</strong> {{metricName}}</p>
<p><strong>Current Value:</strong> {{currentValue}} {{unit}}</p>
<p><strong>Threshold:</strong> {{thresholdValue}}</p>
<p><strong>Message:</strong> {{message}}</p>
<p><strong>Time:</strong> {{timestamp}}</p>

<div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">
  <h3 style="color: #721c24;">Immediate Action Required</h3>
  <p>This is a critical alert that requires immediate attention.</p>
</div>

<p style="margin-top: 20px;">
  <a href="{{dashboardUrl}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    View Dashboard
  </a>
</p>
      `,
            severity: 'critical',
            channels: ['email', 'webhook', 'slack', 'sms']
        });
        this.templates.set('info-alert', {
            id: 'info-alert',
            name: 'Info Alert',
            subject: 'ℹ️ PM Application v2 - Information Alert',
            body: `
<h2>Information Alert</h2>
<p><strong>Metric:</strong> {{metricName}}</p>
<p><strong>Current Value:</strong> {{currentValue}} {{unit}}</p>
<p><strong>Message:</strong> {{message}}</p>
<p><strong>Time:</strong> {{timestamp}}</p>
      `,
            severity: 'info',
            channels: ['webhook']
        });
    }
    initializeDefaultRules() {
        this.rules = [
            {
                id: 'critical-alerts',
                name: 'Critical Alerts',
                conditions: {
                    severity: ['critical']
                },
                channels: ['email', 'webhook', 'slack', 'sms'],
                enabled: true,
                cooldownMinutes: 0
            },
            {
                id: 'warning-alerts',
                name: 'Warning Alerts',
                conditions: {
                    severity: ['warning']
                },
                channels: ['email', 'webhook', 'slack'],
                enabled: true,
                cooldownMinutes: 15
            },
            {
                id: 'info-alerts',
                name: 'Info Alerts',
                conditions: {
                    severity: ['info']
                },
                channels: ['webhook'],
                enabled: true,
                cooldownMinutes: 60
            }
        ];
    }
    initializeEmailTransporter() {
        const emailChannel = this.channels.get('email');
        if (emailChannel && emailChannel.enabled && emailChannel.config.smtp) {
            this.emailTransporter = nodemailer_1.default.createTransporter(emailChannel.config.smtp);
        }
    }
    async sendNotification(alert, templateId) {
        try {
            const rule = this.findMatchingRule(alert);
            if (!rule || !rule.enabled) {
                return false;
            }
            if (this.isInCooldown(rule.id, alert.id)) {
                return false;
            }
            const template = templateId ?
                this.templates.get(templateId) :
                this.getTemplateForSeverity(alert.severity);
            if (!template) {
                console.error('No template found for alert:', alert);
                return false;
            }
            const results = await Promise.allSettled(rule.channels.map(channelId => this.sendToChannel(channelId, alert, template)));
            results.forEach((result, index) => {
                const channelId = rule.channels[index];
                const status = result.status === 'fulfilled' ? 'sent' : 'failed';
                const error = result.status === 'rejected' ? result.reason?.message : undefined;
                const response = result.status === 'fulfilled' ? result.value : undefined;
                this.recordNotificationHistory({
                    id: `notif-${Date.now()}-${index}`,
                    alertId: alert.id,
                    channelId,
                    status,
                    sentAt: new Date().toISOString(),
                    error,
                    response
                });
            });
            this.setCooldown(rule.id, alert.id, rule.cooldownMinutes);
            return results.some(result => result.status === 'fulfilled');
        }
        catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    }
    findMatchingRule(alert) {
        return this.rules.find(rule => {
            if (!rule.enabled)
                return false;
            const conditions = rule.conditions;
            if (!conditions.severity.includes(alert.severity))
                return false;
            if (conditions.metricName && conditions.metricName !== alert.metricName)
                return false;
            if (conditions.thresholdId && conditions.thresholdId !== alert.thresholdId)
                return false;
            return true;
        });
    }
    getTemplateForSeverity(severity) {
        switch (severity) {
            case 'critical':
                return this.templates.get('critical-alert');
            case 'warning':
                return this.templates.get('performance-alert');
            case 'info':
                return this.templates.get('info-alert');
            default:
                return this.templates.get('performance-alert');
        }
    }
    async sendToChannel(channelId, alert, template) {
        const channel = this.channels.get(channelId);
        if (!channel || !channel.enabled) {
            throw new Error(`Channel ${channelId} not available`);
        }
        switch (channel.type) {
            case 'email':
                return await this.sendEmail(channel, alert, template);
            case 'webhook':
                return await this.sendWebhook(channel, alert, template);
            case 'slack':
                return await this.sendSlack(channel, alert, template);
            case 'discord':
                return await this.sendDiscord(channel, alert, template);
            case 'sms':
                return await this.sendSMS(channel, alert, template);
            default:
                throw new Error(`Unsupported channel type: ${channel.type}`);
        }
    }
    async sendEmail(channel, alert, template) {
        if (!this.emailTransporter) {
            throw new Error('Email transporter not configured');
        }
        const recipients = channel.config.recipients;
        if (!recipients || recipients.length === 0) {
            throw new Error('No email recipients configured');
        }
        const subject = this.interpolateTemplate(template.subject, alert);
        const body = this.interpolateTemplate(template.body, alert);
        const mailOptions = {
            from: channel.config.from,
            to: recipients.join(', '),
            subject,
            html: body
        };
        return await this.emailTransporter.sendMail(mailOptions);
    }
    async sendWebhook(channel, alert, template) {
        const payload = {
            alert,
            template: {
                id: template.id,
                name: template.name
            },
            timestamp: new Date().toISOString(),
            source: 'pm-application-v2'
        };
        return await axios_1.default.post(channel.config.url, payload, {
            headers: channel.config.headers,
            timeout: 10000
        });
    }
    async sendSlack(channel, alert, template) {
        const color = this.getSeverityColor(alert.severity);
        const emoji = this.getSeverityEmoji(alert.severity);
        const payload = {
            channel: channel.config.channel,
            username: channel.config.username,
            attachments: [{
                    color,
                    title: `${emoji} ${template.subject}`,
                    fields: [
                        { title: 'Metric', value: alert.metricName, short: true },
                        { title: 'Current Value', value: `${alert.currentValue}`, short: true },
                        { title: 'Threshold', value: `${alert.thresholdValue}`, short: true },
                        { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
                        { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true }
                    ],
                    text: alert.message,
                    footer: 'PM Application v2',
                    ts: Math.floor(new Date().getTime() / 1000)
                }]
        };
        return await axios_1.default.post(channel.config.webhookUrl, payload, {
            timeout: 10000
        });
    }
    async sendDiscord(channel, alert, template) {
        const color = this.getSeverityColor(alert.severity);
        const emoji = this.getSeverityEmoji(alert.severity);
        const payload = {
            username: channel.config.username,
            embeds: [{
                    title: `${emoji} ${template.subject}`,
                    description: alert.message,
                    color: parseInt(color.replace('#', ''), 16),
                    fields: [
                        { name: 'Metric', value: alert.metricName, inline: true },
                        { name: 'Current Value', value: `${alert.currentValue}`, inline: true },
                        { name: 'Threshold', value: `${alert.thresholdValue}`, inline: true },
                        { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
                        { name: 'Time', value: new Date(alert.timestamp).toLocaleString(), inline: true }
                    ],
                    footer: { text: 'PM Application v2' },
                    timestamp: new Date().toISOString()
                }]
        };
        return await axios_1.default.post(channel.config.webhookUrl, payload, {
            timeout: 10000
        });
    }
    async sendSMS(channel, alert, template) {
        const message = `${alert.severity.toUpperCase()}: ${alert.message}`;
        console.log(`SMS would be sent to ${channel.config.recipients.join(', ')}: ${message}`);
        return { success: true, message: 'SMS sent (simulated)' };
    }
    interpolateTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    }
    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'info': return '#17a2b8';
            default: return '#6c757d';
        }
    }
    getSeverityEmoji(severity) {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📊';
        }
    }
    isInCooldown(ruleId, alertId) {
        const cooldownKey = `${ruleId}-${alertId}`;
        const lastSent = this.history.find(h => h.alertId === alertId && h.status === 'sent')?.sentAt;
        if (!lastSent)
            return false;
        const rule = this.rules.find(r => r.id === ruleId);
        if (!rule)
            return false;
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        return (Date.now() - new Date(lastSent).getTime()) < cooldownMs;
    }
    setCooldown(ruleId, alertId, cooldownMinutes) {
        console.log(`Setting cooldown for rule ${ruleId}, alert ${alertId}: ${cooldownMinutes} minutes`);
    }
    recordNotificationHistory(history) {
        this.history.unshift(history);
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }
    }
    getChannels() {
        return Array.from(this.channels.values());
    }
    getTemplates() {
        return Array.from(this.templates.values());
    }
    getRules() {
        return [...this.rules];
    }
    getNotificationHistory(limit = 100) {
        return this.history.slice(0, limit);
    }
    async updateChannel(channelId, updates) {
        const channel = this.channels.get(channelId);
        if (!channel)
            return false;
        this.channels.set(channelId, { ...channel, ...updates });
        if (channelId === 'email') {
            this.initializeEmailTransporter();
        }
        return true;
    }
    async addRule(rule) {
        const newRule = {
            ...rule,
            id: `rule-${Date.now()}`
        };
        this.rules.push(newRule);
        return newRule.id;
    }
    async updateRule(ruleId, updates) {
        const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1)
            return false;
        this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
        return true;
    }
    async deleteRule(ruleId) {
        const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1)
            return false;
        this.rules.splice(ruleIndex, 1);
        return true;
    }
    getNotificationStats() {
        const total = this.history.length;
        const sent = this.history.filter(h => h.status === 'sent').length;
        const failed = this.history.filter(h => h.status === 'failed').length;
        const pending = this.history.filter(h => h.status === 'pending').length;
        return {
            total,
            sent,
            failed,
            pending,
            successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
            channelsCount: this.channels.size,
            templatesCount: this.templates.size,
            rulesCount: this.rules.length
        };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map