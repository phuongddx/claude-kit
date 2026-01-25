/**
 * Base error class for all ClaudeKit errors.
 * Provides structured error information for better handling and reporting.
 */
export class ClaudeKitError extends Error {
  /** Error code for programmatic handling */
  code: string;

  /** Additional context about the error */
  context: Record<string, unknown>;

  /** Whether the error is recoverable */
  recoverable: boolean;

  /** Suggestions for resolving the error */
  suggestions: string[];

  constructor(
    message: string,
    code: string,
    context: Record<string, unknown> = {},
    recoverable: boolean = false,
    suggestions: string[] = []
  ) {
    super(message);
    this.name = 'ClaudeKitError';
    this.code = code;
    this.context = context;
    this.recoverable = recoverable;
    this.suggestions = suggestions;

    // Maintains proper stack trace
    Error.captureStackTrace?.(this, ClaudeKitError);
  }

  /** Format error for user display */
  format(): string {
    let output = `\x1b[31mError [${this.code}]:\x1b[0m ${this.message}\n`;

    if (Object.keys(this.context).length > 0) {
      output += '\n\x1b[90mContext:\x1b[0m';
      for (const [key, value] of Object.entries(this.context)) {
        output += `\n  ${key}: ${JSON.stringify(value)}`;
      }
      output += '\n';
    }

    if (this.suggestions.length > 0) {
      output += '\n\x1b[36mSuggestions:\x1b[0m';
      for (const suggestion of this.suggestions) {
        output += `\n  • ${suggestion}`;
      }
      output += '\n';
    }

    return output;
  }

  /** Convert to plain object for logging */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      recoverable: this.recoverable,
      suggestions: this.suggestions,
      stack: this.stack,
    };
  }
}

/**
 * Create a ClaudeKitError from an unknown error.
 * Useful for wrapping errors from external dependencies.
 */
export function wrapError(
  error: unknown,
  defaultCode: string,
  defaultMessage: string
): ClaudeKitError {
  if (error instanceof ClaudeKitError) {
    return error;
  }

  if (error instanceof Error) {
    return new ClaudeKitError(
      error.message || defaultMessage,
      defaultCode,
      { originalError: error.name, originalStack: error.stack },
      false,
      []
    );
  }

  return new ClaudeKitError(
    defaultMessage,
    defaultCode,
    { unknownError: String(error) },
    false,
    []
  );
}
