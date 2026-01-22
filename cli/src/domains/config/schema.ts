import { z } from 'zod';

/** Kit metadata schema */
export const kitMetadataSchema = z.object({
  cliVersion: z.string(),
  kitPath: z.string(),
  initializedAt: z.string()
});

/** Kit manifest schema */
export const kitManifestSchema = z.object({
  version: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      size: z.number(),
      hash: z.string().optional()
    })
  )
});

/** Type exports */
export type KitMetadataSchema = z.infer<typeof kitMetadataSchema>;
export type KitManifestSchema = z.infer<typeof kitManifestSchema>;
