#!/usr/bin/env bun
import { createCli } from '../src/cli/cli-config.js';

const cli = createCli();
cli.parse();
