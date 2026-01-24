/** Kit metadata stored in project */
export interface KitMetadata {
  cliVersion: string;
  kitPath: string;
  initializedAt: string;
}

/** File manifest entry */
export interface ManifestEntry {
  path: string;
  size: number;
  hash?: string;
}

/** Kit manifest */
export interface KitManifest {
  version: string;
  files: ManifestEntry[];
}

/** CLI command options */
export interface InitOptions {
  force?: boolean;
}

export interface NewOptions {
  force?: boolean;
}

/** Update command options */
export interface UpdateOptions {
  force?: boolean;
}
