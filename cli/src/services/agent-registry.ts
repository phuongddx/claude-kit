/**
 * Agent registry for ClaudeKit.
 * Discovers and manages all available agents.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { AgentCapability, AgentMessage, AgentHandle } from '../types/index.js';

/**
 * Agent registry configuration.
 */
export interface AgentRegistryConfig {
  /** Kit template path */
  kitPath: string;
  /** Project root path (optional) */
  projectRoot?: string;
}

/**
 * Discovered agent with metadata.
 */
export interface DiscoveredAgent {
  /** Agent name (filename without extension) */
  name: string;
  /** Path to agent markdown file */
  path: string;
  /** Display name from frontmatter */
  displayName?: string;
  /** Description from frontmatter */
  description?: string;
  /** Color for UI display */
  color?: string;
  /** Preferred model tier */
  model?: string;
  /** Agent capabilities */
  capabilities: AgentCapability[];
  /** Current status */
  status: 'idle' | 'busy' | 'error';
}

/**
 * Agent registry for discovering and managing agents.
 */
export class AgentRegistry {
  private config: AgentRegistryConfig;
  private agents: Map<string, DiscoveredAgent> = new Map();
  private handles: Map<string, AgentHandle> = new Map();

  constructor(config: AgentRegistryConfig) {
    this.config = config;
    this.discoverAgents();
  }

  /**
   * Discover all agents from the kit.
   */
  private discoverAgents(): void {
    const agentDirs: string[] = [
      path.join(this.config.kitPath, '.claude', 'agents'),
    ];

    if (this.config.projectRoot) {
      agentDirs.push(path.join(this.config.projectRoot, '.claude', 'agents'));
    }

    for (const agentDir of agentDirs) {
      if (!fs.existsSync(agentDir)) continue;

      const entries = fs.readdirSync(agentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const agentPath = path.join(agentDir, entry.name);
          const agent = this.parseAgentFile(agentPath);
          if (agent) {
            this.agents.set(agent.name, agent);
          }
        }
      }
    }
  }

  /**
   * Parse an agent file and extract metadata.
   */
  private parseAgentFile(filePath: string): DiscoveredAgent | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const name = path.basename(filePath, '.md');

      // Extract frontmatter
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
      const match = content.match(frontmatterRegex);

      let displayName: string | undefined;
      let description: string | undefined;
      let color: string | undefined;
      let model: string | undefined;

      if (match) {
        const yamlContent = match[1];
        for (const line of yamlContent.split('\n')) {
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) continue;

          const key = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trim();

          switch (key) {
            case 'name':
            case 'title':
              displayName = value.replace(/['"]/g, '');
              break;
            case 'description':
              description = value.replace(/['"]/g, '');
              break;
            case 'color':
              color = value.replace(/['"]/g, '');
              break;
            case 'model':
              model = value.replace(/['"]/g, '');
              break;
          }
        }
      }

      return {
        name,
        path: filePath,
        displayName,
        description,
        color,
        model,
        capabilities: [], // Would be extracted from content
        status: 'idle',
      };
    } catch {
      return null;
    }
  }

  /**
   * Get an agent by name.
   */
  getAgent(name: string): DiscoveredAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all agents.
   */
  getAllAgents(): DiscoveredAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Spawn an agent instance.
   */
  spawnAgent(agentType: string, context: Record<string, unknown>): AgentHandle {
    const agent = this.getAgent(agentType);
    if (!agent) {
      throw new Error(`Agent not found: ${agentType}`);
    }

    const handle: AgentHandle = {
      id: `${agentType}-${Date.now()}`,
      type: agentType,
      status: 'busy',
    };

    this.handles.set(handle.id, handle);
    agent.status = 'busy';

    return handle;
  }

  /**
   * Complete an agent's work.
   */
  completeAgent(handleId: string, success: boolean = true): void {
    const handle = this.handles.get(handleId);
    if (!handle) return;

    const agent = this.getAgent(handle.type);
    if (agent) {
      agent.status = success ? 'idle' : 'error';
    }

    handle.status = success ? 'idle' : 'error';
  }

  /**
   * Get all active agent handles.
   */
  getActiveHandles(): AgentHandle[] {
    return Array.from(this.handles.values()).filter((h) => h.status === 'busy');
  }

  /**
   * Send a message to an agent.
   */
  async sendMessage(message: AgentMessage): Promise<AgentMessage> {
    const agent = this.getAgent(message.to);
    if (!agent) {
      throw new Error(`Agent not found: ${message.to}`);
    }

    // In a real implementation, this would invoke the agent
    // For now, return a mock response
    const response: AgentMessage = {
      from: message.to,
      to: message.from,
      type: 'response',
      payload: { status: 'received' },
      timestamp: new Date().toISOString(),
      id: `msg-${Date.now()}`,
    };

    return response;
  }

  /**
   * Execute multiple agents in parallel.
   */
  async parallelExecute(agentTypes: string[]): Promise<Map<string, unknown>> {
    const results = new Map<string, unknown>();

    // In a real implementation, this would spawn agents in parallel
    // For now, just return empty results
    for (const type of agentTypes) {
      results.set(type, { status: 'pending' });
    }

    return results;
  }

  /**
   * Get agents by capability.
   */
  getAgentsByCapability(capability: string): DiscoveredAgent[] {
    return this.getAllAgents().filter((agent) =>
      agent.capabilities.some((cap) => cap.name === capability)
    );
  }

  /**
   * Reload agent definitions.
   */
  reload(): void {
    this.agents.clear();
    this.discoverAgents();
  }
}

/**
 * Create an agent registry for the given paths.
 */
export function createAgentRegistry(config: AgentRegistryConfig): AgentRegistry {
  return new AgentRegistry(config);
}
