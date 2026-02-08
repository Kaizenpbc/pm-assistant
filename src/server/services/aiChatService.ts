import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { claudeService, promptTemplates, type StreamChunk, type CompletionResult } from './claudeService';
import { AIContextBuilder } from './aiContextBuilder';
import { logAIUsage } from './aiUsageLogger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    type: 'dashboard' | 'project' | 'schedule' | 'region' | 'reports' | 'general';
    projectId?: string;
    regionId?: string;
  };
  userId: string;
  userRole: string;
}

interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// AIChatService
// ---------------------------------------------------------------------------

export class AIChatService {
  private fastify: FastifyInstance;
  private contextBuilder: AIContextBuilder;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.contextBuilder = new AIContextBuilder(fastify);
  }

  // -----------------------------------------------------------------------
  // Non-streaming chat
  // -----------------------------------------------------------------------

  async sendMessage(req: ChatRequest): Promise<{
    reply: string;
    conversationId: string;
    aiPowered: boolean;
  }> {
    if (!claudeService.isAvailable()) {
      return {
        reply:
          'AI features are currently disabled. Please check that the ANTHROPIC_API_KEY is configured and AI_ENABLED is set to true.',
        conversationId: req.conversationId || randomUUID(),
        aiPowered: false,
      };
    }

    const { systemPrompt, history } = await this.prepareConversation(req);

    try {
      const result: CompletionResult = await claudeService.complete({
        systemPrompt,
        userMessage: req.message,
        conversationHistory: history,
        temperature: 0.5,
      });

      const conversationId = await this.persistConversation(req, result.content, result.usage.inputTokens + result.usage.outputTokens);

      logAIUsage(this.fastify, {
        userId: req.userId,
        feature: 'chat',
        model: 'claude',
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
        requestContext: { conversationId, contextType: req.context?.type },
      });

      return { reply: result.content, conversationId, aiPowered: true };
    } catch (error) {
      this.fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Chat completion failed');

      logAIUsage(this.fastify, {
        userId: req.userId,
        feature: 'chat',
        model: 'claude',
        usage: { inputTokens: 0, outputTokens: 0 },
        latencyMs: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      return {
        reply: 'I encountered an error processing your request. Please try again in a moment.',
        conversationId: req.conversationId || randomUUID(),
        aiPowered: false,
      };
    }
  }

  // -----------------------------------------------------------------------
  // Streaming chat — returns an async generator of StreamChunk + metadata
  // -----------------------------------------------------------------------

  async *streamMessage(req: ChatRequest): AsyncGenerator<
    StreamChunk & { conversationId?: string }
  > {
    if (!claudeService.isAvailable()) {
      yield {
        type: 'text_delta' as const,
        content:
          'AI features are currently disabled. Please check that the ANTHROPIC_API_KEY is configured and AI_ENABLED is set to true.',
      };
      yield { type: 'done' as const, conversationId: req.conversationId || randomUUID() };
      return;
    }

    const { systemPrompt, history } = await this.prepareConversation(req);

    let fullReply = '';
    let conversationId = req.conversationId || randomUUID();

    try {
      const stream = claudeService.stream({
        systemPrompt,
        userMessage: req.message,
        conversationHistory: history,
        temperature: 0.5,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'text_delta') {
          fullReply += chunk.content ?? '';
          yield chunk;
        } else if (chunk.type === 'usage') {
          // Persist conversation and log usage when we get the final usage stats
          conversationId = await this.persistConversation(
            req,
            fullReply,
            (chunk.usage?.inputTokens ?? 0) + (chunk.usage?.outputTokens ?? 0),
          );

          logAIUsage(this.fastify, {
            userId: req.userId,
            feature: 'chat-stream',
            model: 'claude',
            usage: chunk.usage!,
            latencyMs: 0,
            success: true,
            requestContext: { conversationId, contextType: req.context?.type },
          });

          yield chunk;
        } else if (chunk.type === 'done') {
          yield { ...chunk, conversationId };
        }
      }
    } catch (error) {
      this.fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Chat stream failed');

      logAIUsage(this.fastify, {
        userId: req.userId,
        feature: 'chat-stream',
        model: 'claude',
        usage: { inputTokens: 0, outputTokens: 0 },
        latencyMs: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      yield {
        type: 'text_delta' as const,
        content: '\n\n[An error occurred while generating the response. Please try again.]',
      };
      yield { type: 'done' as const, conversationId };
    }
  }

  // -----------------------------------------------------------------------
  // Conversation CRUD
  // -----------------------------------------------------------------------

  async getConversations(userId: string): Promise<any[]> {
    const db = (this.fastify as any).mysql || (this.fastify as any).db;
    if (!db) return [];

    const [rows]: any = await db.query(
      `SELECT id, title, context_type, project_id, token_count, created_at, updated_at
       FROM ai_conversations
       WHERE user_id = ? AND is_active = TRUE
       ORDER BY updated_at DESC
       LIMIT 50`,
      [userId],
    );
    return rows;
  }

  async getConversation(conversationId: string, userId: string): Promise<any | null> {
    const db = (this.fastify as any).mysql || (this.fastify as any).db;
    if (!db) return null;

    const [rows]: any = await db.query(
      `SELECT id, title, context_type, project_id, messages, token_count, created_at, updated_at
       FROM ai_conversations
       WHERE id = ? AND user_id = ? AND is_active = TRUE`,
      [conversationId, userId],
    );

    if (!rows[0]) return null;

    const row = rows[0];
    return {
      ...row,
      messages: typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages,
    };
  }

  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const db = (this.fastify as any).mysql || (this.fastify as any).db;
    if (!db) return false;

    const [result]: any = await db.query(
      `UPDATE ai_conversations SET is_active = FALSE WHERE id = ? AND user_id = ?`,
      [conversationId, userId],
    );
    return result.affectedRows > 0;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private async prepareConversation(req: ChatRequest): Promise<{
    systemPrompt: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
  }> {
    // Build project/portfolio context
    let projectContext = 'No specific project context.';
    if (req.context?.projectId) {
      try {
        const ctx = await this.contextBuilder.buildProjectContext(req.context.projectId);
        projectContext = this.contextBuilder.toPromptString(ctx);
      } catch {
        projectContext = `Project ID: ${req.context.projectId} (context unavailable)`;
      }
    } else if (req.context?.type === 'dashboard' || req.context?.type === 'reports') {
      try {
        const ctx = await this.contextBuilder.buildPortfolioContext(req.context.regionId);
        projectContext = this.contextBuilder.portfolioToPromptString(ctx);
      } catch {
        projectContext = 'Portfolio context unavailable.';
      }
    }

    const systemPrompt = promptTemplates.conversational.render({
      projectContext,
      userRole: req.userRole || 'user',
    });

    // Load existing conversation history
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (req.conversationId) {
      const conv = await this.getConversation(req.conversationId, req.userId);
      if (conv?.messages) {
        const stored: StoredMessage[] = conv.messages;
        // Limit history to last 20 messages to stay within context window
        history = stored.slice(-20).map(m => ({ role: m.role, content: m.content }));
      }
    }

    return { systemPrompt, history };
  }

  private async persistConversation(
    req: ChatRequest,
    assistantReply: string,
    tokenCount: number,
  ): Promise<string> {
    const db = (this.fastify as any).mysql || (this.fastify as any).db;
    if (!db) return req.conversationId || randomUUID();

    const now = new Date().toISOString();
    const userMsg: StoredMessage = { role: 'user', content: req.message, timestamp: now };
    const assistantMsg: StoredMessage = { role: 'assistant', content: assistantReply, timestamp: now };

    if (req.conversationId) {
      // Append to existing conversation
      try {
        const [rows]: any = await db.query(
          `SELECT messages, token_count FROM ai_conversations WHERE id = ? AND user_id = ?`,
          [req.conversationId, req.userId],
        );

        if (rows[0]) {
          const existing: StoredMessage[] =
            typeof rows[0].messages === 'string' ? JSON.parse(rows[0].messages) : rows[0].messages;
          existing.push(userMsg, assistantMsg);
          const newTokenCount = (rows[0].token_count || 0) + tokenCount;

          await db.query(
            `UPDATE ai_conversations SET messages = ?, token_count = ? WHERE id = ? AND user_id = ?`,
            [JSON.stringify(existing), newTokenCount, req.conversationId, req.userId],
          );
          return req.conversationId;
        }
      } catch (err) {
        this.fastify.log.warn({ err }, 'Failed to update conversation');
      }
    }

    // Create new conversation
    const id = randomUUID();
    const title = req.message.slice(0, 100) + (req.message.length > 100 ? '...' : '');
    const messages = [userMsg, assistantMsg];

    try {
      await db.query(
        `INSERT INTO ai_conversations (id, user_id, project_id, context_type, title, messages, token_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          req.userId,
          req.context?.projectId || null,
          req.context?.type || 'system',
          title,
          JSON.stringify(messages),
          tokenCount,
        ],
      );
    } catch (err) {
      this.fastify.log.warn({ err }, 'Failed to create conversation (non-critical)');
    }

    return id;
  }
}
