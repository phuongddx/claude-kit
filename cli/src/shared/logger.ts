import * as p from '@clack/prompts';

export const logger = {
  info(message: string): void {
    p.log.info(message);
  },

  success(message: string): void {
    p.log.success(message);
  },

  warn(message: string): void {
    p.log.warning(message);
  },

  error(message: string): void {
    p.log.error(message);
  },

  step(message: string): void {
    p.log.step(message);
  }
};
