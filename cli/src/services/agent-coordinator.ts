/**
 * Agent coordinator for orchestrating multi-agent workflows.
 * Manages communication between agents and coordinates execution.
 */

import type {
  AgentMessage,
  AgentMessage as MessageType,
  AgentHandle,
  AgentResult,
} from '../types/index.js';
import type { DiscoveredAgent } from './agent-registry.js';

/**
 * Coordinator configuration.
 */
export interface CoordinatorConfig {
  /** Maximum concurrent agents */
  maxConcurrent?: number;
  /** Message timeout in ms */
  messageTimeout?: number;
  /** Enable message logging */
  enableLogging?: boolean;
}

/**
 * Message handler callback.
 */
type MessageHandler = (message: AgentMessage) => Promise<AgentMessage>;

/**
 * Agent coordinator for multi-agent orchestration.
 */
export class AgentCoordinator {
  private config: Required<CoordinatorConfig>;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private messageQueue: AgentMessage[] = [];
  private messageHistory: AgentMessage[] = [];

  constructor(config: CoordinatorConfig = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 5,
      messageTimeout: config.messageTimeout ?? 30000,
      enableLogging: config.enableLogging ?? false,
    };
  }

  /**
   * Register a message handler for an agent type.
   */
  registerHandler(agentType: string, handler: MessageHandler): void {
    this.messageHandlers.set(agentType, handler);
  }

  /**
   * Spawn an agent and return its handle.
   */
  spawnAgent(agentType: string, context: Record<string, unknown>): AgentHandle {
    const handle: AgentHandle = {
      id: `${agentType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: agentType,
      status: 'busy',
    };

    if (this.config.enableLogging) {
      this.logMessage({
        from: 'coordinator',
        to: agentType,
        type: 'notification',
        payload: { action: 'spawn', context, handleId: handle.id },
        timestamp: new Date().toISOString(),
        id: `spawn-${handle.id}`,
      });
    }

    return handle;
  }

  /**
   * Send a message between agents.
   */
  async sendMessage(message: AgentMessage): Promise<AgentMessage> {
    // Add to history
    this.messageHistory.push(message);

    if (this.config.enableLogging) {
      this.logMessage(message);
    }

    // Get handler for recipient
    const handler = this.messageHandlers.get(message.to);
    if (!handler) {
      // Return error response
      return {
        from: message.to,
        to: message.from,
        type: 'response',
        payload: { error: `No handler registered for agent: ${message.to}` },
        timestamp: new Date().toISOString(),
        id: `error-${Date.now()}`,
      };
    }

    // Execute handler with timeout
    try {
      const response = await this.withTimeout(
        handler(message),
        this.config.messageTimeout
      );
      this.messageHistory.push(response);
      return response;
    } catch (error) {
      return {
        from: message.to,
        to: message.from,
        type: 'response',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        id: `timeout-${Date.now()}`,
      };
    }
  }

  /**
   * Execute multiple agents in parallel.
   */
  async parallelExecute(agentTypes: string[], context?: Record<string, unknown>): Promise<AgentResult[]> {
    const maxConcurrent = this.config.maxConcurrent;
    const results: AgentResult[] = [];

    // Process in batches
    for (let i = 0; i < agentTypes.length; i += maxConcurrent) {
      const batch = agentTypes.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(async (agentType) => {
          try {
            const handle = this.spawnAgent(agentType, context || {});
            // Send initial message to start work
            const startMessage: AgentMessage = {
              from: 'coordinator',
              to: agentType,
              type: 'request',
              payload: context || {},
              timestamp: new Date().toISOString(),
              id: `start-${handle.id}`,
            };

            const response = await this.sendMessage(startMessage);

            return {
              agentId: handle.id,
              success: !response.payload || typeof response.payload !== 'object' ||
                !('error' in response.payload),
              output: response.payload,
            };
          } catch (error) {
            return {
              agentId: agentType,
              success: false,
              output: {},
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Execute agents in sequence (pipeline).
   */
  async sequentialExecute(agentTypes: string[], context?: Record<string, unknown>): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    let currentContext = context || {};

    for (const agentType of agentTypes) {
      try {
        const handle = this.spawnAgent(agentType, currentContext);
        const message: AgentMessage = {
          from: 'coordinator',
          to: agentType,
          type: 'request',
          payload: currentContext,
          timestamp: new Date().toISOString(),
          id: `seq-${handle.id}`,
        };

        const response = await this.sendMessage(message);

        results.push({
          agentId: handle.id,
          success: !response.payload || typeof response.payload !== 'object' ||
            !('error' in response.payload),
          output: response.payload,
        });

        // Pass output to next agent
        currentContext = {
          ...currentContext,
          [`${agentType}Output`]: response.payload,
        };
      } catch (error) {
        results.push({
          agentId: agentType,
          success: false,
          output: currentContext,
          error: error instanceof Error ? error.message : String(error),
        });
        break; // Stop on error
      }
    }

    return results;
  }

  /**
   * Get message history.
   */
  getMessageHistory(): AgentMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Get messages for a specific agent.
   */
  getMessagesForAgent(agentType: string): AgentMessage[] {
    return this.messageHistory.filter(
      (m) => m.from === agentType || m.to === agentType
    );
  }

  /**
   * Clear message history.
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Wrap a promise with timeout.
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Log a message (when enabled).
   */
  private logMessage(message: AgentMessage): void {
    console.log(`[${message.timestamp}] ${message.from} -> ${message.to}: ${message.type}`);
  }

  /**
   * Get statistics about message flow.
   */
  getStats(): {
    totalMessages: number;
    messagesByType: Record<string, number>;
    messagesByAgent: Record<string, number>;
  } {
    const messagesByType: Record<string, number> = {};
    const messagesByAgent: Record<string, number> = {};

    for (const message of this.messageHistory) {
      messagesByType[message.type] = (messagesByType[message.type] || 0) + 1;
      messagesByAgent[message.from] = (messagesByAgent[message.from] || 0) + 1;
      messagesByAgent[message.to] = (messagesByAgent[message.to] || 0) + 1;
    }

    return {
      totalMessages: this.messageHistory.length,
      messagesByType,
      messagesByAgent,
    };
  }
}

/**
 * Create an agent coordinator.
 */
export function createAgentCoordinator(config?: CoordinatorConfig): AgentCoordinator {
  return new AgentCoordinator(config);
}
