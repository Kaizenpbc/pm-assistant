import { describe, it, expect, vi, beforeAll } from 'vitest';

// ---------------------------------------------------------------------------
// Mock the config module BEFORE any service module imports it.
// The real config.ts calls validateConfiguration() at module scope which
// requires env vars (JWT_SECRET, etc.) that are not available in unit tests.
// ---------------------------------------------------------------------------
vi.mock('../../../src/server/config', () => ({
  config: {
    NODE_ENV: 'test',
    PORT: 3001,
    HOST: 'localhost',
    ANTHROPIC_API_KEY: undefined, // No API key in tests
    AI_MODEL: 'claude-sonnet-4-5-20250929',
    AI_MAX_TOKENS: 4096,
    AI_TEMPERATURE: 0.3,
    AI_ENABLED: false, // Disabled in tests
    WEATHER_API_PROVIDER: 'mock',
    WEATHER_API_KEY: undefined,
    WEATHER_CACHE_MINUTES: 60,
  },
}));

// Mock the Anthropic SDK so we don't need the actual package to resolve
vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    constructor() {}
    messages = { create: vi.fn(), stream: vi.fn() };
  }
  // Add static error classes
  (MockAnthropic as any).APIError = class extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  };
  (MockAnthropic as any).APIConnectionError = class extends Error {};
  (MockAnthropic as any).APIConnectionTimeoutError = class extends Error {};
  return { default: MockAnthropic };
});

// Now import the service modules -- they will use the mocked config
import {
  PromptTemplate,
  promptTemplates,
  claudeService,
  ClaudeService,
} from '../../../src/server/services/claudeService';

// =============================================================================
// PromptTemplate
// =============================================================================

describe('PromptTemplate', () => {
  it('renders a template by replacing {{variable}} placeholders', () => {
    const template = new PromptTemplate(
      'Hello {{name}}, your project is {{status}}.',
      '1.0.0',
    );
    const result = template.render({ name: 'Alice', status: 'on track' });
    expect(result).toBe('Hello Alice, your project is on track.');
  });

  it('replaces multiple occurrences of the same variable', () => {
    const template = new PromptTemplate(
      '{{item}} is great. I love {{item}}.',
      '1.0.0',
    );
    const result = template.render({ item: 'TypeScript' });
    expect(result).toBe('TypeScript is great. I love TypeScript.');
  });

  it('handles multiple different variables', () => {
    const template = new PromptTemplate(
      'Project: {{projectName}}\nStatus: {{projectStatus}}\nRegion: {{region}}',
      '2.0.0',
    );
    const result = template.render({
      projectName: 'Bridge Repair',
      projectStatus: 'In Progress',
      region: 'Demerara-Mahaica',
    });
    expect(result).toContain('Project: Bridge Repair');
    expect(result).toContain('Status: In Progress');
    expect(result).toContain('Region: Demerara-Mahaica');
  });

  it('leaves unreferenced placeholders intact', () => {
    const template = new PromptTemplate(
      'Hello {{name}}, your role is {{role}}.',
      '1.0.0',
    );
    const result = template.render({ name: 'Bob' });
    expect(result).toBe('Hello Bob, your role is {{role}}.');
  });

  it('getVersion() returns the version string', () => {
    const template = new PromptTemplate('template text', '3.1.4');
    expect(template.getVersion()).toBe('3.1.4');
  });
});

// =============================================================================
// promptTemplates registry
// =============================================================================

describe('promptTemplates', () => {
  it('has a taskBreakdown template', () => {
    expect(promptTemplates.taskBreakdown).toBeInstanceOf(PromptTemplate);
  });

  it('has a riskAssessment template', () => {
    expect(promptTemplates.riskAssessment).toBeInstanceOf(PromptTemplate);
  });

  it('has a projectInsights template', () => {
    expect(promptTemplates.projectInsights).toBeInstanceOf(PromptTemplate);
  });

  it('has a conversational template', () => {
    expect(promptTemplates.conversational).toBeInstanceOf(PromptTemplate);
  });

  it('contains exactly 4 templates', () => {
    const keys = Object.keys(promptTemplates);
    expect(keys).toHaveLength(4);
    expect(keys).toEqual(
      expect.arrayContaining([
        'taskBreakdown',
        'riskAssessment',
        'projectInsights',
        'conversational',
      ]),
    );
  });

  it('all templates have version 1.0.0', () => {
    for (const [, template] of Object.entries(promptTemplates)) {
      expect(template.getVersion()).toBe('1.0.0');
    }
  });

  it('taskBreakdown template renders with projectDescription variable', () => {
    const rendered = promptTemplates.taskBreakdown.render({
      projectDescription: 'Build a new bridge over the Demerara River',
      additionalContext: 'Budget: $5M',
    });
    expect(rendered).toContain('Build a new bridge over the Demerara River');
    expect(rendered).toContain('Budget: $5M');
  });

  it('conversational template renders with projectContext and userRole', () => {
    const rendered = promptTemplates.conversational.render({
      projectContext: 'Road rehabilitation project',
      userRole: 'Project Manager',
    });
    expect(rendered).toContain('Road rehabilitation project');
    expect(rendered).toContain('Project Manager');
  });
});

// =============================================================================
// ClaudeService singleton
// =============================================================================

describe('claudeService', () => {
  it('isAvailable() returns false when no API key is configured', () => {
    // Config has AI_ENABLED: false and ANTHROPIC_API_KEY: undefined
    expect(claudeService.isAvailable()).toBe(false);
  });

  it('getUsageStats() returns zero counts initially', () => {
    const stats = claudeService.getUsageStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.totalInputTokens).toBe(0);
    expect(stats.totalOutputTokens).toBe(0);
    expect(stats.estimatedCost).toBe(0);
  });

  it('getUsageStats() returns a copy, not a reference to internal state', () => {
    const stats1 = claudeService.getUsageStats();
    const stats2 = claudeService.getUsageStats();
    expect(stats1).toEqual(stats2);
    expect(stats1).not.toBe(stats2); // different object references
  });
});

// =============================================================================
// ClaudeService class (fresh instances)
// =============================================================================

describe('ClaudeService class', () => {
  it('can be instantiated', () => {
    const service = new ClaudeService();
    expect(service).toBeDefined();
  });

  it('new instance is unavailable without API key', () => {
    const service = new ClaudeService();
    expect(service.isAvailable()).toBe(false);
  });

  it('new instance has zeroed usage stats', () => {
    const service = new ClaudeService();
    const stats = service.getUsageStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.totalInputTokens).toBe(0);
    expect(stats.totalOutputTokens).toBe(0);
    expect(stats.estimatedCost).toBe(0);
  });
});
