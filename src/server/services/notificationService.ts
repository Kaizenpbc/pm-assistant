import nodemailer from 'nodemailer';
import axios from 'axios';

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

class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private rules: NotificationRule[] = [];
  private history: NotificationHistory[] = [];
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultTemplates();
    this.initializeDefaultRules();
    this.initializeEmailTransporter();
  }

  private initializeDefaultChannels() {
    // Email channel
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

    // Webhook channel
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

    // Slack channel
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

    // Discord channel
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

    // SMS channel (using Twilio as example)
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

  private initializeDefaultTemplates() {
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

  private initializeDefaultRules() {
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

  private initializeEmailTransporter() {
    const emailChannel = this.channels.get('email');
    if (emailChannel && emailChannel.enabled && emailChannel.config.smtp) {
      this.emailTransporter = nodemailer.createTransport(emailChannel.config.smtp);
    }
  }

  async sendNotification(alert: any, templateId?: string): Promise<boolean> {
    try {
      // Find matching rule
      const rule = this.findMatchingRule(alert);
      if (!rule || !rule.enabled) {
        return false;
      }

      // Check cooldown
      if (this.isInCooldown(rule.id, alert.id)) {
        return false;
      }

      // Get template
      const template = templateId ? 
        this.templates.get(templateId) : 
        this.getTemplateForSeverity(alert.severity);

      if (!template) {
        console.error('No template found for alert:', alert);
        return false;
      }

      // Send to each channel
      const results = await Promise.allSettled(
        rule.channels.map(channelId => this.sendToChannel(channelId, alert, template))
      );

      // Record history
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

      // Set cooldown
      this.setCooldown(rule.id, alert.id, rule.cooldownMinutes);

      return results.some(result => result.status === 'fulfilled');
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  private findMatchingRule(alert: any): NotificationRule | undefined {
    return this.rules.find(rule => {
      if (!rule.enabled) return false;
      
      const conditions = rule.conditions;
      
      // Check severity
      if (!conditions.severity.includes(alert.severity)) return false;
      
      // Check metric name if specified
      if (conditions.metricName && conditions.metricName !== alert.metricName) return false;
      
      // Check threshold ID if specified
      if (conditions.thresholdId && conditions.thresholdId !== alert.thresholdId) return false;
      
      return true;
    });
  }

  private getTemplateForSeverity(severity: string): NotificationTemplate | undefined {
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

  private async sendToChannel(channelId: string, alert: any, template: NotificationTemplate): Promise<any> {
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

  private async sendEmail(channel: NotificationChannel, alert: any, template: NotificationTemplate): Promise<any> {
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

  private async sendWebhook(channel: NotificationChannel, alert: any, template: NotificationTemplate): Promise<any> {
    const payload = {
      alert,
      template: {
        id: template.id,
        name: template.name
      },
      timestamp: new Date().toISOString(),
      source: 'pm-application-v2'
    };

    return await axios.post(channel.config.url, payload, {
      headers: channel.config.headers,
      timeout: 10000
    });
  }

  private async sendSlack(channel: NotificationChannel, alert: any, template: NotificationTemplate): Promise<any> {
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

    return await axios.post(channel.config.webhookUrl, payload, {
      timeout: 10000
    });
  }

  private async sendDiscord(channel: NotificationChannel, alert: any, template: NotificationTemplate): Promise<any> {
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

    return await axios.post(channel.config.webhookUrl, payload, {
      timeout: 10000
    });
  }

  private async sendSMS(channel: NotificationChannel, alert: any, template: NotificationTemplate): Promise<any> {
    // This would integrate with Twilio or another SMS provider
    // For now, we'll simulate it
    const message = `${alert.severity.toUpperCase()}: ${alert.message}`;
    
    console.log(`SMS would be sent to ${channel.config.recipients.join(', ')}: ${message}`);
    
    return { success: true, message: 'SMS sent (simulated)' };
  }

  private interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  }

  private isInCooldown(ruleId: string, alertId: string): boolean {
    const cooldownKey = `${ruleId}-${alertId}`;
    const lastSent = this.history.find(h => 
      h.alertId === alertId && h.status === 'sent'
    )?.sentAt;

    if (!lastSent) return false;

    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) return false;

    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    return (Date.now() - new Date(lastSent).getTime()) < cooldownMs;
  }

  private setCooldown(ruleId: string, alertId: string, cooldownMinutes: number): void {
    // This would be implemented with a proper cooldown storage mechanism
    console.log(`Setting cooldown for rule ${ruleId}, alert ${alertId}: ${cooldownMinutes} minutes`);
  }

  private recordNotificationHistory(history: NotificationHistory): void {
    this.history.unshift(history);
    
    // Keep only last 1000 notifications
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000);
    }
  }

  // Public API methods
  getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  getRules(): NotificationRule[] {
    return [...this.rules];
  }

  getNotificationHistory(limit = 100): NotificationHistory[] {
    return this.history.slice(0, limit);
  }

  async updateChannel(channelId: string, updates: Partial<NotificationChannel>): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    this.channels.set(channelId, { ...channel, ...updates });
    
    // Reinitialize email transporter if email channel was updated
    if (channelId === 'email') {
      this.initializeEmailTransporter();
    }
    
    return true;
  }

  async addRule(rule: Omit<NotificationRule, 'id'>): Promise<string> {
    const newRule: NotificationRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    
    this.rules.push(newRule);
    return newRule.id;
  }

  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<boolean> {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return false;

    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    return true;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return false;

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

export { NotificationService, NotificationChannel, NotificationTemplate, NotificationRule, NotificationHistory };
