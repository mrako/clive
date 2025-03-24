#!/usr/bin/env node

import { setupCLI } from './cli/index.js';

export async function main(): Promise<void> {
  setupCLI();
}

main().catch(console.error);
