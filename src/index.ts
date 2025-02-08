#!/usr/bin/env node

import dotenv from 'dotenv';
import { getCliveConfig } from './config.js';
import { runCommand, setupYargs } from './helpers.js';

dotenv.config();

const argv = setupYargs();
const owner = 'mrako';
const projectName = argv.projectName;
const templateName = argv.template;

(async function main(): Promise<void> {
  const configData = getCliveConfig(owner, templateName);
  console.log('Parsed YAML configuration:', configData);

  // ...existing code...
})();
