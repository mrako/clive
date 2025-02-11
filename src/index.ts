#!/usr/bin/env node

import dotenv from 'dotenv';
import { getCliveConfig } from './config.js';
import { ICliArgs, runCommand, setupYargs } from './helpers.js';

dotenv.config();

export async function main(): Promise<void> {
  const argv = setupYargs() as ICliArgs;
  const owner = 'mrako';
  const projectName = argv.projectName;
  const templateName = argv.template;

  const configData = getCliveConfig(owner, templateName);
  // console.log('Parsed YAML configuration:', configData);

  runCommand(`gh repo create ${projectName} --template ${templateName} --public`);
  runCommand(`gh repo clone ${projectName}`);
  // process.chdir(projectName);
}

main().catch(console.error);
